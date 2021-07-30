import { NoteModel, Tag, TagModel, TagProperties, NoteProperties } from "../Models";
import DataProvider from "./DataProvider";

import { WriteFile, ReadFile } from "SoftWiki-Core"
import { ProjectModel, ProjectProperties } from "../Models/Project";

interface ICollections
{
	notes: NoteModel[]
	tags: TagModel[]
	projects: ProjectModel[]
}

const Collections = {
	Notes: "notes",
	Tags: "tags",
	Projects: "projects"
}

export default class JsonDataProvider extends DataProvider
{
	collections: ICollections

	constructor()
	{
		super()

		this.collections = {
			notes: [],
			tags: [],
			projects: []
		}
	}

	public async Setup() : Promise<void>
	{
		try
		{
			let data = await ReadFile("db.json")
			this.collections = JSON.parse(data)	
			console.log("COLLECTION");
			console.log(this.collections);
			
			
		}
		catch (e)
		{
			// Todo
		}
	}

	public async CreateNote(properties: NoteProperties) : Promise<NoteModel>
	{
		let documentDB = this.CreateDocument(properties)
		let collection = this.GetCollection(Collections.Notes)

		collection.push(documentDB);
		await this.WriteDB()
		return documentDB as NoteModel
	}

	public async GetNotes() : Promise<NoteModel[]>
	{
		return JSON.parse(JSON.stringify(this.GetCollection(Collections.Notes))) // Another way of cloning ?
	}

	public async DeleteNote(note: NoteModel) : Promise<void>
	{
		let collection = this.GetCollection<NoteModel>(Collections.Notes)
		let index = this.GetIndexInCollectionByID(Collections.Notes, note.id)

		if (index !== -1)
		{
			collection.splice(index, 1)
			await this.WriteDB()
			return ;
		}
	}


	public async UpdateNote(note: NoteModel) : Promise<void>
	{
		let collection = this.GetCollection<NoteModel>(Collections.Notes)
		let index = this.GetIndexInCollectionByID(Collections.Notes, note.id)
		
		if (index !== -1)
		{
			collection[index] = note
			await this.WriteDB()
		}
	}
	
	public async RemoveTagFromNote(note: NoteModel, tag: Tag) : Promise<void>
	{
		let collection = this.GetCollection<NoteModel>(Collections.Notes)
		let index = this.GetIndexInCollectionByID(Collections.Notes, note.id)
		let tagIndex = collection[index].tags.indexOf(tag._GetID())

		collection[index].tags.splice(tagIndex, 1)
		await this.WriteDB()
	}

	public async AddTagToNote(note: NoteModel, tag: Tag) : Promise<void>
	{
		let collection = this.GetCollection<NoteModel>(Collections.Notes)
		let index = this.GetIndexInCollectionByID(Collections.Notes, note.id)

		collection[index].tags.push(tag._GetID())
		await this.WriteDB()
	}

	public async CreateTag(document: TagProperties) : Promise<TagModel>
	{
		let documentDB = this.CreateDocument(document)
		let collection = this.GetCollection(Collections.Tags)

		collection.push(documentDB);
		await this.WriteDB()
		return documentDB as TagModel
	}

	public async GetTags() : Promise<TagModel[]>
	{
		return JSON.parse(JSON.stringify(this.GetCollection(Collections.Tags)))
	}

	public async DeleteTag(tag: TagModel) : Promise<void>
	{
		let collection = this.GetCollection<TagModel>(Collections.Tags)
		let index = this.GetIndexInCollectionByID(Collections.Tags, tag.id)

		if (index !== -1)
		{
			collection.splice(index, 1)
			await this.WriteDB()
			return ;
		}
	}


	public async UpdateTag(tag: TagModel) : Promise<void>
	{
		let collection = this.GetCollection<TagModel>(Collections.Tags)
		let index = this.GetIndexInCollectionByID(Collections.Tags, tag.id)
		
		if (index !== -1)
		{
			collection[index] = tag
			await this.WriteDB()
			return ;
		}
	}

	// ---

	public async CreateProject(document: ProjectProperties) : Promise<ProjectModel>
	{
		let documentDB = this.CreateDocument(document)
		let collection = this.GetCollection(Collections.Projects)

		collection.push(documentDB);
		await this.WriteDB()
		return documentDB as ProjectModel
	}

	public async GetProjects() : Promise<ProjectModel[]>
	{
		return JSON.parse(JSON.stringify(this.GetCollection(Collections.Projects)))
	}

	public async DeleteProject(project: ProjectModel) : Promise<void>
	{
		let collection = this.GetCollection<ProjectModel>(Collections.Projects)
		let index = this.GetIndexInCollectionByID(Collections.Projects, project.id)

		if (index !== -1)
		{
			collection.splice(index, 1)
			await this.WriteDB()
			return ;
		}
	}


	public async UpdateProject(project: ProjectModel) : Promise<void>
	{
		let collection = this.GetCollection<ProjectModel>(Collections.Projects)
		let index = this.GetIndexInCollectionByID(Collections.Projects, project.id)
		
		if (index !== -1)
		{
			collection[index] = project
			await this.WriteDB()
			return ;
		}
	}

	private CreateDocument(originalDocument: object) : object
	{
		return {...originalDocument, id: Date.now()}
	}

	private GetCollection<T>(collectionName: string) : T[]
	{
		let key = collectionName as keyof object
		let collection = this.collections[key] as T[]
		return collection
	}

	private GetIndexInCollectionByID(collectionName: string, id: string) : number
	{
		let collection = this.GetCollection(collectionName) as any
		for (let i = 0; i < collection.length; i++)
		{
			if (collection[i].id === id)
				return i;
		}
		return -1
	}

	private async WriteDB()
	{
		await WriteFile("db.json", JSON.stringify(this.collections, null, 4))
	}
}