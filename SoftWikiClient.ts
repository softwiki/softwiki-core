import { Note, NoteData } from "./models";
import { Tag, TagData } from "./models";
import { Project, ProjectData } from "./models";

import Api, { ApiNote, ApiProject, ApiTag } from "./api-providers/Api";
import { EventService } from "./services";

export enum DataEvent
{
	NoteCreated = "Notes.Created",
	NotesUpdated = "Notes.Updated",
	TagsUpdated = "Tags.Updated",
	ProjectsUpdated = "Projects.Updated"
}

interface SoftWikiApiParameters
{
	provider: Api
}

export interface ApiCache
{
	notes: {[index: string]: Note}
	tags: {[index: string]: Tag}
	projects: {[index: string]: Project}
}

export class SoftWikiClient
{
	private _events: EventService
	private _apiProvider: Api
	
	public cache: ApiCache = {notes: {}, tags: {}, projects: {}}

	constructor(args: SoftWikiApiParameters)
	{
		this._apiProvider = args.provider;
		this._events = new EventService();
		
		this._apiProvider.client = this;
	}

	public async init(): Promise<void>
	{
		await this.fetchNotes();
		await this.fetchTags();
		await this.fetchProjects();
	}

	public async createNote(properties: NoteData): Promise<Note>
	{
		const data = await this._apiProvider.createNote(properties);
		const note = this._apiResponseToNote(data);
		this._events.run(DataEvent.NotesUpdated); // [TODO] Probably removed in future
		this._events.run(DataEvent.NoteCreated, {note});
		return note;
	}

	public async fetchNotes(): Promise<Note[]>
	{
		this.cache.notes = {};
		const notesData = await this._apiProvider.getNotes();
		const notes = notesData.map((note: ApiNote) =>
		{
			return this._apiResponseToNote(note);
		});
		return notes;
	}

	public async createTag(properties: TagData): Promise<Tag>
	{
		const data = await this._apiProvider.createTag(properties);
		const tag = this._apiResponseToTag(data);
		this._events.run(DataEvent.NotesUpdated);
		return tag;
	}

	public async fetchTags(): Promise<Tag[]>
	{
		this.cache.tags = {};
		const tagsData = await this._apiProvider.getTags();
		const tags = tagsData.map((tag: ApiTag) =>
		{
			return this._apiResponseToTag(tag);
		});
		return tags;
	}

	public async createProject(properties: ProjectData): Promise<Project>
	{
		const data = await this._apiProvider.createProject(properties);
		const project = this._apiResponseToProject(data);
		this._events.run(DataEvent.ProjectsUpdated);
		return project;
	}

	public async fetchProjects(): Promise<Project[]>
	{
		const projectsData = await this._apiProvider.getProjects();
		const projects = projectsData.map((projec: ApiProject) =>
		{
			return this._apiResponseToProject(projec);
		});
		return projects;
	}

	public subscribe(name: string, id: string, handler: (args: unknown) => void): void
	{
		this._events.subscribe(name, id, handler);
	}

	public run(name: string, args: unknown = {}): void
	{
		this._events.run(name, args);
	}
	
	public getApi(): Api
	{
		return this._apiProvider;
	}

	get notes(): Note[]
	{
		return Object.values(this.cache.notes);
	}

	get tags(): Tag[]
	{
		return Object.values(this.cache.tags);
	}

	get projects(): Project[]
	{
		return Object.values(this.cache.projects);
	}
	
	private _apiResponseToNote(data: ApiNote): Note
	{
		this.cache.notes[data.id] = new Note(data, this);
		return new Note(data, this);
	}

	private _apiResponseToTag(data: ApiTag): Tag
	{
		this.cache.tags[data.id] = new Tag(data, this);
		return new Tag(data, this);
	}

	private _apiResponseToProject(data: ApiProject): Project
	{
		this.cache.projects[data.id] = new Project(data, this);
		return new Project(data, this);
	}
}

export default SoftWikiClient;