import { Tag } from "./Tag";
import { DataEvent, SoftWikiClient } from "../SoftWikiClient";
import { Category } from "./Category";
import { NoteModel } from "../data-providers/AbstractDataProvider";
import { Base } from "./Base";

export interface NoteProperties
{
	title: string
	content: string
	tagsId: string[]
	categoryId: string | undefined
}

export class Note extends Base {
	private _data: NoteProperties

	constructor(data: NoteModel, client: SoftWikiClient) {
		super(data.id, client);
		this._data = {title: data.title, content: data.content, tagsId: [...data.tagsId], categoryId: data.categoryId};
	}

	public async setTitle(title: string): Promise<void> {
		await this._api.updateNote(this._id, {...this._data, title});
		this._data.title = title;
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}

	public async setContent(content: string): Promise<void> {
		await this._api.updateNote(this._id, {...this._data, content});
		this._data.content = content;
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}
	
	public async setCategory(category: Category | null): Promise<void> {
		await this._api.updateNote(this._id, {...this._data, categoryId: category ? category.getId() : undefined});
		this._data.categoryId = category !== null ? category.getId() : undefined;
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}

	public async addTag(tag: Tag): Promise<void> {
		if (this._data.tagsId.indexOf(tag.getId()) !== -1)
			return ;
		await this._api.addTagToNote(this._id, tag.getId());
		this._data.tagsId.push(tag.getId());
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}

	public async removeTag(tag: Tag): Promise<void> {
		const index = this._data.tagsId.indexOf(tag.getId());
		if (index === -1)
			return ;
		await this._api.removeTagFromNote(this._id, tag.getId());
		this._data.tagsId.splice(index, 1);
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}

	public getTitle(): string {
		return this._data.title;
	}
	
	public getContent(): string {
		return this._data.content;
	}

	public getTags(): Tag[] {
		return this._data.tagsId.map((tagId: string) => this._client.cache.tags[tagId]).filter((tag: Tag) => tag !== undefined);
	}

	public belongToCategory(category: Category): boolean {
		return category.getId() == this._data.categoryId;
	}

	public getCategory(): Category | undefined {
		if (this._data.categoryId)
			return this._client.cache.categories[this._data.categoryId];
	}

	public hasTag(tag: Tag): boolean {
		return this._data.tagsId.indexOf(tag.getId()) !== -1;
	}

	public async delete(): Promise<void> {
		await this._api.deleteNote(this.getId());
		delete this._client.cache.notes[this._id];
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}
	
	public getDataCopy(): NoteProperties {
		return JSON.parse(JSON.stringify(this._data));
	}
}