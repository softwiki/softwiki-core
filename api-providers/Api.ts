import SoftWikiClient from "../SoftWikiClient";
import { TagData as TagData, NoteData as NoteData} from "../models";
import { ProjectData as ProjectData } from "../models/Project";

export interface ApiObjectBase
{
	id: string
}

export interface ApiNote extends ApiObjectBase, NoteData {}
export interface ApiTag extends ApiObjectBase, TagData {}
export interface ApiProject extends ApiObjectBase, ProjectData {}

export default abstract class Api
{
	public abstract createNote(data: NoteData): Promise<ApiNote>
	public abstract getNotes(): Promise<ApiNote[]>
	public abstract deleteNote(id: string): Promise<void>
	public abstract updateNote(id: string, data: NoteData): Promise<void>
	public abstract removeTagFromNote(noteId: string, tagId: string): Promise<void>
	public abstract addTagToNote(noteId: string, tagId: string): Promise<void>

	public abstract createTag(data: TagData): Promise<ApiTag>
	public abstract getTags(): Promise<ApiTag[]>
	public abstract deleteTag(id: string): Promise<void>
	public abstract updateTag(id: string, data: TagData): Promise<void>

	public abstract createProject(data: ProjectData): Promise<ApiProject>
	public abstract getProjects(): Promise<ApiProject[]>
	public abstract deleteProject(id: string): Promise<void>
	public abstract updateProject(id: string, data: ProjectData): Promise<void>

	public client: SoftWikiClient = {} as SoftWikiClient
}