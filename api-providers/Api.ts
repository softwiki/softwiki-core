import SoftWikiClient from "../SoftWikiClient";
import { TagData as TagData, NoteData as NoteData} from "../models";
import { CategoryData as CategoryData } from "../models/Category";

export interface ApiObjectBase
{
	id: string
}

export interface NoteApiData extends ApiObjectBase, NoteData {}
export interface TagApiData extends ApiObjectBase, TagData {}
export interface CategoryApiData extends ApiObjectBase, CategoryData {}

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

	public abstract createCategory(data: CategoryData): Promise<CategoryApiData>
	public abstract getCategories(): Promise<CategoryApiData[]>
	public abstract deleteCategory(id: string): Promise<void>
	public abstract updateCategory(id: string, data: CategoryData): Promise<void>

	public client: SoftWikiClient = {} as SoftWikiClient
}