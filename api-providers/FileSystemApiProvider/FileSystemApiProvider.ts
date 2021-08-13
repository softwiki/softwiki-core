import { NoteData, TagData, ProjectData } from "../../models";
import Api, {NoteApiData, ProjectApiData, TagApiData} from "../Api";
import VirtualFileSystem from "./VirtualFileSystem";
import ProjectsApiHandler from "./ProjectsApiHandler";
import NotesApiHandler from "./NotesApiHandler";
import TagsApiHandler from "./TagsApiHandler";

export interface FileSystemApiCache
{
	notes: {[index: string]: {
		meta: any
	}}
	tagsDataByName: {[name: string]: TagApiData}
	notesIdByTagId: {[tagId: string]: string[]}
}

export default class FileSystemApiProvider extends Api
{
	private _basePath: string
	private _fs: any	
	private _cache: FileSystemApiCache
	private _virtualFileSystem: VirtualFileSystem
	
	private _notesApiHandler: NotesApiHandler
	private _tagsApiHandler: TagsApiHandler
	private _projectsApiHandler: ProjectsApiHandler

	constructor(basePath: string, fs: unknown)
	{
		super();
		this._basePath = basePath;
		this._fs = fs;
		this._cache = {notes: {}, tagsDataByName: {}, notesIdByTagId: {}};
		this._virtualFileSystem = new VirtualFileSystem(this._basePath, this._fs);

		this._notesApiHandler = new NotesApiHandler(this._virtualFileSystem, this._cache, this);
		this._tagsApiHandler = new TagsApiHandler(this._virtualFileSystem, this._cache, this);
		this._projectsApiHandler = new ProjectsApiHandler(this._virtualFileSystem, this._cache, this);
	}

	private _vfsInit = false;
	private async _initVirtualFileSystem(): Promise<void>
	{
		if (this._vfsInit)
			return ;
		await this._virtualFileSystem.init();
		this._vfsInit = true;
	}
	
	public async createNote(data: NoteData): Promise<NoteApiData>
	{
		return this._notesApiHandler.createNote(data);
	}
	
	public async getNotes(): Promise<NoteApiData[]>
	{
		await this._initVirtualFileSystem();
		await this.getTags();
		return this._notesApiHandler.getNotes();
	}

	public async deleteNote(id: string): Promise<void>
	{
		await this._notesApiHandler.deleteNote(id);
	}
	
	public async updateNote(id: string, data: NoteData): Promise<void>
	{
		await this._notesApiHandler.updateNote(id, data);
	}

	public async removeTagFromNote(noteId: string, tagId: string): Promise<void>
	{
		await this._notesApiHandler.removeTagFromNote(noteId, tagId);
	}

	public async addTagToNote(noteId: string, tagId: string): Promise<void>
	{
		await this._notesApiHandler.addTagToNote(noteId, tagId);
	}
	
	public async createTag(data: TagData): Promise<TagApiData>
	{
		return this._tagsApiHandler.createTag(data);
	}

	public async getTags(): Promise<TagApiData[]>
	{
		return this._tagsApiHandler.getTags();
	}

	public async deleteTag(id: string): Promise<void>
	{
		await this._tagsApiHandler.deleteTag(id);
	}

	public async updateTag(id: string, data: TagData): Promise<void>
	{
		await this._tagsApiHandler.updateTag(id, data);
	}

	public async createProject(data: ProjectData): Promise<ProjectApiData>
	{
		return this._projectsApiHandler.createProject(data);
	}

	public async getProjects(): Promise<ProjectApiData[]>
	{
		return this._projectsApiHandler.getProjects();
	}

	public async deleteProject(id: string): Promise<void>
	{
		await this._projectsApiHandler.deleteProject(id);
	}

	public async updateProject(id: string, data: ProjectData): Promise<void>
	{
		await this._projectsApiHandler.updateProject(id, data);
	}
}