/* eslint @typescript-eslint/naming-convention: off */

import { TagProperties, NoteProperties } from "../objects";
import Api, { NoteModel, CategoryModel, TagModel } from "./Api";
import { CategoryProperties } from "../objects/Category";

export default class RemoveProvider extends Api
{
	private _url: string

	constructor(url: string)
	{
		super();
		this._url = url;
	}

	private async _fetch(route: string, init?: RequestInit): Promise<Response>
	{
		return await fetch(`${this._url}${route}`, {
			method: init?.method ?? "GET",
			headers: {
				...init?.headers,
				"Accept": "application/json",
				"Content-Type": "application/json"
			},
			body: init?.body
		});
	}

	public async createNote(properties: NoteProperties): Promise<NoteModel>
	{
		const res = await this._fetch("/notes", {
			method: "POST",
			body: JSON.stringify(properties)
		});
		const data = await res.json();
		return {...properties, id: data.id};
	}

	public async getNotes(): Promise<NoteModel[]>
	{
		const res = await this._fetch("/notes", {
			method: "GET"
		});
		return res.json();
	}

	public async updateNote(id: string, properties: Partial<NoteModel>): Promise<void>
	{
		await this._fetch(`/notes/${id}`, {
			method: "POST",
			body: JSON.stringify(properties)
		});
	}

	public async deleteNote(id: string): Promise<void>
	{
		await this._fetch(`/notes/${id}`, {
			method: "DELETE"
		});
	}

	public async createTag(properties: TagProperties): Promise<TagModel>
	{
		const res = await this._fetch("/tags", {
			method: "POST",
			body: JSON.stringify(properties)
		});
		const data = await res.json();
		return {...properties, id: data.id};
	}

	public async getTags(): Promise<TagModel[]>
	{
		const res = await this._fetch("/tags", {
			method: "GET"
		});
		return res.json();
	}

	public async updateTag(id: string, properties: Partial<TagModel>): Promise<void>
	{
		await this._fetch(`/tags/${id}`, {
			method: "POST",
			body: JSON.stringify(properties)
		});
	}

	public async deleteTag(id: string): Promise<void>
	{
		const res = await this._fetch(`/tags/${id}`, {
			method: "DELETE"
		});
		return res.json();
	}

	public async addTagToNote(noteId: string, tagId: string): Promise<void>
	{
		await this._fetch(`/notes/${noteId}/tags`, {
			method: "POST",
			body: JSON.stringify({tagId})
		})
	}

	public async removeTagFromNote(noteId: string, tagId: string): Promise<void>
	{
		await this._fetch(`/notes/${noteId}/tags`, {
			method: "DELETE",
			body: JSON.stringify({tagId})
		})
	}

	public async createCategory(properties: CategoryProperties): Promise<CategoryModel>
	{
		const res = await this._fetch("/categories", {
			method: "POST",
			body: JSON.stringify(properties)
		});
		const data = await res.json();
		return {...properties, id: data.id};
	}

	public async getCategories(): Promise<CategoryModel[]>
	{
		const res = await this._fetch("/categories", {
			method: "GET"
		});
		return res.json();
	}

	public async updateCategory(id: string, properties: Partial<CategoryProperties>): Promise<void>
	{
		await this._fetch(`/categories/${id}`, {
			method: "POST",
			body: JSON.stringify(properties)
		});
	}

	public async deleteCategory(id: string): Promise<void>
	{
		await this._fetch(`/categories/${id}`, {
			method: "DELETE"
		});
	}
}