import { NoteModel, Tag, TagModel, TagProperties, NoteProperties } from "../models";
import { ProjectModel, ProjectProperties } from "../models/Project";

export default abstract class DataProvider
{
	public abstract setup(): Promise<void>

	public abstract createNote(properties: NoteProperties): Promise<NoteModel>
	public abstract getNotes(): Promise<NoteModel[]>
	public abstract deleteNote(note: NoteModel): Promise<void>
	public abstract updateNote(note: NoteModel): Promise<void>
	public abstract removeTagFromNote(note: NoteModel, tag: Tag): Promise<void>
	public abstract addTagToNote(note: NoteModel, tag: Tag): Promise<void>

	public abstract createTag(properties: TagProperties): Promise<TagModel>
	public abstract getTags(): Promise<TagModel[]>
	public abstract deleteTag(tag: TagModel): Promise<void>
	public abstract updateTag(tag: TagModel): Promise<void>

	public abstract createProject(properties: ProjectProperties): Promise<ProjectModel>
	public abstract getProjects(): Promise<ProjectModel[]>
	public abstract deleteProject(tag: ProjectModel): Promise<void>
	public abstract updateProject(tag: ProjectModel): Promise<void>
}