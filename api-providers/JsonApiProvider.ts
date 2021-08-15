import { NoteData, CategoryData, TagData } from "softwiki-core/models";
import { Api } from ".";
import { NoteApiData, CategoryApiData, TagApiData } from "./Api";

interface ICollections
{
	[index: string]: NoteApiData[] | TagApiData[] | CategoryApiData[]
	notes: NoteApiData[]
	tags: TagApiData[]
	categories: CategoryApiData[]
}

const COLLECTION_NOTES = "notes";
const COLLECTION_TAGS = "tags";
const COLLECTION_PROJECTS = "categories";

function clone(x: any): any
{
	return JSON.parse(JSON.stringify(x));
}

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
			categories: []
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
		return clone(documentDB) as NoteApiData;
	}
	
	private _didSetup = false;
	public async getNotes(): Promise<NoteApiData[]>
	{
		if (!this._didSetup)
		{
			await this.setup();
			this._didSetup = true;
		}
		return clone(this._getCollection(COLLECTION_NOTES));
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
			collection[index] = {...clone(data), id};
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
		return clone(documentDB) as TagApiData;
	}

	public async getTags(): Promise<TagApiData[]>
	{
		return clone(this._getCollection(COLLECTION_TAGS));
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
			collection[index] = {...clone(data), id};
			await this._saveDatabase();
			return ;
		}
	}

	// ---

	public async createCategory(document: CategoryData): Promise<CategoryApiData>
	{
		const documentDB = this._createDocument(document);
		const collection = this._getCollection(COLLECTION_PROJECTS);

		collection.push(documentDB);
		await this._saveDatabase();
		return clone(documentDB) as CategoryApiData;
	}

	public async getCategories(): Promise<CategoryApiData[]>
	{
		return clone(this._getCollection(COLLECTION_PROJECTS));
	}

	public async deleteCategory(id: string): Promise<void>
	{
		const collection = this._getCollection<CategoryApiData>(COLLECTION_PROJECTS);
		const index = this._getIndexInCollectionByID(COLLECTION_PROJECTS, id);

		if (index !== -1)
		{
			collection.splice(index, 1);
			await this._saveDatabase();
			return ;
		}
	}

	public async updateCategory(id: string, data: CategoryData): Promise<void>
	{
		const collection = this._getCollection<CategoryApiData>(COLLECTION_PROJECTS);
		const index = this._getIndexInCollectionByID(COLLECTION_PROJECTS, id);
		
		if (index !== -1)
		{
			collection[index] = {...clone(data), id};
			await this._saveDatabase();
			return ;
		}
	}

	private _createDocument(originalDocument: any): any
	{
		return {...clone(originalDocument), id: Date.now()};
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