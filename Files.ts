const IS_NODE: boolean = (getNodeVersion() !== undefined);
const IS_ELECTRON: boolean = (getElectronVersion() !== undefined);

function getNodeVersion(): string | undefined
{
	const versions = window !== undefined ? window.process.versions : process.versions as any;
	return versions.node;
}

function getElectronVersion(): string | undefined
{
	const versions = window !== undefined ? window.process.versions : process.versions as any;
	return versions.electron;
}

export async function readFile(path: string): Promise<string>
{
	if (!IS_ELECTRON && !IS_NODE)
		return "";
	const fs = IS_ELECTRON ? window.require("fs").promises : require("fs").promises;
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
	if (!IS_ELECTRON && !IS_NODE)
		return ;
	const fs = IS_ELECTRON ? window.require("fs").promises : require("fs").promises;
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