import { NoteModel, Tag, TagModel, TagProperties, NoteProperties } from "../models";
import DataProvider from "./DataProvider";

import { writeFile, readFile } from "../files";
import { ProjectModel, ProjectProperties } from "../models/Project";

interface ICollections
{
	[index: string]: NoteModel[] | TagModel[] | ProjectModel[]
	notes: NoteModel[]
	tags: TagModel[]
	projects: ProjectModel[]
}

const COLLECTION_NOTES = "notes";
const COLLECTION_TAGS = "tags";
const COLLECTION_PROJECTS = "projects";

export default class JsonDataProvider extends DataProvider
{
	private _collections: ICollections
	private _dbPath: string

	constructor(dbPath: string)
	{
		super();

		this._dbPath = dbPath;

		this._collections = {
			notes: [],
			tags: [],
			projects: []
		};
	}

	public async setup(): Promise<void>
	{
		try
		{
			const data = await readFile(this._dbPath);
			this._collections = JSON.parse(data);
		}
		catch (e)
		{
			// Todo
		}
	}

	public async createNote(properties: NoteProperties): Promise<NoteModel>
	{
		const documentDB = this._createDocument(properties);
		const collection = this._getCollection(COLLECTION_NOTES);

		collection.push(documentDB);
		await this._writeDB();
		return documentDB as NoteModel;
	}

	public async getNotes(): Promise<NoteModel[]>
	{
		return JSON.parse(JSON.stringify(this._getCollection(COLLECTION_NOTES))); // Another way of cloning ?
	}

	public async deleteNote(note: NoteModel): Promise<void>
	{
		const collection = this._getCollection<NoteModel>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, note.id);

		if (index !== -1)
		{
			collection.splice(index, 1);
			await this._writeDB();
			return ;
		}
	}

	public async updateNote(note: NoteModel): Promise<void>
	{
		const collection = this._getCollection<NoteModel>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, note.id);
		
		if (index !== -1)
		{
			collection[index] = note;
			await this._writeDB();
		}
	}
	
	public async removeTagFromNote(note: NoteModel, tag: Tag): Promise<void>
	{
		const collection = this._getCollection<NoteModel>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, note.id);
		const tagIndex = collection[index].tags.indexOf(tag.getId());

		collection[index].tags.splice(tagIndex, 1);
		await this._writeDB();
	}

	public async addTagToNote(note: NoteModel, tag: Tag): Promise<void>
	{
		const collection = this._getCollection<NoteModel>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, note.id);

		collection[index].tags.push(tag.getId());
		await this._writeDB();
	}

	public async createTag(document: TagProperties): Promise<TagModel>
	{
		const documentDB = this._createDocument(document);
		const collection = this._getCollection(COLLECTION_TAGS);

		collection.push(documentDB);
		await this._writeDB();
		return documentDB as TagModel;
	}

	public async getTags(): Promise<TagModel[]>
	{
		return JSON.parse(JSON.stringify(this._getCollection(COLLECTION_TAGS)));
	}

	public async deleteTag(tag: TagModel): Promise<void>
	{
		const collection = this._getCollection<TagModel>(COLLECTION_TAGS);
		const index = this._getIndexInCollectionByID(COLLECTION_TAGS, tag.id);

		if (index !== -1)
		{
			collection.splice(index, 1);
			await this._writeDB();
			return ;
		}
	}

	public async updateTag(tag: TagModel): Promise<void>
	{
		const collection = this._getCollection<TagModel>(COLLECTION_TAGS);
		const index = this._getIndexInCollectionByID(COLLECTION_TAGS, tag.id);
		
		if (index !== -1)
		{
			collection[index] = tag;
			await this._writeDB();
			return ;
		}
	}

	// ---

	public async createProject(document: ProjectProperties): Promise<ProjectModel>
	{
		const documentDB = this._createDocument(document);
		const collection = this._getCollection(COLLECTION_PROJECTS);

		collection.push(documentDB);
		await this._writeDB();
		return documentDB as ProjectModel;
	}

	public async getProjects(): Promise<ProjectModel[]>
	{
		return JSON.parse(JSON.stringify(this._getCollection(COLLECTION_PROJECTS)));
	}

	public async deleteProject(project: ProjectModel): Promise<void>
	{
		const collection = this._getCollection<ProjectModel>(COLLECTION_PROJECTS);
		const index = this._getIndexInCollectionByID(COLLECTION_PROJECTS, project.id);

		if (index !== -1)
		{
			collection.splice(index, 1);
			await this._writeDB();
			return ;
		}
	}

	public async updateProject(project: ProjectModel): Promise<void>
	{
		const collection = this._getCollection<ProjectModel>(COLLECTION_PROJECTS);
		const index = this._getIndexInCollectionByID(COLLECTION_PROJECTS, project.id);
		
		if (index !== -1)
		{
			collection[index] = project;
			await this._writeDB();
			return ;
		}
	}

	private _createDocument(originalDocument: any): any
	{
		return {...originalDocument, id: Date.now()};
	}

	private _getCollection<T>(collectionName: string): T[]
	{
		const collection = this._collections[collectionName];
		return collection as unknown as T[];
	}

	private _getIndexInCollectionByID(collectionName: string, id: string): number
	{
		const collection = this._getCollection(collectionName) as any;
		for (let i = 0; i < collection.length; i++)
		{
			if (collection[i].id === id)
				return i;
		}
		return -1;
	}

	private async _writeDB(): Promise<void>
	{
		await writeFile(this._dbPath, JSON.stringify(this._collections, null, 4));
	}
}