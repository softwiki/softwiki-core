import { NoteProperties, CategoryProperties, TagProperties } from "../structures";
import { Api } from ".";
import { NoteModel, CategoryModel, TagModel } from "./AbstractDataProvider";

interface ICollections
{
	[index: string]: NoteModel[] | TagModel[] | CategoryModel[]
	notes: NoteModel[]
	tags: TagModel[]
	categories: CategoryModel[]
}

const COLLECTION_NOTES = "notes";
const COLLECTION_TAGS = "tags";
const COLLECTION_PROJECTS = "categories";

function clone(x: any): any {
	return JSON.parse(JSON.stringify(x));
}

export default class JsonApiProvider extends Api {
	private _collections: ICollections
	private _writeDatabase: (content: string) => Promise<void>
	private _readDatabase: () => Promise<string>

	constructor(writeDatabase: (content: string) => Promise<void>, readDatabase: () => Promise<string>) {
		super();

		this._collections = {
			notes: [],
			tags: [],
			categories: []
		};

		this._writeDatabase = writeDatabase;
		this._readDatabase = readDatabase;
	}

	public async setup(): Promise<void> {
		try {
			const data = await this._readDatabase();
			this._collections = JSON.parse(data);
		}
		catch (e) {
			// Todo
		}
	}

	public async createNote(properties: NoteProperties): Promise<NoteModel> {
		const documentDB = this._createDocument(properties);
		const collection = this._getCollection(COLLECTION_NOTES);

		collection.push(documentDB);
		await this._saveDatabase();
		return clone(documentDB) as NoteModel;
	}
	
	private _didSetup = false;
	public async getNotes(): Promise<NoteModel[]> {
		if (!this._didSetup) {
			await this.setup();
			this._didSetup = true;
		}
		return clone(this._getCollection(COLLECTION_NOTES));
	}

	public async deleteNote(id: string): Promise<void> {
		const collection = this._getCollection<NoteModel>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, id);

		if (index !== -1) {
			collection.splice(index, 1);
			await this._saveDatabase();
			return ;
		}
	}

	public async updateNote(id: string, data: NoteProperties): Promise<void> {
		const collection = this._getCollection<NoteModel>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, id);
		
		if (index !== -1) {
			collection[index] = {...clone(data), id};
			await this._saveDatabase();
		}
	}
	
	public async removeTagFromNote(noteId: string, tagId: string): Promise<void> {
		const collection = this._getCollection<NoteModel>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, noteId);
		const tagIndex = collection[index].tagsId.indexOf(tagId);

		collection[index].tagsId.splice(tagIndex, 1);
		await this._saveDatabase();
	}

	public async addTagToNote(noteId: string, tagId: string): Promise<void> {
		const collection = this._getCollection<NoteModel>(COLLECTION_NOTES);
		const index = this._getIndexInCollectionByID(COLLECTION_NOTES, noteId);

		collection[index].tagsId.push(tagId);
		await this._saveDatabase();
	}

	public async createTag(document: TagProperties): Promise<TagModel> {
		const documentDB = this._createDocument(document);
		const collection = this._getCollection(COLLECTION_TAGS);

		collection.push(documentDB);
		await this._saveDatabase();
		return clone(documentDB) as TagModel;
	}

	public async getTags(): Promise<TagModel[]> {
		return clone(this._getCollection(COLLECTION_TAGS));
	}

	public async deleteTag(id: string): Promise<void> {
		const collection = this._getCollection<TagModel>(COLLECTION_TAGS);
		const index = this._getIndexInCollectionByID(COLLECTION_TAGS, id);

		if (index !== -1) {
			collection.splice(index, 1);
			await this._saveDatabase();
			return ;
		}
	}

	public async updateTag(id: string, data: TagProperties): Promise<void> {
		const collection = this._getCollection<TagModel>(COLLECTION_TAGS);
		const index = this._getIndexInCollectionByID(COLLECTION_TAGS, id);
		
		if (index !== -1) {
			collection[index] = {...clone(data), id};
			await this._saveDatabase();
			return ;
		}
	}

	// ---

	public async createCategory(document: CategoryProperties): Promise<CategoryModel> {
		const documentDB = this._createDocument(document);
		const collection = this._getCollection(COLLECTION_PROJECTS);

		collection.push(documentDB);
		await this._saveDatabase();
		return clone(documentDB) as CategoryModel;
	}

	public async getCategories(): Promise<CategoryModel[]> {
		return clone(this._getCollection(COLLECTION_PROJECTS));
	}

	public async deleteCategory(id: string): Promise<void> {
		const collection = this._getCollection<CategoryModel>(COLLECTION_PROJECTS);
		const index = this._getIndexInCollectionByID(COLLECTION_PROJECTS, id);

		if (index !== -1) {
			collection.splice(index, 1);
			await this._saveDatabase();
			return ;
		}
	}

	public async updateCategory(id: string, data: CategoryProperties): Promise<void> {
		const collection = this._getCollection<CategoryModel>(COLLECTION_PROJECTS);
		const index = this._getIndexInCollectionByID(COLLECTION_PROJECTS, id);
		
		if (index !== -1) {
			collection[index] = {...clone(data), id};
			await this._saveDatabase();
			return ;
		}
	}

	private _createDocument(originalDocument: any): any {
		return {...clone(originalDocument), id: Date.now()};
	}

	private _getCollection<T>(collectionName: string): T[] {
		const collection = this._collections[collectionName];
		return collection as unknown as T[];
	}

	private _getIndexInCollectionByID(collectionName: string, id: string): number {
		const collection = this._getCollection(collectionName) as any;
		for (let i = 0; i < collection.length; i++) {
			if (collection[i].id === id)
				return i;
		}
		return -1;
	}

	private async _saveDatabase(): Promise<void> {
		await this._writeDatabase(JSON.stringify(this._collections, null, 4));
	}
}