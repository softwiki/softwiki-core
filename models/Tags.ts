import DataApi from "../data/DataApi";
import { ObjectReference } from "./Notes";

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
	
	public isDeleted = false

	constructor(properties: TagModel)
	{
		this._properties = {
			name: properties.name,
			color: properties.color
		};

		this._objectRef = {
			id: properties.id,
			custom: properties.custom
		};
	}

	public setName(name: string): void
	{
		this._properties.name = name;
		DataApi.updateTag(this);
	}

	public setColor(color: Color): void
	{
		this._properties.color = color;
		DataApi.updateTag(this);
	}

	public setAll(properties: TagProperties): void
	{
		this._properties.name = properties.name;
		this._properties.color = properties.color;
		DataApi.updateTag(this);
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
		DataApi.deleteTag(this);
		this.isDeleted = true;
	}

	public getModel(): TagModel
	{
		return {...this._properties, ...this._objectRef};
	}
}