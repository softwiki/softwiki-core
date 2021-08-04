/* eslint @typescript-eslint/no-unused-vars: off */

import { NoteModel, Tag, TagModel, TagProperties, NoteProperties } from "../models";
import DataProvider from "./DataProvider";
import { ProjectModel, ProjectProperties } from "../models/Project";

export interface ICollections
{
	notes: NoteModel[]
	tags: TagModel[]
	projects: ProjectModel[]
}

const Collections = {
	notes: "notes",
	tags: "tags",
	projects: "projects"
};

export default class FakeDataProvider extends DataProvider
{
	collections: ICollections = {notes: [], tags: [], projects: []}

	nextId = 0;

	constructor(fakeCollections: ICollections)
	{
		super();
		this.collections = fakeCollections;
	}

	public async setup(): Promise<void> {}

	public async createNote(properties: NoteProperties): Promise<NoteModel>
	{
		this.nextId++;
		return {...properties, id: this.nextId.toString(), custom: {}};
	}

	public async getNotes(): Promise<NoteModel[]>
	{
		return this.collections.notes;
	}

	public async deleteNote(note: NoteModel): Promise<void> {}
	public async updateNote(note: NoteModel): Promise<void> {}
	public async removeTagFromNote(note: NoteModel, tag: Tag): Promise<void> {}
	public async addTagToNote(note: NoteModel, tag: Tag): Promise<void> {}

	public async createTag(document: TagProperties): Promise<TagModel>
	{
		this.nextId++;
		return {...document, id: this.nextId.toString(), custom: {}};
	}

	public async getTags(): Promise<TagModel[]>
	{
		return this.collections.tags;
	}

	public async deleteTag(tag: TagModel): Promise<void> {}
	public async updateTag(tag: TagModel): Promise<void> {}

	public async createProject(document: ProjectProperties): Promise<ProjectModel>
	{
		this.nextId++;
		return {...document, id: this.nextId.toString(), custom: {}};
	}

	public async getProjects(): Promise<ProjectModel[]>
	{
		return this.collections.projects;
	}

	public async deleteProject(tag: ProjectModel): Promise<void> {}
	public async updateProject(tag: ProjectModel): Promise<void> {}
}