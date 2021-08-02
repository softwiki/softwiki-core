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
	private properties: TagProperties
	private objectRef: ObjectReference
	
	public isDeleted = false

	constructor(properties: TagModel)
	{
		this.properties = {
			name: properties.name,
			color: properties.color
		};

		this.objectRef = {
			id: properties.id,
			custom: properties.custom
		};
	}

	public SetName(name: string): void
	{
		this.properties.name = name;
		DataApi.UpdateTag(this);
	}

	public SetColor(color: Color): void
	{
		this.properties.color = color;
		DataApi.UpdateTag(this);
	}

	public SetAll(properties: TagProperties): void
	{
		this.properties.name = properties.name;
		this.properties.color = properties.color;
		DataApi.UpdateTag(this);
	}

	public GetName(): string { return this.properties.name; }
	public GetColor(): Color { return this.properties.color; }
	public GetColorAsCss(): string { return `rgb(${this.GetColor().r}, ${this.GetColor().g}, ${this.GetColor().b})`; }
	public _GetID(): string { return this.objectRef.id; }

	public Delete(): void
	{
		DataApi.DeleteTag(this);
		this.isDeleted = true;
	}

	public GetModel(): TagModel
	{
		return {...this.properties, ...this.objectRef};
	}
}