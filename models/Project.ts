import DataApi from "../data/DataApi";
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

	constructor(properties: ProjectModel)
	{
		this._properties = {
			name: properties.name
		};

		this._objectRef = {
			id: properties.id,
			custom: properties.custom
		};
	}

	public setName(name: string): void
	{
		this._properties.name = name;
		DataApi.updateProject(this);
	}

	public getName(): string
	{
		return this._properties.name;
	}

	public getNoteCount(): number // [TODO] Optimize or find another way
	{
		let count = 0;
		const notes = DataApi.getNotes();
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
		DataApi.deleteProject(this);
	}

	public getModel(): ProjectModel
	{
		return {...this._properties, ...this._objectRef};
	}
}