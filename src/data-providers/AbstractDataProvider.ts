import SoftWikiClient from "../SoftWikiClient";
import {TagProperties, NoteProperties, CategoryProperties} from "../structures";

export interface ModelBase
{
	id: string
	createdAt?: string
	modifiedAt?: string
}

export interface NoteModel extends ModelBase, NoteProperties {}
export interface TagModel extends ModelBase, TagProperties {}
export interface CategoryModel extends ModelBase, CategoryProperties {}

function hasBaseModelProperties(object: unknown): boolean
{
	return "id" in (object as any);
		//&& "createdAt" in (object as any)
		//&& "modifiedAt" in (object as any);
}

export function isNoteModel(object: unknown): object is NoteModel
{
	return hasBaseModelProperties(object)
		&& "title" in (object as any)
		&& "content" in (object as any)
		&& "tagsId" in (object as any)
		&& "categoryId" in (object as any);
}

export function isTagModel(object: unknown): object is TagModel
{
	return hasBaseModelProperties(object)
		&& "name" in (object as any)
		&& "color" in (object as any);
}

export function isCategorygModel(object: unknown): object is CategoryModel
{
	return hasBaseModelProperties(object)
		&& "name" in (object as any);
}

export default abstract class AbstractDataProvider
{
	public abstract createNote(data: NoteProperties): Promise<NoteModel>
	public abstract getNotes(): Promise<NoteModel[]>
	public abstract deleteNote(id: string): Promise<void>
	public abstract updateNote(id: string, data: Partial<NoteProperties>): Promise<void>
	public abstract removeTagFromNote(noteId: string, tagId: string): Promise<void>
	public abstract addTagToNote(noteId: string, tagId: string): Promise<void>

	public abstract createTag(data: TagProperties): Promise<TagModel>
	public abstract getTags(): Promise<TagModel[]>
	public abstract deleteTag(id: string): Promise<void>
	public abstract updateTag(id: string, data: Partial<TagProperties>): Promise<void>

	public abstract createCategory(data: CategoryProperties): Promise<CategoryModel>
	public abstract getCategories(): Promise<CategoryModel[]>
	public abstract deleteCategory(id: string): Promise<void>
	public abstract updateCategory(id: string, data: Partial<CategoryProperties>): Promise<void>

	public client: SoftWikiClient = {} as SoftWikiClient
}