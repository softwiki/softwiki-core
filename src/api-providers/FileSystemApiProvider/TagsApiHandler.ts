import { Tag, TagProperties } from "../../objects";
import { TagModel } from "../Api";
import ApiHandlerBase from "./ApiHandlerBase";
import VirtualFileSystem from "./VirtualFileSystem";
import FileSystemApiProvider, { FileSystemApiCache } from "./FileSystemApiProvider";

export default class TagsApiHandler extends ApiHandlerBase {
	constructor(virtualFileSystem: VirtualFileSystem, cache: FileSystemApiCache, parent: FileSystemApiProvider) {
		super(virtualFileSystem, cache, parent);
	}
	
	public async createTag(data: TagProperties): Promise<TagModel> {
		const tags = Object.values(this._clientCache.tags).map((tag: Tag) => {
			return {name: tag.getName(), color: tag.getColor(), id: tag.getId()};
		});
		const newTag = {...data, id: Date.now().toString()};
		tags.push(newTag);
		this._cacheTag(newTag);
		await this._virtualFileSystem.tags.write(JSON.stringify(tags, null, 4));
		return newTag;
	}

	public async getTags(): Promise<TagModel[]> {
		try {
			const tagsData = JSON.parse(await this._virtualFileSystem.tags.read());
			this._cacheTags(tagsData);
			return tagsData;
		}
		catch (e) {
			console.log("No tags found");
			return [];
		}
	}

	public async deleteTag(id: string): Promise<void> {
		const tags = Object.values(this._clientCache.tags).map((tag: Tag) => {
			return {name: tag.getName(), color: tag.getColor(), id: tag.getId()};
		});
		const index = tags.findIndex((tag: TagModel) => tag.id === id);
		if (index)
			tags.splice(index, 1);
		await this._virtualFileSystem.tags.write(JSON.stringify(tags, null, 4));
		await this._removeTagFromNotes(id);
	}

	public async updateTag(id: string, data: TagProperties): Promise<void> {
		const tags = Object.values(this._clientCache.tags).map((tag: Tag) => {
			if (tag.getId() === id)
				return {...data, id};
			return {name: tag.getName(), color: tag.getColor(), id: tag.getId()};
		});
		this._cacheTag({...data, id});
		await this._updateTagOnNotes({...data, id});
		await this._virtualFileSystem.tags.write(JSON.stringify(tags, null, 4));
	}

	private _cacheTags(tags: TagModel[]): void {
		tags.forEach((tag: TagModel) => this._cacheTag(tag));
	}

	private _cacheTag(tag: TagModel): void {
		this._cache.tagsDataByName[tag.name] = tag;
	}

	private async _removeTagFromNotes(tagId: string): Promise<void> {
		const tag = this._clientCache.tags[tagId];
		const notes = Object.values(this._clientCache.notes);
		for (let i = 0; i < notes.length; ++i) {
			if (notes[i].hasTag(tag)) {
				await this._parent.removeTagFromNote(notes[i].getId(), tagId);
			}
		}
	}

	private async _updateTagOnNotes(data: TagModel): Promise<void> {
		// [TODO] I know it's a really dirty workaround for the moment.
		setTimeout(async () => {
			const tag = this._clientCache.tags[data.id];
			const notes = Object.values(this._clientCache.notes);
			for (let i = 0; i < notes.length; ++i) {
				if (notes[i].hasTag(tag)) {
					const noteData = notes[i].getDataCopy();
					await this._parent.updateNote(notes[i].getId(), noteData);
				}
			}
		}, 100);
	}
}