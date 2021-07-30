let versions = window.process.versions as any
let isNode: boolean = (versions.node !== undefined)
let isElectron: boolean = (versions.electron !== undefined)

export async function ReadFile(path: string) : Promise<string>
{
	if (!isElectron && !isNode)
		return ""
	const fs = isElectron ? window.require("fs").promises : require("fs").promises
	try
	{
		const data = await fs.readFile(path, "utf8")
		return data;
	}
	catch (e)
	{
		console.log("An error occured when trying to read file: " + path)
		console.log(e)
		throw e
	}
}

export async function WriteFile(path: string, content: string) : Promise<void>
{
	if (!isElectron && !isNode)
		return 
	const fs = isElectron ? window.require("fs").promises : require("fs").promises
	try
	{
		await fs.writeFile(path, content)
	}
	catch (e)
	{
		console.log("An error occured when trying to write file: " + path)
		console.log(e)
		throw e
	}
}