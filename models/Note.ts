import { Tag } from "./Tag";
import { DataEvent, SoftWikiClient } from "../SoftWikiClient";
import { Project } from "./Project";
import { NoteApiData } from "../api-providers/Api";
import { Base } from "./Base";

export interface NoteData
{
	title: string
	content: string
	tags: string[]
	project: string | undefined
}

export class Note extends Base
{
	private _data: NoteData

	constructor(data: NoteApiData, client: SoftWikiClient)
	{
		super(data.id, client);
		this._data = {title: data.title, content: data.content, tags: [...data.tags], project: data.project};
	}

	public async setTitle(title: string): Promise<void>
	{
		await this._api.updateNote(this._id, {...this._data, title});
		this._data.title = title;
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}

	public async setContent(content: string): Promise<void>
	{
		await this._api.updateNote(this._id, {...this._data, content});
		this._data.content = content;
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}
	
	public async setProject(project: Project | null): Promise<void>
	{
		await this._api.updateNote(this._id, {...this._data, project: project ? project.getId() : undefined});
		this._data.project = project !== null ? project.getId() : undefined;
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}

	public async addTag(tag: Tag): Promise<void>
	{
		if (this._data.tags.indexOf(tag.getId()) !== -1)
			return ;
		await this._api.addTagToNote(this._id, tag.getId());
		this._data.tags.push(tag.getId());
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}

	public async removeTag(tag: Tag): Promise<void>
	{
		const index = this._data.tags.indexOf(tag.getId());
		if (index === -1)
			return ;
		await this._api.removeTagFromNote(this._id, tag.getId());
		this._data.tags.splice(index, 1);
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}

	public getTitle(): string
	{
		return this._data.title;
	}
	
	public getContent(): string 
	{
		return this._data.content;
	}

	public getTags(): Tag[]
	{
		return this._data.tags.map((tagId: string) => this._client.cache.tags[tagId]).filter((tag: Tag) => tag !== undefined);
	}

	public belongToProject(project: Project): boolean
	{
		return project.getId() == this._data.project;
	}

	public getProject(): Project | undefined
	{
		if (this._data.project)
			return this._client.cache.projects[this._data.project];
	}

	public hasTag(tag: Tag): boolean
	{
		return this._data.tags.indexOf(tag.getId()) !== -1;
	}

	public async delete(): Promise<void>
	{
		await this._api.deleteNote(this.getId());
		delete this._client.cache.notes[this._id];
		this._client.run(DataEvent.NotesUpdated, {note: this});
	}
	
	public getDataCopy(): NoteData
	{
		return JSON.parse(JSON.stringify(this._data));
	}
}