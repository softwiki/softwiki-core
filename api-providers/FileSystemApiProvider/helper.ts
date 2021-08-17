export function getForbiddenSequence(str: string): string | undefined
{
	if (str.startsWith("~"))
		return "(starts with) ~";
	if (str.startsWith("."))
		return "(starts with) .";
	if (str.indexOf("..") !== -1)
		return "..";
	if (str.indexOf("/") !== -1)
		return "/";
	if (str.indexOf("\\") !== -1)
		return "\\";
	if (str.indexOf("*") !== -1)
		return "*";
}