import { NoteProperties, TagProperties, CategoryProperties } from "../../objects";
import Api, {NoteModel, CategoryModel, TagModel} from "../Api";
import VirtualFileSystem from "./VirtualFileSystem";
import CategoriesApiHandler from "./CategoriesApiHandler";
import NotesApiHandler from "./NotesApiHandler";
import TagsApiHandler from "./TagsApiHandler";

export interface FileSystemApiCache
{
	notes: {[index: string]: {
		meta: any
	}}
	tagsDataByName: {[name: string]: TagModel}
	notesIdByTagId: {[tagId: string]: string[]}
}

export default class FileSystemApiProvider extends Api {
	private _basePath: string
	private _fs: any	
	private _cache: FileSystemApiCache
	private _virtualFileSystem: VirtualFileSystem
	
	private _notesApiHandler: NotesApiHandler
	private _tagsApiHandler: TagsApiHandler
	private _categoriesApiHandler: CategoriesApiHandler

	constructor(basePath: string, fs: unknown) {
		super();
		this._basePath = basePath;
		this._fs = fs;
		this._cache = {notes: {}, tagsDataByName: {}, notesIdByTagId: {}};
		this._virtualFileSystem = new VirtualFileSystem(this._basePath, this._fs);

		this._notesApiHandler = new NotesApiHandler(this._virtualFileSystem, this._cache, this);
		this._tagsApiHandler = new TagsApiHandler(this._virtualFileSystem, this._cache, this);
		this._categoriesApiHandler = new CategoriesApiHandler(this._virtualFileSystem, this._cache, this);
	}

	private _vfsInit = false;
	private async _initVirtualFileSystem(): Promise<void> {
		if (this._vfsInit)
			return ;
		await this._virtualFileSystem.init();
		this._vfsInit = true;
	}
	
	public async createNote(data: NoteProperties): Promise<NoteModel> {
		return this._notesApiHandler.createNote(data);
	}
	
	public async getNotes(): Promise<NoteModel[]> {
		await this._initVirtualFileSystem();
		await this.getTags();
		return this._notesApiHandler.getNotes();
	}

	public async deleteNote(id: string): Promise<void> {
		await this._notesApiHandler.deleteNote(id);
	}
	
	public async updateNote(id: string, data: NoteProperties): Promise<void> {
		await this._notesApiHandler.updateNote(id, data);
	}

	public async removeTagFromNote(noteId: string, tagId: string): Promise<void> {
		await this._notesApiHandler.removeTagFromNote(noteId, tagId);
	}

	public async addTagToNote(noteId: string, tagId: string): Promise<void> {
		await this._notesApiHandler.addTagToNote(noteId, tagId);
	}
	
	public async createTag(data: TagProperties): Promise<TagModel> {
		return this._tagsApiHandler.createTag(data);
	}

	public async getTags(): Promise<TagModel[]> {
		return this._tagsApiHandler.getTags();
	}

	public async deleteTag(id: string): Promise<void> {
		await this._tagsApiHandler.deleteTag(id);
	}

	public async updateTag(id: string, data: TagProperties): Promise<void> {
		await this._tagsApiHandler.updateTag(id, data);
	}

	public async createCategory(data: CategoryProperties): Promise<CategoryModel> {
		return this._categoriesApiHandler.createCategory(data);
	}

	public async getCategories(): Promise<CategoryModel[]> {
		return this._categoriesApiHandler.getCategories();
	}

	public async deleteCategory(id: string): Promise<void> {
		await this._categoriesApiHandler.deleteCategory(id);
	}

	public async updateCategory(id: string, data: CategoryProperties): Promise<void> {
		await this._categoriesApiHandler.updateCategory(id, data);
	}
}