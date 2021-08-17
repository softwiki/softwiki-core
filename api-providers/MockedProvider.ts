/* eslint @typescript-eslint/no-unused-vars: off */

import { TagData, NoteData } from "../objects";
import Api, { NoteApiData, CategoryApiData, TagApiData } from "./Api";
import { CategoryData } from "../objects/Category";

export interface ICollections
{
	notes: NoteApiData[]
	tags: TagApiData[]
	categories: CategoryApiData[]
}

export default class FakeDataProvider extends Api
{
	collections: ICollections = {notes: [], tags: [], categories: []}

	nextId = 0;

	constructor(fakeCollections: ICollections)
	{
		super();
		this.collections = fakeCollections;
	}

	public async setup(): Promise<void> {}

	public async createNote(properties: NoteData): Promise<NoteApiData>
	{
		this.nextId++;
		return {...properties, id: this.nextId.toString()};
	}

	public async getNotes(): Promise<NoteApiData[]>
	{
		return this.collections.notes;
	}

	public async deleteNote(id: string): Promise<void> {}
	public async updateNote(id: string, data: NoteApiData): Promise<void> {}
	public async removeTagFromNote(noteId: string, tagId: string): Promise<void> {}
	public async addTagToNote(id: string, tagId: string): Promise<void> {}

	public async createTag(document: TagData): Promise<TagApiData>
	{
		this.nextId++;
		return {...document, id: this.nextId.toString()};
	}

	public async getTags(): Promise<TagApiData[]>
	{
		return this.collections.tags;
	}

	public async deleteTag(id: string): Promise<void> {}
	public async updateTag(id: string, data: TagApiData): Promise<void> {}

	public async createCategory(document: CategoryData): Promise<CategoryApiData>
	{
		this.nextId++;
		return {...document, id: this.nextId.toString()};
	}

	public async getCategories(): Promise<CategoryApiData[]>
	{
		return this.collections.categories;
	}

	public async deleteCategory(id: string): Promise<void> {}
	public async updateCategory(id: string, data: CategoryApiData): Promise<void> {}
}