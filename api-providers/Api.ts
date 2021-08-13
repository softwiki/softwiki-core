import SoftWikiClient from "../SoftWikiClient";
import { TagData as TagData, NoteData as NoteData} from "../models";
import { ProjectData as ProjectData } from "../models/Project";

export interface ApiObjectBase
{
	id: string
}

export interface NoteApiData extends ApiObjectBase, NoteData {}
export interface TagApiData extends ApiObjectBase, TagData {}
export interface ProjectApiData extends ApiObjectBase, ProjectData {}

export default abstract class Api
{
	public abstract createNote(data: NoteData): Promise<NoteApiData>
	public abstract getNotes(): Promise<NoteApiData[]>
	public abstract deleteNote(id: string): Promise<void>
	public abstract updateNote(id: string, data: NoteData): Promise<void>
	public abstract removeTagFromNote(noteId: string, tagId: string): Promise<void>
	public abstract addTagToNote(noteId: string, tagId: string): Promise<void>

	public abstract createTag(data: TagData): Promise<TagApiData>
	public abstract getTags(): Promise<TagApiData[]>
	public abstract deleteTag(id: string): Promise<void>
	public abstract updateTag(id: string, data: TagData): Promise<void>

	public abstract createProject(data: ProjectData): Promise<ProjectApiData>
	public abstract getProjects(): Promise<ProjectApiData[]>
	public abstract deleteProject(id: string): Promise<void>
	public abstract updateProject(id: string, data: ProjectData): Promise<void>

	public client: SoftWikiClient = {} as SoftWikiClient
}