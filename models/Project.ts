import DataApi from "../data/DataApi";
import { Note, ObjectReference } from "./Notes";

export interface ProjectProperties
{
	name: string
}

export interface ProjectModel extends ProjectProperties, ObjectReference {}

export class Project
{
	private properties: ProjectProperties
	private objectRef: ObjectReference

	constructor(properties: ProjectModel)
	{
		this.properties = {
			name: properties.name
		};

		this.objectRef = {
			id: properties.id,
			custom: properties.custom
		};
	}

	public SetName(name: string): void
	{
		this.properties.name = name;
		DataApi.UpdateProject(this);
	}

	public GetName(): string
	{
		return this.properties.name;
	}

	public NoteCount(): number // [TODO] Optimize or find another way
	{
		let count = 0;
		const notes = DataApi.GetNotes();
		notes.forEach((note: Note) => 
		{
			if (note.HasProject(this))
				count++;
		});
		return count;
	}

	public Id(): string 
	{
		return this.objectRef.id; 
	}

	public Delete(): void
	{
		DataApi.DeleteProject(this);
	}

	public GetModel(): ProjectModel
	{
		return {...this.properties, ...this.objectRef};
	}
}