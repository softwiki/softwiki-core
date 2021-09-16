import AbstractDataProvider, { NoteModel, CategoryModel, TagModel } from "../data-providers/AbstractDataProvider";
import { SoftWikiClient } from "..";
import { Note } from "./Note";
import { Category, Tag } from ".";

export class Base {
	protected _id: string
	protected _client: SoftWikiClient
	protected _api: AbstractDataProvider

	constructor(id: string, client: SoftWikiClient) {
		this._id = id;
		this._client = client;
		this._api = client.getApi();
	}

	public getId(): string {
		return this._id; 
	}

	protected _cacheAndReturnNote(data: NoteModel): Note {
		const note = new Note(data, this._client);
		this._client.cache.notes[note.getId()] = note;
		return note;
	}

	protected _cacheAndReturnTag(data: TagModel): Tag {
		const tag = new Tag(data, this._client);
		this._client.cache.tags[tag.getId()] = tag;
		return tag;
	}

	protected _cacheAndReturnCategory(data: CategoryModel): Category {
		const category = new Category(data, this._client);
		this._client.cache.categories[category.getId()] = category;
		return category;
	}
}