import { SoftWikiApi } from "../SoftWikiApi";
import { ObjectReference } from "./Note";

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

export interface TagModel extends TagProperties, ObjectReference {}

export class Tag
{
	private _properties: TagProperties
	private _objectRef: ObjectReference
	private _api: SoftWikiApi
	
	public isDeleted = false

	constructor(properties: TagModel, api: SoftWikiApi)
	{
		this._properties = {
			name: properties.name,
			color: properties.color
		};

		this._objectRef = {
			id: properties.id,
			custom: properties.custom
		};

		this._api = api;
	}

	public setName(name: string): void
	{
		this._properties.name = name;
		this._api.updateTag(this);
	}

	public setColor(color: Color): void
	{
		this._properties.color = color;
		this._api.updateTag(this);
	}

	public setAll(properties: TagProperties): void
	{
		this._properties.name = properties.name;
		this._properties.color = properties.color;
		this._api.updateTag(this);
	}

	public getName(): string 
	{
		return this._properties.name; 
	}

	public getColor(): Color 
	{
		return this._properties.color; 
	}

	public getColorAsCss(): string 
	{
		return `rgb(${this.getColor().r}, ${this.getColor().g}, ${this.getColor().b})`; 
	}

	public getId(): string 
	{
		return this._objectRef.id; 
	}

	public delete(): void
	{
		this._api.deleteTag(this);
		this.isDeleted = true;
	}

	public getModel(): TagModel
	{
		return {...this._properties, ...this._objectRef};
	}
}