import { SoftWikiApi } from "../SoftWikiApi";
import { Note, ObjectReference } from "./Notes";

export interface ProjectProperties
{
	name: string
}

export interface ProjectModel extends ProjectProperties, ObjectReference {}

export class Project
{
	private _properties: ProjectProperties
	private _objectRef: ObjectReference
	private _api: SoftWikiApi

	constructor(properties: ProjectModel, api: SoftWikiApi)
	{
		this._properties = {
			name: properties.name
		};

		this._objectRef = {
			id: properties.id,
			custom: properties.custom
		};

		this._api = api;
	}

	public setName(name: string): void
	{
		this._properties.name = name;
		this._api.updateProject(this);
	}

	public getName(): string
	{
		return this._properties.name;
	}

	public getNoteCount(): number // [TODO] Optimize or find another way
	{
		let count = 0;
		const notes = this._api.getNotes();
		notes.forEach((note: Note) => 
		{
			if (note.hasProject(this))
				count++;
		});
		return count;
	}

	public getId(): string 
	{
		return this._objectRef.id; 
	}

	public delete(): void
	{
		this._api.deleteProject(this);
	}

	public getModel(): ProjectModel
	{
		return {...this._properties, ...this._objectRef};
	}
}