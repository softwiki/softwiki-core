import { DataEvent, SoftWikiClient } from "../SoftWikiClient";
import { ApiProject } from "../api-providers/Api";
import { Note } from "./Note";
import { Base } from "./Base";

export interface ProjectData
{
	name: string
}

export class Project extends Base
{
	private _data: ProjectData

	constructor(data: ApiProject, client: SoftWikiClient)
	{
		super(data.id, client);
		this._data = data;
	}

	public async setName(name: string): Promise<void>
	{
		await this._api.updateProject(this._id, {...this._data, name});
		this._data.name = name;
		this._client.run(DataEvent.ProjectsUpdated, {project: this});
	}

	public getName(): string
	{
		return this._data.name;
	}

	public getNoteCount(): number
	{
		return this.getNotes().length;
	}

	public getNotes(): Note[]
	{
		return Object.values(this._client.cache.notes).filter((note: Note) => 
		{
			return note.belongToProject(this);
		});
	}

	public async delete(): Promise<void>
	{
		await this._api.deleteProject(this.getId());
		delete this._client.cache.projects[this._id];
		this._client.run(DataEvent.ProjectsUpdated, {project: this});
	}
	
	public getDataCopy(): ProjectData
	{
		return JSON.parse(JSON.stringify(this._data));
	}
}