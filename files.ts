import { isBrowser } from "./utils";

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