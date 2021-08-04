import { Tag } from "./Tags";
import { DataApiClass } from "../data/DataApi";
import { Project } from "./Project";

export interface ObjectReference
{
	id: string
	custom: any
}

export interface NoteProperties
{
	title: string
	content: string
	tags: string[]
	project: string | undefined
}

export interface NoteModel extends NoteProperties, ObjectReference {}

export class Note
{
	private _properties: NoteProperties
	private _objectRef: ObjectReference
	
	public isDeleted = false;

	constructor(properties: NoteModel, private _dataApi: DataApiClass)
	{
		this._properties = {
			title: properties.title,
			content: properties.content,
			tags: properties.tags,
			project: properties.project
		};

		this._objectRef = {
			id: properties.id,
			custom: properties.custom
		};
	}

	public setTitle(title: string): void
	{
		if (this._properties.title === title)
			return;
		this._properties.title = title;
		this._dataApi.updateNote(this);
	}

	public setContent(content: string): void
	{
		if (this._properties.content === content)
			return;
		this._properties.content = content;
		this._dataApi.updateNote(this);
	}

	public addTag(tag: Tag): Note
	{
		const updatedNote = this._dataApi.addTagToNote(this, tag);
		return updatedNote;
	}

	public removeTag(tag: Tag): Note
	{
		const updatedNote = this._dataApi.removeTagFromNote(this, tag);
		return updatedNote;
	}

	public getTitle(): string
	{
		return this._properties.title;
	}
	
	public getContent(): string 
	{
		return this._properties.content;
	}

	public getId(): string 
	{
		return this._objectRef.id; 
	}

	public getTags(): Tag[]
	{
		const tags = this._dataApi.getTags();

		const tagsObject: Tag[] = [];
		tags.forEach((tag: Tag) =>
		{
			if (this._properties.tags.indexOf(tag.getId()) !== -1)
				tagsObject.push(tag);
		});
		return tagsObject;
	}

	public hasProject(project: Project): boolean
	{
		return this._properties.project !== undefined && this._properties.project === project.getId();
	}

	public getProject(): Project | undefined
	{
		const projects = this._dataApi.getProjects();
		const project = projects.find((project: Project) => 
		{
			return project.getId() === this._properties.project; 
		});
		return project;
	}

	public hasTag(tag: Tag): boolean
	{
		return this._properties.tags.indexOf(tag.getId()) !== -1;
	}

	public delete(): void
	{
		this._dataApi.deleteNote(this);
		this.isDeleted = true;
	}

	public getModel(): NoteModel
	{
		return {...this._properties, ...this._objectRef};
	}
}