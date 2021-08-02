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
	private properties: NoteProperties
	private objectRef: ObjectReference
	
	public isDeleted = false;

	constructor(properties: NoteModel, private dataApi: DataApiClass)
	{
		this.properties = {
			title: properties.title,
			content: properties.content,
			tags: properties.tags,
			project: properties.project
		};

		this.objectRef = {
			id: properties.id,
			custom: properties.custom
		};
	}

	public SetTitle(title: string): void
	{
		if (this.properties.title === title)
			return;
		this.properties.title = title;
		this.dataApi.UpdateNote(this);
	}

	public SetContent(content: string): void
	{
		if (this.properties.content === content)
			return;
		this.properties.content = content;
		this.dataApi.UpdateNote(this);
	}

	public AddTag(tag: Tag): Note
	{
		const updatedNote = this.dataApi.AddTagToNote(this, tag);
		return updatedNote;
	}

	public RemoveTag(tag: Tag): Note
	{
		const updatedNote = this.dataApi.RemoveTagFromNote(this, tag);
		return updatedNote;
	}

	public GetTitle(): string
	{
		return this.properties.title;
	}
	
	public GetContent(): string 
	{
		return this.properties.content;
	}

	public Id(): string 
	{
		return this.objectRef.id; 
	}

	public GetTags(): Tag[]
	{
		const tags = this.dataApi.GetTags();

		const tagsObject: Tag[] = [];
		tags.forEach((tag: Tag) =>
		{
			if (this.properties.tags.indexOf(tag.Id()) !== -1)
				tagsObject.push(tag);
		});
		return tagsObject;
	}

	public HasProject(project: Project): boolean
	{
		return this.properties.project !== undefined && this.properties.project === project.Id();
	}

	public GetProject(): Project | undefined
	{
		const projects = this.dataApi.GetProjects();
		const project = projects.find((project: Project) => 
		{
			return project.Id() === this.properties.project; 
		});
		return project;
	}

	public HasTag(tag: Tag): boolean
	{
		return this.properties.tags.indexOf(tag.Id()) !== -1;
	}

	public Delete(): void
	{
		this.dataApi.DeleteNote(this);
		this.isDeleted = true;
	}

	public GetModel(): NoteModel
	{
		return {...this.properties, ...this.objectRef};
	}
}