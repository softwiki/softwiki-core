import { SoftWikiError } from "softwiki-core/errors";

let nextId = 0;
function generateId(): string
{
	return (nextId++).toString();
}

interface FileSystemNodeArguments
{
	basePath: string
	name: string
	root: VirtualFileSystem | null
}

class FileSystemNode<T>
{
	private _name: string
	private _basePath: string
	private _id: string
	private _root: VirtualFileSystem

	constructor({basePath, name, root}: FileSystemNodeArguments)
	{
		this._name = name;
		this._basePath = basePath;
		this._id = generateId();
		this._root = root ?? this as unknown as VirtualFileSystem;
	}

	get name(): string { return this._name; }
	get basePath(): string { return this._basePath; }
	get path(): string { return this._basePath + "/" + this._name; }
	get id(): string { return this._id; }
	get root(): VirtualFileSystem { return this._root;}

	async rename(name: string): Promise<T>
	{
		await this.root.fs.rename(`${this.basePath}/${this.name}`, `${this.basePath}/${name}`);
		this._name = name;
		return this as unknown as T;
	}

	async moveTo(destinationDirectoryId: string): Promise<T>
	{
		const destinationDirectory = this.root.getDirectoryById(destinationDirectoryId);
		if (!destinationDirectory)
			throw new SoftWikiError("Directory with id " + destinationDirectoryId + " doesn't exist");
		await this.root.fs.rename(`${this.basePath}/${this.name}`, `${destinationDirectory.path}/${this.name}`);
		this._basePath = destinationDirectory.path;
		return this as unknown as T;
	}

	private _getParent(directory: FileSystemDirectory): FileSystemDirectory | undefined
	{
		if (directory.files[this.id])
			return directory;
		if (directory.directories[this.id])
			return directory;

		for (const [, nextDirectory] of Object.entries(directory.directories))
		{
			const parentDirectory = this._getParent(nextDirectory);
			if (parentDirectory)
				return parentDirectory;
		}
	}

	public getParent(): FileSystemDirectory | undefined
	{
		return this._getParent(this.root);
	}
}

export class FileSystemDirectory extends FileSystemNode<FileSystemDirectory>
{
	private _directories: { [index: string]: FileSystemDirectory }
	private _files: { [index: string]: FileSystemFile }

	get directories(): { [index: string]: FileSystemDirectory } { return this._directories; }
	get files(): { [index: string]: FileSystemFile } { return this._files; }

	constructor({basePath, name, root}: FileSystemNodeArguments)
	{
		super({basePath, name, root});
		this._directories = {};
		this._files = {};
	}
	
	public async createDirectory(name: string): Promise<FileSystemDirectory>
	{
		const directory = this.addDirectory(name);
		await this.root.fs.mkdir(directory.path);
		return directory;
	}

	public addDirectory(name: string): FileSystemDirectory
	{
		const directory = new FileSystemDirectory({basePath: this.path, name: name, root: this.root});
		this._directories[directory.id] = directory;
		return this._directories[directory.id];
	}

	public addFile(name: string): FileSystemFile
	{
		const file = new FileSystemFile({basePath: this.path, name: name, root: this.root});
		this._files[file.id] = file;
		return this._files[file.id];
	}

	public getDirectoryById(id: string): FileSystemDirectory | undefined
	{
		if (id == this.id)
			return this;
		if (this._directories[id])
			return this._directories[id];

		for (const [, directory] of Object.entries(this._directories))
		{
			const result = directory.getDirectoryById(id);
			if (result)
				return result;
		}
	}

	public getParentById(id: string): FileSystemDirectory | undefined
	{
		if (this._directories[id])
			return this;

		for (const [, directory] of Object.entries(this._directories))
		{
			const result = directory.getParentById(id);
			if (result)
				return result;
		}
	}

	public getFileById(id: string): FileSystemFile | undefined
	{
		if (this._files[id])
			return this._files[id];

		for (const [, directory] of Object.entries(this._directories))
		{
			const file = directory.getFileById(id);
			if (file)
				return file;
		}
	}

	async delete(): Promise<void>
	{
		const parentDirectory = this.getParent();
		if (parentDirectory === undefined)
			throw Error("Couldn't find parent directory of id " + this.id);
		if (parentDirectory.directories[this.id])
			delete parentDirectory.directories[this.id];

		await this.root.fs.rmdir(this.path);
	}
}

export class FileSystemFile extends FileSystemNode<FileSystemFile>
{
	constructor({basePath, name, root}: FileSystemNodeArguments)
	{
		super({basePath, name, root});
	}
	
	async write(content: string): Promise<void>
	{
		await this.root.fs.writeFile(this.path, content);
	}

	async delete(): Promise<void>
	{
		const parentDirectory = this.getParent();
		if (parentDirectory === undefined)
			throw Error("Couldn't find parent directory of id " + this.id);
		if (parentDirectory.files[this.id])
			delete parentDirectory.files[this.id];

		await this.root.fs.rm(this.path);
	}
}

export default class VirtualFileSystem extends FileSystemDirectory
{
	public fs: any

	constructor(basePath: string, fs: unknown)
	{
		super({basePath, name: ".", root: null});
		this.fs = fs;
	}

	async init(): Promise<void>
	{
		const directoriesName = await this._getDirectories(this.basePath);
		directoriesName.push(".");

		for (const directoryName of directoriesName)
		{
			const directory = this.addDirectory(directoryName);
			const filesNames = await this._getFiles(directory.path);

			for (const fileName of filesNames)
			{
				directory.addFile(fileName);
			}
		}
	}

	private async _getDirectories(path: string): Promise<string[]>
	{
		const results = await this.fs.readdir(path, {withFileTypes: true});
		const directories = results.filter((result: any) => result.isDirectory()).map((result: any) => result.name);
		return directories;
	}

	private async _getFiles(path: string): Promise<string[]>
	{
		const results = await this.fs.readdir(path, {withFileTypes: true});
		const files = results.filter((result: any) => result.isFile()).map((result: any) => result.name);
		return files;
	}
}