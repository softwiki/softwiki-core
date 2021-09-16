/* eslint @typescript-eslint/no-unused-vars: off */

import { TagProperties, NoteProperties } from "../structures";
import AbstractDataProvider, { NoteModel, CategoryModel, TagModel } from "./AbstractDataProvider";
import { CategoryProperties } from "../structures/Category";

export interface ICollections
{
	notes: NoteModel[]
	tags: TagModel[]
	categories: CategoryModel[]
}

export default class FakeDataProvider extends AbstractDataProvider {
	collections: ICollections = {notes: [], tags: [], categories: []}

	nextId = 0;

	constructor(fakeCollections: ICollections) {
		super();
		this.collections = fakeCollections;
	}

	public async setup(): Promise<void> {}

	public async createNote(properties: NoteProperties): Promise<NoteModel> {
		this.nextId++;
		return {...properties, id: this.nextId.toString()};
	}

	public async getNotes(): Promise<NoteModel[]> {
		return this.collections.notes;
	}

	public async deleteNote(id: string): Promise<void> {}
	public async updateNote(id: string, data: NoteModel): Promise<void> {}
	public async removeTagFromNote(noteId: string, tagId: string): Promise<void> {}
	public async addTagToNote(id: string, tagId: string): Promise<void> {}

	public async createTag(document: TagProperties): Promise<TagModel> {
		this.nextId++;
		return {...document, id: this.nextId.toString()};
	}

	public async getTags(): Promise<TagModel[]> {
		return this.collections.tags;
	}

	public async deleteTag(id: string): Promise<void> {}
	public async updateTag(id: string, data: TagModel): Promise<void> {}

	public async createCategory(document: CategoryProperties): Promise<CategoryModel> {
		this.nextId++;
		return {...document, id: this.nextId.toString()};
	}

	public async getCategories(): Promise<CategoryModel[]> {
		return this.collections.categories;
	}

	public async deleteCategory(id: string): Promise<void> {}
	public async updateCategory(id: string, data: CategoryModel): Promise<void> {}
}