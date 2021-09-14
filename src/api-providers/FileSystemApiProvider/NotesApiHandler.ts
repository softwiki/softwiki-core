import { generateMarkdownWithMetadata, parseMarkdownMetadata } from "../../utils/markdown";
import { SoftWikiError } from "../../errors";
import { NoteProperties } from "../../objects";
import { NoteModel } from "../Api";
import ApiHandlerBase from "./ApiHandlerBase";
import VirtualFileSystem from "./VirtualFileSystem";
import FileSystemApiProvider, { FileSystemApiCache } from "./FileSystemApiProvider";
import { getForbiddenSequence } from "./helper";

export default class NotesApiHandler extends ApiHandlerBase {
	constructor(virtualFileSystem: VirtualFileSystem, cache: FileSystemApiCache, parent: FileSystemApiProvider) {
		super(virtualFileSystem, cache, parent);
	}
	
	public async createNote(data: NoteProperties): Promise<NoteModel> {
		const forbiddenSequence = getForbiddenSequence(data.title);
		if (forbiddenSequence)
			throw new SoftWikiError(`The character sequence "${forbiddenSequence}" is not allowed in title`);
		let directory = this._virtualFileSystem.notes;
		if (data.categoryId)
			directory = this._virtualFileSystem.notes.getDirectoryById(data.categoryId) ?? this._virtualFileSystem.notes;
		const file = directory.addFile(data.title);
		await file.write(data.content);
		this._cache.notes[file.id] = {meta: {}};

		return {...data, id: file.id};
	}
	
	public async getNotes(): Promise<NoteModel[]> {
		const notes = [];

		for (const [, directory] of Object.entries(this._virtualFileSystem.notes.directories)) {
			for (const [fileId, file] of Object.entries(directory.files)) {
				const source = await file.read();
				const md = parseMarkdownMetadata(source);
				const tagsId = await this._parseTagsMeta(md.meta["tags"]);

				this._cache.notes[fileId] = {meta: md.meta};

				notes.push({
					id: fileId,
					title: file.name,
					content: md.content,
					tagsId: tagsId,
					categoryId: directory.id
				});
			}
		}
		return notes;
	}

	public async deleteNote(id: string): Promise<void> {
		const file = this._virtualFileSystem.notes.getFileById(id);
		if (!file)
			throw new SoftWikiError("File with id " + id + " doesn't exist");
		await file.delete();
	}
	
	public async updateNote(id: string, data: NoteProperties): Promise<void> {
		const oldNote = this._clientCache.notes[id];
		if (oldNote === undefined)
			throw new SoftWikiError("Cannot find old note in cache when trying to update");

		const oldData = oldNote.getDataCopy();

		let file = this._virtualFileSystem.notes.getFileById(id);
		if (!file)
			throw new SoftWikiError("File with id " + id + " doesn't exist");

		if (oldData.title !== data.title) {
			const forbiddenSequence = getForbiddenSequence(data.title);
			if (forbiddenSequence)
				throw new SoftWikiError(`The character sequence "${forbiddenSequence}" is not allowed in title`);
			file = await file.rename(data.title);
		}

		if (oldData.categoryId !== data.categoryId) {
			const directoryId = data.categoryId ?? this._virtualFileSystem.notes.id;
			const directory = this._virtualFileSystem.notes.getDirectoryById(directoryId);
			if (!directory)
				throw new SoftWikiError("Directory with id " + directoryId + " doesn't exist");
			file = await file.moveTo(directory.id);
		}
		
		const content = generateMarkdownWithMetadata(data.content, {
			...this._cache.notes[id].meta,
			tags: this._tagDataToString(data.tagsId)
		});

		await file.write(content);
	}

	public async removeTagFromNote(noteId: string, tagId: string): Promise<void> {
		const note = this._clientCache.notes[noteId];
		const data = note.getDataCopy();
		const index = data.tagsId.indexOf(tagId);
		if (index !== -1) {
			data.tagsId.splice(index, 1);
		}
		const file = this._virtualFileSystem.notes.getFileById(noteId);
		await file?.write(generateMarkdownWithMetadata(data.content, {
			tags: this._tagDataToString(data.tagsId)
		}));
	}

	public async addTagToNote(noteId: string, tagId: string): Promise<void> {
		const note = this._clientCache.notes[noteId];
		const data = note.getDataCopy();
		data.tagsId.push(tagId);
		const file = this._virtualFileSystem.notes.getFileById(noteId);
		await file?.write(generateMarkdownWithMetadata(data.content, {
			tags: this._tagDataToString(data.tagsId)
		}));
	}

	private _tagDataToString(tags: string[]): string {
		return tags.map((tagId: string) => {
			return this._clientCache.tags[tagId].getName();
		}).join(", ");
	}
	
	private async _parseTagsMeta(tagsStr: string): Promise<string[]> {
		if (tagsStr === undefined || tagsStr.trim().length === 0)
			return [];
		const validTags: string[] = [];
		tagsStr.split(",").forEach((tagStr: string) => {
			tagStr = tagStr.trim();
			if (this._cache.tagsDataByName[tagStr])
				validTags.push(this._cache.tagsDataByName[tagStr].id);
		});
		return validTags;
	}
}