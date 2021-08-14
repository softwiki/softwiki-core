import { NoteData, ProjectData, TagData } from "softwiki-core/models";
import { Api } from ".";
import { NoteApiData, ProjectApiData, TagApiData } from "./Api";

interface ICollections
{
	[index: string]: NoteApiData[] | TagApiData[] | ProjectApiData[]
	notes: NoteApiData[]
	tags: TagApiData[]
	projects: ProjectApiData[]
}

const COLLECTION_NOTES = "notes";
const COLLECTION_TAGS = "tags";
const COLLECTION_PROJECTS = "projects";

export default class JsonApiProvider extends Api
{
	private _collections: ICollections
	private _writeDatabase: (content: string) => Promise<void>
	private _readDatabase: () => Promise<string>

	constructor(writeDatabase: (content: string) => Promise<void>, readDatabase: () => Promise<string>)
	{
		super();

		this._collections = {
			notes: [],
			tags: [],
			projects: []
		};

		this._writeDatabase = writeDatabase;
		this._readDatabase = readDatabase;
	}

	public async setup(): Promise<void>
	{
		try
		{
			const data = await this._readDatabase();
			this._collections = JSON.parse(data);
		}
		catch (e)
		{
			// Todo
		}
	}

	public async createNote(properties: NoteData): Promise<NoteApiData>
	{
		const documentDB = this._createDocument(properties);
		const collection = this._getCollection(COLLECTION_NOTES);

		collection.push(documentDB);
		await this._saveDatabase();
		return documentDB as NoteApiData;
	}
	
	private _didSetup = false;
	public async getNotes(): Promise<NoteApiData[]>
	{
		if (!this._didSetup)
		{
			await this.setup();
			this._didSetup = true;
		}
		return JSON.parse(JSON.stringify(this._getCollection(COLLECTION_NOTES))); // Another way of cloning ?
	}

	public async deleteNote(id: string): Promise<void>
	{
		const collection = this._getCollection<NoteApiData>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, id);

		if (index !== -1)
		{
			collection.splice(index, 1);
			await this._saveDatabase();
			return ;
		}
	}

	public async updateNote(id: string, data: NoteData): Promise<void>
	{
		const collection = this._getCollection<NoteApiData>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, id);
		
		if (index !== -1)
		{
			collection[index] = {...data, id};
			await this._saveDatabase();
		}
	}
	
	public async removeTagFromNote(noteId: string, tagId: string): Promise<void>
	{
		const collection = this._getCollection<NoteApiData>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, noteId);
		const tagIndex = collection[index].tags.indexOf(tagId);

		collection[index].tags.splice(tagIndex, 1);
		await this._saveDatabase();
	}

	public async addTagToNote(noteId: string, tagId: string): Promise<void>
	{
		const collection = this._getCollection<NoteApiData>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, noteId);

		collection[index].tags.push(tagId);
		await this._saveDatabase();
	}

	public async createTag(document: TagData): Promise<TagApiData>
	{
		const documentDB = this._createDocument(document);
		const collection = this._getCollection(COLLECTION_TAGS);

		collection.push(documentDB);
		await this._saveDatabase();
		return documentDB as TagApiData;
	}

	public async getTags(): Promise<TagApiData[]>
	{
		return JSON.parse(JSON.stringify(this._getCollection(COLLECTION_TAGS)));
	}

	public async deleteTag(id: string): Promise<void>
	{
		const collection = this._getCollection<TagApiData>(COLLECTION_TAGS);
		const index = this._getIndexInCollectionByID(COLLECTION_TAGS, id);

		if (index !== -1)
		{
			collection.splice(index, 1);
			await this._saveDatabase();
			return ;
		}
	}

	public async updateTag(id: string, data: TagData): Promise<void>
	{
		const collection = this._getCollection<TagApiData>(COLLECTION_TAGS);
		const index = this._getIndexInCollectionByID(COLLECTION_TAGS, id);
		
		if (index !== -1)
		{
			collection[index] = {...data, id};
			await this._saveDatabase();
			return ;
		}
	}

	// ---

	public async createProject(document: ProjectData): Promise<ProjectApiData>
	{
		const documentDB = this._createDocument(document);
		const collection = this._getCollection(COLLECTION_PROJECTS);

		collection.push(documentDB);
		await this._saveDatabase();
		return documentDB as ProjectApiData;
	}

	public async getProjects(): Promise<ProjectApiData[]>
	{
		return JSON.parse(JSON.stringify(this._getCollection(COLLECTION_PROJECTS)));
	}

	public async deleteProject(id: string): Promise<void>
	{
		const collection = this._getCollection<ProjectApiData>(COLLECTION_PROJECTS);
		const index = this._getIndexInCollectionByID(COLLECTION_PROJECTS, id);

		if (index !== -1)
		{
			collection.splice(index, 1);
			await this._saveDatabase();
			return ;
		}
	}

	public async updateProject(id: string, data: ProjectData): Promise<void>
	{
		const collection = this._getCollection<ProjectApiData>(COLLECTION_PROJECTS);
		const index = this._getIndexInCollectionByID(COLLECTION_PROJECTS, id);
		
		if (index !== -1)
		{
			collection[index] = {...data, id};
			await this._saveDatabase();
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

	private async _saveDatabase(): Promise<void>
	{
		await this._writeDatabase(JSON.stringify(this._collections, null, 4));
	}
}