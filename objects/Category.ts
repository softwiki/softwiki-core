import { DataEvent, SoftWikiClient } from "../SoftWikiClient";
import { CategoryApiData } from "../api-providers/Api";
import { Note } from "./Note";
import { Base } from "./Base";

export interface CategoryData
{
	name: string
}

export class Category extends Base
{
	private _data: CategoryData

	constructor(data: CategoryApiData, client: SoftWikiClient)
	{
		super(data.id, client);
		this._data = data;
	}

	public async setName(name: string): Promise<void>
	{
		await this._api.updateCategory(this._id, {...this._data, name});
		this._data.name = name;
		this._client.run(DataEvent.CategoriesUpdated, {category: this});
	}

	public getName(): string
	{
		return this._data.name;
	}

	public getNoteCount(): number
	{
		return this.getNotes().length;
	}

	public getNotes(): Note[]
	{
		return Object.values(this._client.cache.notes).filter((note: Note) => 
		{
			return note.belongToCategory(this);
		});
	}

	public async delete(): Promise<void>
	{
		await this._api.deleteCategory(this.getId());
		delete this._client.cache.categories[this._id];
		this._client.run(DataEvent.CategoriesUpdated, {category: this});
	}
	
	public getDataCopy(): CategoryData
	{
		return JSON.parse(JSON.stringify(this._data));
	}
}