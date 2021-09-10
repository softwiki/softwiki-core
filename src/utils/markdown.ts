interface MarkdownParserMetadataResult
{
	meta: {
		[index: string]: string
	}
	content: string
}

export function parseMarkdownMetadata(source: string): MarkdownParserMetadataResult
{
	if (source.length > 3 && source.startsWith("---"))
	{
		const result: MarkdownParserMetadataResult = {content: "", meta: {}};
		let currentIndex = source.indexOf("\n");
		if (currentIndex !== -1)
			currentIndex++;
		while (currentIndex !== -1 && currentIndex < source.length)
		{
			const endOfLineIndex = source.indexOf("\n", currentIndex);
			if (endOfLineIndex === -1)
			{
				throw new Error("Files end before metadata is closed");
			}
			const line = source.substring(currentIndex, endOfLineIndex);

			if (line.startsWith("---"))
			{
				result.content = source.substring(endOfLineIndex + 1);
				return result;
			}

			const elements = line.split(":");
			if (elements.length < 2)
			{
				throw new Error("Metadata has empty line or missing wrong syntax");
			}
			result.meta[elements[0]] = elements[1].trim();
			currentIndex = endOfLineIndex + 1;
		}
	}
	return {content: source, meta: {}};
}

export function generateMarkdownWithMetadata(content: string, metadata: {[index: string]: unknown}): string
{
	const metadataKeys = Object.keys(metadata);
	if (metadataKeys.length === 0)
		return content;
	let result = "---\n";
	metadataKeys.forEach((key: string) => { result += `${key}: ${metadata[key]}\n`; });
	result += "---\n" + content;
	return result;
}