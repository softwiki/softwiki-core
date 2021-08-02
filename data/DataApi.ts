import Queue from "../Queue";
import { Note, NoteModel, NoteProperties, Tag, TagModel, TagProperties } from "../models";
import DataProvider from "./DataProvider";
import JsonDataProvider from "./JsonDataProvider";
import Event from "../services/EventService";
import { Project, ProjectModel, ProjectProperties } from "../models/Project";

export enum DataEvent
{
	NoteCreated = "Notes.Created",
	NotesUpdated = "Notes.Updated",
	TagsUpdated = "Tags.Updated",
	ProjectsUpdated = "Projects.Updated"
}

export class DataApiClass
{
	private cache: {notes: NoteModel[], tags: TagModel[], projects: ProjectModel[]}
		= {notes: [], tags: [], projects: []}

	private queue: Queue

	constructor(private dataProvider: DataProvider)
	{
		this.queue = new Queue();
	}

	public async Setup(): Promise<void>
	{
		await this.dataProvider.Setup();
		this.cache.notes = await this.dataProvider.GetNotes();
		this.cache.tags = await this.dataProvider.GetTags();
		this.cache.projects = await this.dataProvider.GetProjects();
	}

	// Notes

	public CreateNote(properties: NoteProperties): Promise<void>
	{
		return new Promise((resolve, reject) => 
		{
			this.queue.Add(async () => 
			{ 
				const newlyCreatedNote = await this.dataProvider.CreateNote(properties);
				this.cache.notes.push(newlyCreatedNote);
				Event.Run(DataEvent.NotesUpdated);
				Event.Run(DataEvent.NoteCreated, {note: new Note(newlyCreatedNote, this)});
				resolve();
			});
		});
	}

	public GetNotes(): Note[]
	{
		const notes = this.cache.notes.map((noteModel: NoteModel) => new Note(noteModel, this));
		return notes;
	}
	
	public DeleteNote(note: Note): void
	{
		this.queue.Add(async () => { this.dataProvider.DeleteNote(note.GetModel());});
		const index = this.GetNoteModelIndexInCache(note);
		if (index !== -1)
			this.cache.notes.splice(index, 1);
		Event.Run(DataEvent.NotesUpdated);
	}

	public UpdateNote(note: Note): void
	{
		this.queue.Add(async () => { await this.dataProvider.UpdateNote(note.GetModel());});

		this.cache.notes[this.GetNoteModelIndexInCache(note)] = note.GetModel();
		Event.Run(DataEvent.NotesUpdated);
	}

	public RemoveTagFromNote(note: Note, tag: Tag): Note
	{
		this.queue.Add(async () => { this.dataProvider.RemoveTagFromNote(note.GetModel(), tag);});
		const noteModel = this.GetNoteModelInCache(note);
		if (!noteModel)
			return note; // [TODO] Handle error if note doesn't exist instead of returning the original note

		const tagIndex = noteModel.tags.indexOf(tag.Id());
		if (tagIndex !== -1)
			noteModel.tags.splice(tagIndex, 1);

		Event.Run(DataEvent.NotesUpdated);

		return new Note(noteModel, this);
	}

	public AddTagToNote(note: Note, tag: Tag): Note
	{
		this.queue.Add(async () => { this.dataProvider.AddTagToNote(note.GetModel(), tag);});
		const noteModel = this.GetNoteModelInCache(note);
		if (!noteModel)
			return note; // [TODO] Handle error if note doesn't exist instead of returning the original note

		noteModel.tags.push(tag.Id());

		Event.Run(DataEvent.NotesUpdated);
		return new Note(noteModel, this);
	}

	// Tags

	public async CreateTag(properties: TagProperties): Promise<void>
	{
		this.queue.Add(async () => 
		{ 
			const newlyCreatedTag = await this.dataProvider.CreateTag(properties);
			this.cache.tags.push(newlyCreatedTag);
			Event.Run(DataEvent.NotesUpdated);
		});
	}

	public GetTags(): Tag[]
	{
		const tags = this.cache.tags.map((tagModel: TagModel) => new Tag(tagModel));
		return tags;
	}

	public DeleteTag(tag: Tag): void
	{
		this.queue.Add(async () => { this.dataProvider.DeleteTag(tag.GetModel());});
		const index = this.GetTagModelIndexInCache(tag);
		if (index !== -1)
			this.cache.tags.splice(index, 1);

		// [TODO] Delete tag on notes
		Event.Run(DataEvent.NotesUpdated);
	}

	public UpdateTag(tag: Tag): Tag
	{
		this.queue.Add(async () => { this.dataProvider.UpdateTag(tag.GetModel());});
		this.cache.tags[this.GetTagModelIndexInCache(tag)] = tag.GetModel();
		Event.Run(DataEvent.NotesUpdated);
		return new Tag(tag.GetModel());
	}

	// Projects

	public async CreateProject(properties: ProjectProperties): Promise<void>
	{
		this.queue.Add(async () => 
		{
			const newlyCreateProject = await this.dataProvider.CreateProject(properties);
			this.cache.projects.push(newlyCreateProject);
			Event.Run(DataEvent.ProjectsUpdated);
		});
	}

	public GetProjects(): Project[]
	{
		const projects = this.cache.projects.map((projectModel: ProjectModel) => new Project(projectModel));
		return projects;
	}

	public DeleteProject(project: Project): void
	{
		this.queue.Add(async () => { this.dataProvider.DeleteProject(project.GetModel());});
		const index = this.GetProjectModelIndexInCache(project);
		if (index !== -1)
			this.cache.projects.splice(index, 1);

		// [TODO] Delete projects on notes
		Event.Run(DataEvent.ProjectsUpdated);
	}

	public UpdateProject(project: Project): Project
	{
		this.queue.Add(async () => { this.dataProvider.UpdateProject(project.GetModel());});
		this.cache.projects[this.GetProjectModelIndexInCache(project)] = project.GetModel();
		Event.Run(DataEvent.NotesUpdated);
		return new Project(project.GetModel());
	}

	private GetNoteModelIndexInCache(note: Note): number
	{
		return this.cache.notes.findIndex((noteModelCache: NoteModel) => noteModelCache.id === note.Id());
	}

	private GetNoteModelInCache(note: Note): NoteModel | undefined
	{
		return this.cache.notes.find((noteModelCache: NoteModel) => noteModelCache.id === note.Id());
	}

	private GetTagModelIndexInCache(tag: Tag): number
	{
		return this.cache.tags.findIndex((tagModelCache: TagModel) => tagModelCache.id === tag.Id());
	}

	private GetTagModelInCache(tag: Tag): TagModel | undefined
	{
		return this.cache.tags.find((tagModelCache: TagModel) => tagModelCache.id === tag.Id());
	}

	private GetProjectModelIndexInCache(project: Project): number
	{
		return this.cache.projects.findIndex((projectModelCache: ProjectModel) => projectModelCache.id === project.Id());
	}
}

export default new DataApiClass(new JsonDataProvider());