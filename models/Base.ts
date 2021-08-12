import Api, { ApiNote, ApiProject, ApiTag } from "../api-providers/Api";
import { SoftWikiClient } from "..";
import { Note } from "./Note";
import { Project, Tag } from ".";

export class Base
{
	protected _id: string
	protected _client: SoftWikiClient
	protected _api: Api

	constructor(id: string, client: SoftWikiClient)
	{
		this._id = id;
		this._client = client;
		this._api = client.getApi();
	}

	public getId(): string 
	{
		return this._id; 
	}

	protected _cacheAndReturnNote(data: ApiNote): Note
	{
		const note = new Note(data, this._client);
		this._client.cache.notes[note.getId()] = note;
		return note;
	}

	protected _cacheAndReturnTag(data: ApiTag): Tag
	{
		const tag = new Tag(data, this._client);
		this._client.cache.tags[tag.getId()] = tag;
		return tag;
	}

	protected _cacheAndReturnProject(data: ApiProject): Project
	{
		const project = new Project(data, this._client);
		this._client.cache.projects[project.getId()] = project;
		return project;
	}
}