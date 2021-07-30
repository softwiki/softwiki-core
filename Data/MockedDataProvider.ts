import { NoteModel, Note, Tag, TagModel, TagProperties, NoteProperties } from "../Models";
import DataProvider from "./DataProvider";

import { WriteFile, ReadFile } from "SoftWiki-Core"
import { ProjectModel, ProjectProperties } from "../Models/Project";

export interface ICollections
{
	notes: NoteModel[]
	tags: TagModel[]
	projects: ProjectModel[]
}

const Collections = {
	Notes: "notes",
	Tags: "tags",
	projects: "projects"
}

export default class FakeDataProvider extends DataProvider
{
	collections: ICollections = {notes: [], tags: [], projects: []}

	nextId: number = 0

	constructor(fakeCollections: ICollections)
	{
		super()
		this.collections = fakeCollections
	}

	public async Setup() : Promise<void> {}

	public async CreateNote(properties: NoteProperties) : Promise<NoteModel>
	{
		this.nextId++
		return {...properties, id: this.nextId.toString(), custom: {}}
	}

	public async GetNotes() : Promise<NoteModel[]>
	{
		return this.collections.notes
	}

	public async DeleteNote(note: NoteModel) : Promise<void> {}
	public async UpdateNote(note: NoteModel) : Promise<void> {}
	public async RemoveTagFromNote(note: NoteModel, tag: Tag) : Promise<void> {}
	public async AddTagToNote(note: NoteModel, tag: Tag) : Promise<void> {}

	public async CreateTag(document: TagProperties) : Promise<TagModel>
	{
		this.nextId++
		return {...document, id: this.nextId.toString(), custom: {}}
	}

	public async GetTags() : Promise<TagModel[]>
	{
		return this.collections.tags
	}

	public async DeleteTag(tag: TagModel) : Promise<void> {}
	public async UpdateTag(tag: TagModel) : Promise<void> {}

	public async CreateProject(document: ProjectProperties) : Promise<ProjectModel>
	{
		this.nextId++
		return {...document, id: this.nextId.toString(), custom: {}}
	}

	public async GetProjects() : Promise<ProjectModel[]>
	{
		return this.collections.projects
	}

	public async DeleteProject(tag: ProjectModel) : Promise<void> {}
	public async UpdateProject(tag: ProjectModel) : Promise<void> {}

}