/* eslint @typescript-eslint/no-unused-vars: off */

import { Tag, TagData, NoteData } from "../models";
import Api, { ApiNote, ApiProject, ApiTag } from "./Api";
import { ProjectData } from "../models/Project";

export interface ICollections
{
	notes: ApiNote[]
	tags: ApiTag[]
	projects: ApiProject[]
}

export default class FakeDataProvider extends Api
{
	collections: ICollections = {notes: [], tags: [], projects: []}

	nextId = 0;

	constructor(fakeCollections: ICollections)
	{
		super();
		this.collections = fakeCollections;
	}

	public async setup(): Promise<void> {}

	public async createNote(properties: NoteData): Promise<ApiNote>
	{
		this.nextId++;
		return {...properties, id: this.nextId.toString()};
	}

	public async getNotes(): Promise<ApiNote[]>
	{
		return this.collections.notes;
	}

	public async deleteNote(id: string): Promise<void> {}
	public async updateNote(id: string, data: ApiNote): Promise<void> {}
	public async removeTagFromNote(noteId: string, tagId: string): Promise<void> {}
	public async addTagToNote(id: string, tagId: string): Promise<void> {}

	public async createTag(document: TagData): Promise<ApiTag>
	{
		this.nextId++;
		return {...document, id: this.nextId.toString()};
	}

	public async getTags(): Promise<ApiTag[]>
	{
		return this.collections.tags;
	}

	public async deleteTag(id: string): Promise<void> {}
	public async updateTag(id: string, data: ApiTag): Promise<void> {}

	public async createProject(document: ProjectData): Promise<ApiProject>
	{
		this.nextId++;
		return {...document, id: this.nextId.toString()};
	}

	public async getProjects(): Promise<ApiProject[]>
	{
		return this.collections.projects;
	}

	public async deleteProject(id: string): Promise<void> {}
	public async updateProject(id: string, data: ApiProject): Promise<void> {}
}