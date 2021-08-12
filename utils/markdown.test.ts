import { parseMarkdownMetadata } from "./markdown";

function buildSource(content: string, metadata: any): string
{
	const metadataKeys = Object.keys(metadata);
	if (metadataKeys.length === 0)
		return content;
	let result = "---\n";
	metadataKeys.forEach((key: string) => { result += `${key}: ${metadata[key]}\n`; });
	result += "---\n" + content;
	return result;
}

describe("Markdown parser", () => 
{
	test("1 line and no metadata", () =>
	{
		const source = "This is an simple example with one line";
		const result = parseMarkdownMetadata(source);
		expect(result.content).toStrictEqual(source);
	});

	test("Multiple lines and no metadata", () =>
	{
		const source = buildSource("This is an\n simple ex\nample with multiple line", {});
		const result = parseMarkdownMetadata(source);
		expect(result.content).toStrictEqual(source);
	});

	test("Start with empty lines with multiple lines and no metadata", () =>
	{
		const source = buildSource("\n\nThis is an\n simple ex\nample with multiple line", {});
		const result = parseMarkdownMetadata(source);
		expect(result.content).toStrictEqual(source);
	});

	test("1 line and metadata", () =>
	{
		const content = "This is an simple example with one line";
		const metadata = {title: "Easy"};
		const source = buildSource(content, metadata);

		const result = parseMarkdownMetadata(source);

		expect(result.content).toStrictEqual(content);
		expect(result.meta).toStrictEqual(metadata);
	});

	test("Multiple lines and metadata", () =>
	{
		const content = "\n\nThis is an\n simple ex\nample with multiple line";
		const metadata = {title: "Easy", tags: "Done, Todo, Bug"};
		const source = buildSource(content, metadata);

		const result = parseMarkdownMetadata(source);

		expect(result.content).toStrictEqual(content);
		expect(result.meta).toStrictEqual(metadata);
	});
});