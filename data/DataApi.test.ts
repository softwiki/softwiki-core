import { Note, Tag } from "../models";
import { DataApiClass } from "./DataApi";
import DataProvider from "./DataProvider";
import MockedDataProvider, {ICollections} from "./MockedDataProvider";

describe("Frequent cases", () => 
{
	const mockedDataProvider: DataProvider = new MockedDataProvider({notes: [], tags: [], projects: []});
	const dataApi = new DataApiClass(mockedDataProvider);

	describe("First note ever", () => 
	{
		let notes: Note[];
	
		test("Notes list is empty", () => 
		{
			notes = dataApi.getNotes();
			expect(notes).toHaveLength(0);
		});
	
		test("Add a note, but previous note list is still be empty", async () => 
		{
			await dataApi.createNote({title: "Note 1", content: "test", tags: [], project: undefined});
			expect(notes).toHaveLength(0);
		});
	
		test("Note list have 1 element", () => 
		{
			notes = dataApi.getNotes();
			expect(notes).toHaveLength(1);
		});
	});

	describe("Create 2 more notes", () => 
	{
		test("Second note", async () => 
		{
			expect(dataApi.getNotes()).toHaveLength(1);
			await dataApi.createNote({title: "Note 2", content: "test", tags: [], project: undefined});
			expect(dataApi.getNotes()).toHaveLength(2);
		});

		test("Third note", async () => 
		{
			expect(dataApi.getNotes()).toHaveLength(2);
			await dataApi.createNote({title: "Note 3", content: "test", tags: [], project: undefined});
			expect(dataApi.getNotes()).toHaveLength(3);
		});
	});

	describe("Edit notes", () => 
	{
		const notesStates: any = [
			{start: "Note 1", end: "Note 1 edited"},
			{start: "Note 2", end: "Note 2 edited"},
			{start: "Note 3", end: "Note 3 edited"}
		];

		beforeEach(() => 
		{
			const notes = dataApi.getNotes();
			expect(notes).toHaveLength(3);
		});

		test("First note", async () => 
		{
			const nodeIndex = 0;

			let notes = dataApi.getNotes();
			const note = notes[nodeIndex];

			expect(note.getTitle()).toBe(notesStates[nodeIndex].start);
			note.setTitle(notesStates[nodeIndex].end);
			expect(note.getTitle()).toBe(notesStates[nodeIndex].end);

			notes = dataApi.getNotes();
			expect(notes[0].getTitle()).toBe(notesStates[0].end);
			expect(notes[1].getTitle()).toBe(notesStates[1].start);
			expect(notes[2].getTitle()).toBe(notesStates[2].start);
		});

		test("Second note", async () => 
		{
			const nodeIndex = 1;

			let notes = dataApi.getNotes();
			const note = notes[nodeIndex];

			expect(note.getTitle()).toBe(notesStates[nodeIndex].start);
			note.setTitle(notesStates[nodeIndex].end);
			expect(note.getTitle()).toBe(notesStates[nodeIndex].end);

			notes = dataApi.getNotes();
			expect(notes[0].getTitle()).toBe(notesStates[0].end);
			expect(notes[1].getTitle()).toBe(notesStates[1].end);
			expect(notes[2].getTitle()).toBe(notesStates[2].start);
		});

		test("Last note", async () => 
		{
			const nodeIndex = 2;

			let notes = dataApi.getNotes();
			const note = notes[nodeIndex];

			expect(note.getTitle()).toBe(notesStates[nodeIndex].start);
			note.setTitle(notesStates[nodeIndex].end);
			expect(note.getTitle()).toBe(notesStates[nodeIndex].end);

			notes = dataApi.getNotes();
			expect(notes[0].getTitle()).toBe(notesStates[0].end);
			expect(notes[1].getTitle()).toBe(notesStates[1].end);
			expect(notes[2].getTitle()).toBe(notesStates[2].end);
		});
	});

	describe("Delete notes", () => 
	{
		test("Second note", async () => 
		{
			const notesBefore = dataApi.getNotes();
			expect(notesBefore).toHaveLength(3);

			dataApi.deleteNote(notesBefore[1]);

			const notesAfter = dataApi.getNotes();
			expect(notesAfter).toHaveLength(2);

			expect(notesAfter[0].getId()).toBe(notesBefore[0].getId());
			expect(notesAfter[1].getId()).toBe(notesBefore[2].getId());
		});

		test("First note", async () => 
		{
			const notesBefore = dataApi.getNotes();
			expect(notesBefore).toHaveLength(2);

			dataApi.deleteNote(notesBefore[0]);

			const notesAfter = dataApi.getNotes();
			expect(notesAfter).toHaveLength(1);

			expect(notesAfter[0].getId()).toBe(notesBefore[1].getId());
		});

		test("Last note", async () => 
		{
			const notesBefore = dataApi.getNotes();
			expect(notesBefore).toHaveLength(1);

			dataApi.deleteNote(notesBefore[0]);

			const notesAfter = dataApi.getNotes();
			expect(notesAfter).toHaveLength(0);
		});
	});
});

