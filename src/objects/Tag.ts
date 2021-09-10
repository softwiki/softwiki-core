import { TagModel } from "../api-providers/Api";
import { DataEvent, SoftWikiClient } from "../SoftWikiClient";
import { Base } from "./Base";

export interface TagProperties
{
	name: string
	color: Color
}

export interface Color
{
	r: number
	g: number
	b: number
	a?: number | undefined
}

export class Tag extends Base
{
	private _data: TagProperties

	constructor(data: TagModel, client: SoftWikiClient)
	{
		super(data.id, client);
		this._data = data;
	}

	public async setName(name: string): Promise<void>
	{
		await this._api.updateTag(this._id, {...this._data, name});
		this._data.name = name;
		this._client.run(DataEvent.TagsUpdated, {tag: this});
	}

	public async setColor(color: Color): Promise<void>
	{
		await this._api.updateTag(this._id, {...this._data, color});
		this._data.color = color;
		this._client.run(DataEvent.TagsUpdated, {tag: this});
	}

	public async setAll(properties: TagProperties): Promise<void>
	{
		await this._api.updateTag(this._id, {...this._data, ...properties});
		this._data.name = properties.name;
		this._data.color = properties.color;
		this._client.run(DataEvent.TagsUpdated, {tag: this});
	}

	public getName(): string 
	{
		return this._data.name; 
	}

	public getColor(): Color 
	{
		return this._data.color; 
	}

	public getColorAsCss(): string 
	{
		return `rgb(${this.getColor().r}, ${this.getColor().g}, ${this.getColor().b})`; 
	}

	public async delete(): Promise<void>
	{
		await this._api.deleteTag(this.getId());
		delete this._client.cache.tags[this._id];
		this._client.run(DataEvent.TagsUpdated, {tag: this});
	}
}