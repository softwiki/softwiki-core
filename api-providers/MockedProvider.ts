/* eslint @typescript-eslint/no-unused-vars: off */

import { TagData, NoteData } from "../models";
import Api, { NoteApiData, ProjectApiData, TagApiData } from "./Api";
import { ProjectData } from "../models/Project";

export interface ICollections
{
	notes: NoteApiData[]
	tags: TagApiData[]
	projects: ProjectApiData[]
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

	public async createProject(document: ProjectData): Promise<ProjectApiData>
	{
		this.nextId++;
		return {...document, id: this.nextId.toString()};
	}

	public async getProjects(): Promise<ProjectApiData[]>
	{
		return this.collections.projects;
	}

	public async deleteProject(id: string): Promise<void> {}
	public async updateProject(id: string, data: ProjectApiData): Promise<void> {}
}