import { generateMarkdownWithMetadata, parseMarkdownMetadata } from "../../utils/markdown";
import { SoftWikiError } from "../../errors";
import { NoteData } from "../../models";
import { NoteApiData } from "../Api";
import ApiHandlerBase from "./ApiHandlerBase";
import VirtualFileSystem from "./VirtualFileSystem";
import FileSystemApiProvider, { FileSystemApiCache } from "./FileSystemApiProvider";

export default class NotesApiHandler extends ApiHandlerBase
{
	constructor(virtualFileSystem: VirtualFileSystem, cache: FileSystemApiCache, parent: FileSystemApiProvider)
	{
		super(virtualFileSystem, cache, parent);
	}
	
	public async createNote(data: NoteData): Promise<NoteApiData>
	{
		const file = this._virtualFileSystem.addFile(data.title);
		await file.write(data.content);
		this._cache.notes[file.id] = {meta: {}};

		return {...data, id: file.id};
	}
	
	public async getNotes(): Promise<NoteApiData[]>
	{
		const notes = [];

		for (const [, directory] of Object.entries(this._virtualFileSystem.notes.directories))
		{
			for (const [fileId, file] of Object.entries(directory.files))
			{
				const source = await file.read();
				const md = parseMarkdownMetadata(source);
				const tagsId = await this._parseTagsMeta(md.meta["tags"]);

				this._cache.notes[fileId] = {meta: md.meta};

				notes.push({
					id: fileId,
					title: file.name,
					content: md.content,
					tags: tagsId,
					project: directory.id
				});
			}
		}
		return notes;
	}

	public async deleteNote(id: string): Promise<void>
	{
		const file = this._virtualFileSystem.getFileById(id);
		if (!file)
			throw new SoftWikiError("File with id " + id + " doesn't exist");
		await file.delete();
	}
	
	public async updateNote(id: string, data: NoteData): Promise<void>
	{
		const oldNote = this._clientCache.notes[id];
		if (oldNote === undefined)
			throw new SoftWikiError("Cannot find old note in cache when trying to update");

		const oldData = oldNote.getDataCopy();

		let file = this._virtualFileSystem.getFileById(id);
		if (!file)
			throw new SoftWikiError("File with id " + id + " doesn't exist");

		if (oldData.title !== data.title)
		{
			file = await file.rename(data.title);
		}

		if (oldData.project !== data.project)
		{
			const directoryId = data.project ?? this._virtualFileSystem.id;
			const directory = this._virtualFileSystem.getDirectoryById(directoryId);
			if (!directory)
				throw new SoftWikiError("Directory with id " + directoryId + " doesn't exist");
			file = await file.moveTo(directory.id);
		}
		
		const content = generateMarkdownWithMetadata(data.content, {
			...this._cache.notes[id].meta,
			tags: this._tagDataToString(data.tags)
		});

		await file.write(content);
	}

	public async removeTagFromNote(noteId: string, tagId: string): Promise<void>
	{
		const note = this._clientCache.notes[noteId];
		const data = note.getDataCopy();
		const index = data.tags.indexOf(tagId);
		if (index !== -1)
		{
			data.tags.splice(index, 1);
		}
		const file = this._virtualFileSystem.getFileById(noteId);
		await file?.write(generateMarkdownWithMetadata(data.content, {
			tags: this._tagDataToString(data.tags)
		}));
	}

	public async addTagToNote(noteId: string, tagId: string): Promise<void>
	{
		const note = this._clientCache.notes[noteId];
		const data = note.getDataCopy();
		data.tags.push(tagId);
		const file = this._virtualFileSystem.getFileById(noteId);
		await file?.write(generateMarkdownWithMetadata(data.content, {
			tags: this._tagDataToString(data.tags)
		}));
	}

	private _tagDataToString(tags: string[]): string
	{
		return tags.map((tagId: string) =>
		{
			return this._clientCache.tags[tagId].getName();
		}).join(", ");
	}
	
	private async _parseTagsMeta(tagsStr: string): Promise<string[]>
	{
		if (tagsStr === undefined || tagsStr.trim().length === 0)
			return [];
		const validTags: string[] = [];
		tagsStr.split(",").forEach((tagStr: string) =>
		{
			tagStr = tagStr.trim();
			if (this._cache.tagsDataByName[tagStr])
				validTags.push(this._cache.tagsDataByName[tagStr].id);
		});
		return validTags;
	}
}