import { ClientCache } from "../../SoftWikiClient";
import FileSystemApiProvider, { FileSystemApiCache } from "./FileSystemApiProvider";
import VirtualFileSystem from "./VirtualFileSystem";

export default class ApiHandlerBase
{
	protected _parent: FileSystemApiProvider
	protected _virtualFileSystem: VirtualFileSystem
	protected _cache: FileSystemApiCache

	protected get _clientCache(): ClientCache { return this._parent.client.cache; }

	constructor(virtualFileSystem: VirtualFileSystem, cache: FileSystemApiCache, parent: FileSystemApiProvider)
	{
		this._virtualFileSystem = virtualFileSystem;
		this._cache = cache;
		this._parent = parent;
	}
}