import { NoteModel, Tag, TagModel, TagProperties, NoteProperties } from "../models";
import DataProvider from "./DataProvider";

import { WriteFile, ReadFile } from "../Files";
import { ProjectModel, ProjectProperties } from "../models/Project";

interface ICollections
{
	[index: string]: NoteModel[] | TagModel[] | ProjectModel[]
	notes: NoteModel[]
	tags: TagModel[]
	projects: ProjectModel[]
}

const Collections = {
	Notes: "notes",
	Tags: "tags",
	Projects: "projects"
};

export default class JsonDataProvider extends DataProvider
{
	collections: ICollections

	constructor()
	{
		super();

		this.collections = {
			notes: [],
			tags: [],
			projects: []
		};
	}

	public async Setup(): Promise<void>
	{
		try
		{
			const data = await ReadFile("db.json");
			this.collections = JSON.parse(data)	;
		}
		catch (e)
		{
			// Todo
		}
	}

	public async CreateNote(properties: NoteProperties): Promise<NoteModel>
	{
		const documentDB = this.CreateDocument(properties);
		const collection = this.GetCollection(Collections.Notes);

		collection.push(documentDB);
		await this.WriteDB();
		return documentDB as NoteModel;
	}

	public async GetNotes(): Promise<NoteModel[]>
	{
		return JSON.parse(JSON.stringify(this.GetCollection(Collections.Notes))); // Another way of cloning ?
	}

	public async DeleteNote(note: NoteModel): Promise<void>
	{
		const collection = this.GetCollection<NoteModel>(Collections.Notes);
		const index = this.GetIndexInCollectionByID(Collections.Notes, note.id);

		if (index !== -1)
		{
			collection.splice(index, 1);
			await this.WriteDB();
			return ;
		}
	}

	public async UpdateNote(note: NoteModel): Promise<void>
	{
		const collection = this.GetCollection<NoteModel>(Collections.Notes);
		const index = this.GetIndexInCollectionByID(Collections.Notes, note.id);
		
		if (index !== -1)
		{
			collection[index] = note;
			await this.WriteDB();
		}
	}
	
	public async RemoveTagFromNote(note: NoteModel, tag: Tag): Promise<void>
	{
		const collection = this.GetCollection<NoteModel>(Collections.Notes);
		const index = this.GetIndexInCollectionByID(Collections.Notes, note.id);
		const tagIndex = collection[index].tags.indexOf(tag.Id());

		collection[index].tags.splice(tagIndex, 1);
		await this.WriteDB();
	}

	public async AddTagToNote(note: NoteModel, tag: Tag): Promise<void>
	{
		const collection = this.GetCollection<NoteModel>(Collections.Notes);
		const index = this.GetIndexInCollectionByID(Collections.Notes, note.id);

		collection[index].tags.push(tag.Id());
		await this.WriteDB();
	}

	public async CreateTag(document: TagProperties): Promise<TagModel>
	{
		const documentDB = this.CreateDocument(document);
		const collection = this.GetCollection(Collections.Tags);

		collection.push(documentDB);
		await this.WriteDB();
		return documentDB as TagModel;
	}

	public async GetTags(): Promise<TagModel[]>
	{
		return JSON.parse(JSON.stringify(this.GetCollection(Collections.Tags)));
	}

	public async DeleteTag(tag: TagModel): Promise<void>
	{
		const collection = this.GetCollection<TagModel>(Collections.Tags);
		const index = this.GetIndexInCollectionByID(Collections.Tags, tag.id);

		if (index !== -1)
		{
			collection.splice(index, 1);
			await this.WriteDB();
			return ;
		}
	}

	public async UpdateTag(tag: TagModel): Promise<void>
	{
		const collection = this.GetCollection<TagModel>(Collections.Tags);
		const index = this.GetIndexInCollectionByID(Collections.Tags, tag.id);
		
		if (index !== -1)
		{
			collection[index] = tag;
			await this.WriteDB();
			return ;
		}
	}

	// ---

	public async CreateProject(document: ProjectProperties): Promise<ProjectModel>
	{
		const documentDB = this.CreateDocument(document);
		const collection = this.GetCollection(Collections.Projects);

		collection.push(documentDB);
		await this.WriteDB();
		return documentDB as ProjectModel;
	}

	public async GetProjects(): Promise<ProjectModel[]>
	{
		return JSON.parse(JSON.stringify(this.GetCollection(Collections.Projects)));
	}

	public async DeleteProject(project: ProjectModel): Promise<void>
	{
		const collection = this.GetCollection<ProjectModel>(Collections.Projects);
		const index = this.GetIndexInCollectionByID(Collections.Projects, project.id);

		if (index !== -1)
		{
			collection.splice(index, 1);
			await this.WriteDB();
			return ;
		}
	}

	public async UpdateProject(project: ProjectModel): Promise<void>
	{
		const collection = this.GetCollection<ProjectModel>(Collections.Projects);
		const index = this.GetIndexInCollectionByID(Collections.Projects, project.id);
		
		if (index !== -1)
		{
			collection[index] = project;
			await this.WriteDB();
			return ;
		}
	}

	private CreateDocument(originalDocument: any): any
	{
		return {...originalDocument, id: Date.now()};
	}

	private GetCollection<T>(collectionName: string): T[]
	{
		const collection = this.collections[collectionName];
		return collection as unknown as T[];
	}

	private GetIndexInCollectionByID(collectionName: string, id: string): number
	{
		const collection = this.GetCollection(collectionName) as any;
		for (let i = 0; i < collection.length; i++)
		{
			if (collection[i].id === id)
				return i;
		}
		return -1;
	}

	private async WriteDB(): Promise<void>
	{
		await WriteFile("db.json", JSON.stringify(this.collections, null, 4));
	}
}