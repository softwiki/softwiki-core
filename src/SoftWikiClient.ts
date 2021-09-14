import { isCategorygModel, isNoteModel, isTagModel, Note, NoteProperties } from "./objects";
import { Tag, TagProperties } from "./objects";
import { Category, CategoryProperties } from "./objects";

import Api, { NoteModel, CategoryModel, TagModel } from "./api-providers/Api";
import { EventService } from "./services";
import { WrongDataStructure } from "./errors/ApiError";

export enum DataEvent
{
	NoteCreated = "Notes.Created",
	NotesUpdated = "Notes.Updated",
	TagsUpdated = "Tags.Updated",
	CategoriesUpdated = "Categories.Updated"
}

interface SoftWikiApiParameters
{
	provider: Api
}

export interface ClientCache
{
	notes: {[index: string]: Note}
	tags: {[index: string]: Tag}
	categories: {[index: string]: Category}
}

export class SoftWikiClient {
	private _events: EventService
	private _apiProvider: Api
	
	public cache: ClientCache = {notes: {}, tags: {}, categories: {}}

	constructor(args: SoftWikiApiParameters) {
		this._apiProvider = args.provider;
		this._events = new EventService();
		
		this._apiProvider.client = this;
	}

	public async init(): Promise<void> {
		await this.fetchNotes();
		await this.fetchTags();
		await this.fetchCategories();
	}

	public async createNote(properties: NoteProperties): Promise<Note> {
		const data = await this._apiProvider.createNote(properties);
		const note = this._apiResponseToNote(data);
		this._events.run(DataEvent.NotesUpdated); // [TODO] Probably removed in future
		this._events.run(DataEvent.NoteCreated, {note});
		return note;
	}

	public async fetchNotes(): Promise<Note[]> {
		this.cache.notes = {};
		const notesData = await this._apiProvider.getNotes();
		const notes = notesData.map((note: NoteModel) => {
			if (!isNoteModel(note))
				throw new WrongDataStructure("The api provider did not return a valid note model object");
			return this._apiResponseToNote(note);
		});
		return notes;
	}

	public async createTag(properties: TagProperties): Promise<Tag> {
		const data = await this._apiProvider.createTag(properties);
		const tag = this._apiResponseToTag(data);
		this._events.run(DataEvent.NotesUpdated);
		return tag;
	}

	public async fetchTags(): Promise<Tag[]> {
		this.cache.tags = {};
		const tagsData = await this._apiProvider.getTags();
		const tags = tagsData.map((tag: TagModel) => {
			if (!isTagModel(tag))
				throw new WrongDataStructure("The api provider did not return a valid tag model object");
			return this._apiResponseToTag(tag);
		});
		return tags;
	}

	public async createCategory(properties: CategoryProperties): Promise<Category> {
		const data = await this._apiProvider.createCategory(properties);
		const category = this._apiResponseToCategory(data);
		this._events.run(DataEvent.CategoriesUpdated);
		return category;
	}

	public async fetchCategories(): Promise<Category[]> {
		const categoriesData = await this._apiProvider.getCategories();
		const categories = categoriesData.map((category: CategoryModel) => {
			if (!isCategorygModel(category))
				throw new WrongDataStructure("The api provider did not return a valid note model object");
			return this._apiResponseToCategory(category);
		});
		return categories;
	}

	public subscribe(name: string, id: string, handler: (args: unknown) => void): void {
		this._events.subscribe(name, id, handler);
	}

	public run(name: string, args: unknown = {}): void {
		this._events.run(name, args);
	}
	
	public getApi(): Api {
		return this._apiProvider;
	}

	get notes(): Note[] {
		return Object.values(this.cache.notes);
	}

	get tags(): Tag[] {
		return Object.values(this.cache.tags);
	}

	get categories(): Category[] {
		return Object.values(this.cache.categories);
	}
	
	private _apiResponseToNote(data: NoteModel): Note {
		this.cache.notes[data.id] = new Note(data, this);
		return this.cache.notes[data.id];
	}

	private _apiResponseToTag(data: TagModel): Tag {
		this.cache.tags[data.id] = new Tag(data, this);
		return this.cache.tags[data.id];
	}

	private _apiResponseToCategory(data: CategoryModel): Category {
		this.cache.categories[data.id] = new Category(data, this);
		return this.cache.categories[data.id];
	}
}

export default SoftWikiClient;