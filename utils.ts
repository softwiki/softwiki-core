export function isElectron(): boolean
{
	if (window === undefined || window.process === undefined)
		return false;
	const versions = window.process.versions as any;
	return versions.electron !== undefined;
}

export function isBrowser(): boolean
{
	return window !== undefined && window.process === undefined;
}