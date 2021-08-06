import { fstat } from "fs";
import { isBrowser, isLinux, isWindows } from "./utils";
const { app } = window.require("@electron/remote");
const fs = window.require("fs");

export async function readFile(path: string): Promise<string>
{
	if (isBrowser())
		return "";
	const fs =  window.require("fs").promises;
	try
	{
		const data = await fs.readFile(path, "utf8");
		return data;
	}
	catch (e)
	{
		console.log("An error occured when trying to read file: " + path);
		console.log(e);
		throw e;
	}
}

export async function writeFile(path: string, content: string): Promise<void>
{
	if (isBrowser())
		return ;
	const fs = window.require("fs").promises;
	try
	{
		await fs.writeFile(path, content);
	}
	catch (e)
	{
		console.log("An error occured when trying to write file: " + path);
		console.log(e);
		throw e;
	}
}

export function getDefaultBasePath(): string
{
	let defaultPath = "";

	if (isLinux())
	{
		defaultPath = app.getPath("home") + "/.softwiki";
	}
	else if (isWindows())
	{
		return app.getPath("userData");
	}

	if (!fs.existsSync(defaultPath))
	{
		fs.mkdirSync(defaultPath, {recursive: true});
	}

	return defaultPath;
}