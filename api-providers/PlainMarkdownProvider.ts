import { generateMarkdownWithMetadata, parseMarkdownMetadata } from "softwiki-core/utils/markdown";
import { SoftWikiError } from "../errors";
import { NoteData, TagData, ProjectData, Tag } from "../models";
import Api, {ApiNote, ApiProject, ApiTag} from "./Api";
import VirtualFileSystem from "./VirtualFileSystem";

interface FileSystemApiCache
{
	notes: {[index: string]: {
		meta: any
	}}
	tagsByName: {[name: string]: ApiTag}

	fsdiscovery: boolean
}

export default class FileSystemApi extends Api
{
	private _basePath: string
	private _fs: any
	
	private _cache: FileSystemApiCache
	
	private _virtualFileSystem: VirtualFileSystem

	constructor(basePath: string, fs: unknown)
	{
		super();

		this._basePath = basePath;
		this._fs = fs;
		this._cache = {notes: {}, fsdiscovery: false, tagsByName: {}};
		this._virtualFileSystem = new VirtualFileSystem(this._basePath, this._fs);
	}

	private _vfsInit = false;
	private async _initVirtualFileSystem(): Promise<void>
	{
		if (this._vfsInit)
			return ;
		await this._virtualFileSystem.init();
		this._vfsInit = true;
	}

	public async createNote(data: NoteData): Promise<ApiNote>
	{
		const file = this._virtualFileSystem.addFile(data.title);
		await file.write(data.content);
		this._cache.notes[file.id] = {meta: {}};

		return {...data, id: file.id};
	}
	
	public async getNotes(): Promise<ApiNote[]>
	{
		await this.getTags();
		await this._initVirtualFileSystem();
		const notes = [];

		for (const [, directory] of Object.entries(this._virtualFileSystem.directories))
		{
			for (const [fileId, file] of Object.entries(directory.files))
			{
				const source = await this._fs.readFile(file.path, "utf8");
				const md = parseMarkdownMetadata(source);
				const tags = await this._parseTagsMeta(md.meta["tags"]);

				this._cache.notes[fileId] = {meta: md.meta};

				notes.push({
					id: fileId,
					title: file.name,
					content: md.content,
					tags: tags,
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
		const oldNote = this.client.cache.notes[id];
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
		const note = this.client.cache.notes[noteId];
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

	private _tagDataToString(tags: string[]): string
	{
		return tags.map((tagId: string) =>
		{
			return this.client.cache.tags[tagId].getName();
		}).join(", ");
	}

	public async addTagToNote(noteId: string, tagId: string): Promise<void>
	{
		const note = this.client.cache.notes[noteId];
		const data = note.getDataCopy();
		data.tags.push(tagId);
		const file = this._virtualFileSystem.getFileById(noteId);
		await file?.write(generateMarkdownWithMetadata(data.content, {
			tags: this._tagDataToString(data.tags)
		}));
	}

	public async createTag(data: TagData): Promise<ApiTag>
	{
		const tags = Object.values(this.client.cache.tags).map((tag: Tag) =>
		{
			return {name: tag.getName(), color: tag.getColor(), id: tag.getId()};
		});
		const newTag = {...data, id: Date.now().toString()};
		tags.push(newTag);
		this._cacheTag(newTag);
		await this._fs.writeFile(this._basePath + "/tags.json", JSON.stringify(tags, null, 4));
		return newTag;
	}

	public async getTags(): Promise<ApiTag[]>
	{
		const tagsData = JSON.parse(await this._fs.readFile(this._basePath + "/tags.json"));
		this._cacheTags(tagsData);
		return tagsData;
	}

	public async deleteTag(id: string): Promise<void>
	{
		const tags = Object.values(this.client.cache.tags).map((tag: Tag) =>
		{
			return {name: tag.getName(), color: tag.getColor(), id: tag.getId()};
		});
		const index = tags.findIndex((tag: ApiTag) => tag.id === id);
		if (index)
			tags.splice(index, 1);
		await this._fs.writeFile(this._basePath + "/tags.json", JSON.stringify(tags, null, 4));
	}

	private _cacheTags(tags: ApiTag[]): void
	{
		tags.forEach((tag: ApiTag) => this._cacheTag(tag));
	}

	private _cacheTag(tag: ApiTag): void
	{
		this._cache.tagsByName[tag.name] = tag;
	}

	public async updateTag(id: string, data: TagData): Promise<void>
	{
		const tags = Object.values(this.client.cache.tags).map((tag: Tag) =>
		{
			if (tag.getId() === id)
				return {...data, id};
			return {name: tag.getName(), color: tag.getColor(), id: tag.getId()};
		});
		this._cacheTag({...data, id});
		await this._fs.writeFile(this._basePath + "/tags.json", JSON.stringify(tags, null, 4));
	}

	public async createProject(data: ProjectData): Promise<ApiProject>
	{
		const directory = await this._virtualFileSystem.createDirectory(data.name);
		return {...data, id: directory.id};
	}

	public async getProjects(): Promise<ApiProject[]>
	{
		const projects = [];

		for (const [directoryId, directory] of Object.entries(this._virtualFileSystem.directories))
		{
			if (directory.name === ".")
				continue ;

			projects.push({
				id: directoryId,
				name: directory.name,
				notes: Object.keys(directory.files)
			});
		}
		return projects;
	}

	public async deleteProject(id: string): Promise<void>
	{
		const directory = this._virtualFileSystem.getDirectoryById(id);
		if (!directory)
			throw new SoftWikiError("Directory with id " + id + " doesn't exist");
		await directory.delete();
	}

	public async updateProject(id: string, data: ProjectData): Promise<void>
	{
		const directory = this._virtualFileSystem.getDirectoryById(id);
		if (!directory)
			throw new Error("Directory with id " + id + " doesn't exist");

		const project = this.client.cache.projects[id];
		if (!project)
		{
			throw new Error("Project with id " + id + " doesn't exist in cache");
		}

		const oldData = project.getDataCopy();
		if (oldData.name !== data.name)
		{
			await directory.rename(data.name);
		}
	}

	private async _parseTagsMeta(tagsStr: string): Promise<string[]>
	{
		if (tagsStr === undefined || tagsStr.trim().length === 0)
			return [];
		const validTags: string[] = [];
		tagsStr.split(",").forEach((tagStr: string) =>
		{
			if (this._cache.tagsByName[tagStr])
				validTags.push(this._cache.tagsByName[tagStr].id);
		});
		return validTags;
	}
}