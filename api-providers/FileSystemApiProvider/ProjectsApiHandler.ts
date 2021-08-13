import { SoftWikiError } from "../../errors";
import { ProjectData } from "../../models";
import { ProjectApiData } from "../Api";
import ApiHandlerBase from "./ApiHandlerBase";
import VirtualFileSystem from "./VirtualFileSystem";
import FileSystemApiProvider, { FileSystemApiCache } from "./FileSystemApiProvider";

export default class ProjectsApiHandler extends ApiHandlerBase
{
	constructor(virtualFileSystem: VirtualFileSystem, cache: FileSystemApiCache, parent: FileSystemApiProvider)
	{
		super(virtualFileSystem, cache, parent);
	}
	
	public async createProject(data: ProjectData): Promise<ProjectApiData>
	{
		const directory = await this._virtualFileSystem.createDirectory(data.name);
		return {...data, id: directory.id};
	}

	public async getProjects(): Promise<ProjectApiData[]>
	{
		const projects = [];

		for (const [directoryId, directory] of Object.entries(this._virtualFileSystem.notes.directories))
		{
			if (directory.name === ".")
				continue ;

			projects.push({
				id: directoryId,
				name: directory.name,
				notes: Object.keys(directory.files)
			});
		}
		return projects;
	}

	public async deleteProject(id: string): Promise<void>
	{
		const directory = this._virtualFileSystem.getDirectoryById(id);
		if (!directory)
			throw new SoftWikiError("Directory with id " + id + " doesn't exist");
		await directory.delete();
	}

	public async updateProject(id: string, data: ProjectData): Promise<void>
	{
		const directory = this._virtualFileSystem.getDirectoryById(id);
		if (!directory)
			throw new Error("Directory with id " + id + " doesn't exist");

		const project = this._clientCache.projects[id];
		if (!project)
		{
			throw new Error("Project with id " + id + " doesn't exist in cache");
		}

		const oldData = project.getDataCopy();
		if (oldData.name !== data.name)
		{
			await directory.rename(data.name);
		}
	}
}