import Queue from "./Queue";
import { Note, NoteModel, NoteProperties, Tag, TagModel, TagProperties } from "./models";
import Provider from "./providers/Provider";
import EventService from "./services/EventService";
import { Project, ProjectModel, ProjectProperties } from "./models/Project";

export enum DataEvent
{
	NoteCreated = "Notes.Created",
	NotesUpdated = "Notes.Updated",
	TagsUpdated = "Tags.Updated",
	ProjectsUpdated = "Projects.Updated"
}

interface SoftWikiApiParameters
{
	provider: Provider
}

export class SoftWikiApi
{
	private _cache: {notes: NoteModel[], tags: TagModel[], projects: ProjectModel[]}
		= {notes: [], tags: [], projects: []}

	private _queue: Queue
	private _events: EventService
	private _dataProvider

	constructor(args: SoftWikiApiParameters)
	{
		this._queue = new Queue();
		this._dataProvider = args.provider;
		this._events = new EventService();
	}

	public async setup(): Promise<void>
	{
		await this._dataProvider.setup();
		this._cache.notes = await this._dataProvider.getNotes();
		this._cache.tags = await this._dataProvider.getTags();
		this._cache.projects = await this._dataProvider.getProjects();
	}

	// Notes

	public createNote(properties: NoteProperties): Promise<void>
	{
		return new Promise((resolve) => 
		{
			this._queue.add(async () => 
			{ 
				const newlyCreatedNote = await this._dataProvider.createNote(properties);
				this._cache.notes.push(newlyCreatedNote);
				this._events.run(DataEvent.NotesUpdated);
				this._events.run(DataEvent.NoteCreated, {note: new Note(newlyCreatedNote, this)});
				resolve();
			});
		});
	}

	public getNotes(): Note[]
	{
		const notes = this._cache.notes.map((noteModel: NoteModel) => new Note(noteModel, this));
		return notes;
	}
	
	public deleteNote(note: Note): void
	{
		this._queue.add(async () => { this._dataProvider.deleteNote(note.getModel());});
		const index = this._getNoteModelIndexInCache(note);
		if (index !== -1)
			this._cache.notes.splice(index, 1);
		this._events.run(DataEvent.NotesUpdated);
	}

	public updateNote(note: Note): void
	{
		this._queue.add(async () => { await this._dataProvider.updateNote(note.getModel());});

		this._cache.notes[this._getNoteModelIndexInCache(note)] = note.getModel();
		this._events.run(DataEvent.NotesUpdated);
	}

	public removeTagFromNote(note: Note, tag: Tag): Note
	{
		this._queue.add(async () => { this._dataProvider.removeTagFromNote(note.getModel(), tag);});
		const noteModel = this._getNoteModelInCache(note);
		if (!noteModel)
			return note; // [TODO] Handle error if note doesn't exist instead of returning the original note

		const tagIndex = noteModel.tags.indexOf(tag.getId());
		if (tagIndex !== -1)
			noteModel.tags.splice(tagIndex, 1);

		this._events.run(DataEvent.NotesUpdated);

		return new Note(noteModel, this);
	}

	public addTagToNote(note: Note, tag: Tag): Note
	{
		this._queue.add(async () => { this._dataProvider.addTagToNote(note.getModel(), tag);});
		const noteModel = this._getNoteModelInCache(note);
		if (!noteModel)
			return note; // [TODO] Handle error if note doesn't exist instead of returning the original note

		noteModel.tags.push(tag.getId());

		this._events.run(DataEvent.NotesUpdated);
		return new Note(noteModel, this);
	}

	// Tags

	public async createTag(properties: TagProperties): Promise<void>
	{
		this._queue.add(async () => 
		{ 
			const newlyCreatedTag = await this._dataProvider.createTag(properties);
			this._cache.tags.push(newlyCreatedTag);
			this._events.run(DataEvent.NotesUpdated);
		});
	}

	public getTags(): Tag[]
	{
		const tags = this._cache.tags.map((tagModel: TagModel) => new Tag(tagModel, this));
		return tags;
	}

	public deleteTag(tag: Tag): void
	{
		this._queue.add(async () => { this._dataProvider.deleteTag(tag.getModel());});
		const index = this._getTagModelIndexInCache(tag);
		if (index !== -1)
			this._cache.tags.splice(index, 1);

		// [TODO] Delete tag on notes
		this._events.run(DataEvent.NotesUpdated);
	}

	public updateTag(tag: Tag): Tag
	{
		this._queue.add(async () => { this._dataProvider.updateTag(tag.getModel());});
		this._cache.tags[this._getTagModelIndexInCache(tag)] = tag.getModel();
		this._events.run(DataEvent.NotesUpdated);
		return new Tag(tag.getModel(), this);
	}

	// Projects

	public async createProject(properties: ProjectProperties): Promise<void>
	{
		this._queue.add(async () => 
		{
			const newlyCreateProject = await this._dataProvider.createProject(properties);
			this._cache.projects.push(newlyCreateProject);
			this._events.run(DataEvent.ProjectsUpdated);
		});
	}

	public getProjects(): Project[]
	{
		const projects = this._cache.projects.map((projectModel: ProjectModel) => new Project(projectModel, this));
		return projects;
	}

	public deleteProject(project: Project): void
	{
		this._queue.add(async () => { this._dataProvider.deleteProject(project.getModel());});
		const index = this._getProjectModelIndexInCache(project);
		if (index !== -1)
			this._cache.projects.splice(index, 1);

		// [TODO] Delete projects on notes
		this._events.run(DataEvent.ProjectsUpdated);
	}

	public updateProject(project: Project): Project
	{
		this._queue.add(async () => { this._dataProvider.updateProject(project.getModel());});
		this._cache.projects[this._getProjectModelIndexInCache(project)] = project.getModel();
		this._events.run(DataEvent.NotesUpdated);
		return new Project(project.getModel(), this);
	}

	public subscribe(name: string, id: string, handler: (args: unknown) => void): void
	{
		this._events.subscribe(name, id, handler);
	}

	public run(name: string, args: unknown = {}): void
	{
		this._events.run(name, args);
	}

	private _getNoteModelIndexInCache(note: Note): number
	{
		return this._cache.notes.findIndex((noteModelCache: NoteModel) => noteModelCache.id === note.getId());
	}

	private _getNoteModelInCache(note: Note): NoteModel | undefined
	{
		return this._cache.notes.find((noteModelCache: NoteModel) => noteModelCache.id === note.getId());
	}

	private _getTagModelIndexInCache(tag: Tag): number
	{
		return this._cache.tags.findIndex((tagModelCache: TagModel) => tagModelCache.id === tag.getId());
	}

	private _getTagModelInCache(tag: Tag): TagModel | undefined
	{
		return this._cache.tags.find((tagModelCache: TagModel) => tagModelCache.id === tag.getId());
	}

	private _getProjectModelIndexInCache(project: Project): number
	{
		return this._cache.projects.findIndex((projectModelCache: ProjectModel) => projectModelCache.id === project.getId());
	}
}

export default SoftWikiApi;