describe("Tags", () => 
{
	const fakeData: ICollections = {
		notes: [
			{title: "First note", content: "Amazing content", tags: [], id: "1", project: undefined, custom: null},
			{title: "Second note", content: "Amazing content", tags: ["1"], id: "2", project: undefined, custom: null},
			{title: "Third note", content: "Amazing content", tags: ["1", "2"], id: "3", project: undefined, custom: null}
		],
		tags: [
			{name: "First tag", color: {r: 20, g: 20, b: 20, a: 1}, id: "1", custom: null},
			{name: "Second tag", color: {r: 20, g: 20, b: 20, a: 1}, id: "2", custom: null},
			{name: "Third tag", color: {r: 20, g: 20, b: 20, a: 1}, id: "3", custom: null}
		],
		projects: []
	};

	let dataApi: DataApiClass;
	let notes: Note[];
	let tags: Tag[];

	beforeEach(async () => 
	{
		const mockedDataProvier = new MockedDataProvider(JSON.parse(JSON.stringify(fakeData)));
		dataApi = new DataApiClass(mockedDataProvier);
		await dataApi.setup();
		notes = dataApi.getNotes();
		tags = dataApi.getTags();

		expect(dataApi.getNotes()).toHaveLength(3);
		expect(notes[0].getTags()).toHaveLength(0);
		expect(notes[1].getTags()).toHaveLength(1);
		expect(notes[2].getTags()).toHaveLength(2);
	});

	test("Adding the first tag", () => 
	{
		dataApi.addTagToNote(notes[0], tags[0]);

		notes = dataApi.getNotes();
		expect(notes[0].getTags()).toHaveLength(1);
	});

	test("Adding the third tag", () => 
	{
		dataApi.addTagToNote(notes[2], tags[2]);

		notes = dataApi.getNotes();
		expect(notes[2].getTags()).toHaveLength(3);
	});

	test("Adding tag that already exists on the note does nothing", () => 
	{
		dataApi.addTagToNote(notes[2], tags[0]);

		notes = dataApi.getNotes();
		expect(notes[2].getTags()).toHaveLength(2);
	});

	test("Removing the last tag from a note", () => 
	{
		dataApi.removeTagFromNote(notes[1], tags[0]);

		notes = dataApi.getNotes();
		expect(notes[0].getTags()).toHaveLength(0);
		expect(notes[1].getTags()).toHaveLength(0);
		expect(notes[2].getTags()).toHaveLength(2);
	});

	test("Removing a tag from a note", () => 
	{
		dataApi.removeTagFromNote(notes[2], tags[0]);

		notes = dataApi.getNotes();
		expect(notes[0].getTags()).toHaveLength(0);
		expect(notes[1].getTags()).toHaveLength(1);
		expect(notes[2].getTags()).toHaveLength(1);
	});

	test("Deleting a tag that exists on a single note", () => 
	{
		dataApi.deleteTag(tags[1]);
		notes = dataApi.getNotes();
		expect(notes[0].getTags()).toHaveLength(0);
		expect(notes[1].getTags()).toHaveLength(1);
		expect(notes[2].getTags()).toHaveLength(1);
	});

	test("Deleting a tag that exists on multiple notes", () => 
	{
		dataApi.deleteTag(tags[0]);
		notes = dataApi.getNotes();
		expect(notes[0].getTags()).toHaveLength(0);
		expect(notes[1].getTags()).toHaveLength(0);
		expect(notes[2].getTags()).toHaveLength(1);
	});
});