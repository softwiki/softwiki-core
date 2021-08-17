import { SoftWikiError } from "../../errors";
import { CategoryData } from "../../objects";
import { CategoryApiData } from "../Api";
import ApiHandlerBase from "./ApiHandlerBase";
import VirtualFileSystem from "./VirtualFileSystem";
import FileSystemApiProvider, { FileSystemApiCache } from "./FileSystemApiProvider";
import { getForbiddenSequence } from "./helper";

export default class CategoriesApiHandler extends ApiHandlerBase
{
	constructor(virtualFileSystem: VirtualFileSystem, cache: FileSystemApiCache, parent: FileSystemApiProvider)
	{
		super(virtualFileSystem, cache, parent);
	}
	
	public async createCategory(data: CategoryData): Promise<CategoryApiData>
	{
		const forbiddenSequence = getForbiddenSequence(data.name);
		if (forbiddenSequence)
			throw new SoftWikiError(`The character sequence "${forbiddenSequence}" is not allowed in category name`);
		const directory = await this._virtualFileSystem.notes.createDirectory(data.name);
		return {...data, id: directory.id};
	}

	public async getCategories(): Promise<CategoryApiData[]>
	{
		const categories = [];

		for (const [directoryId, directory] of Object.entries(this._virtualFileSystem.notes.directories))
		{
			if (directory.name === ".")
				continue ;

			categories.push({
				id: directoryId,
				name: directory.name,
				notes: Object.keys(directory.files)
			});
		}
		return categories;
	}

	public async deleteCategory(id: string): Promise<void>
	{
		const directory = this._virtualFileSystem.notes.getDirectoryById(id);
		if (!directory)
			throw new SoftWikiError("Directory with id " + id + " doesn't exist");
		await directory.delete();
	}

	public async updateCategory(id: string, data: CategoryData): Promise<void>
	{
		const forbiddenSequence = getForbiddenSequence(data.name);
		if (forbiddenSequence)
			throw new SoftWikiError(`The character sequence "${forbiddenSequence}" is not allowed in category name`);

		const directory = this._virtualFileSystem.notes.getDirectoryById(id);
		if (!directory)
			throw new Error("Directory with id " + id + " doesn't exist");

		const category = this._clientCache.categories[id];
		if (!category)
		{
			throw new Error("Category with id " + id + " doesn't exist in cache");
		}

		const oldData = category.getDataCopy();
		if (oldData.name !== data.name)
		{
			await directory.rename(data.name);
		}
	}
}