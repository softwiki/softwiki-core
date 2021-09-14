import { Note, Tag } from "./objects";
import { SoftWikiClient } from "./SoftWikiClient";
import { Api } from "./api-providers";
import MockedDataProvider, {ICollections} from "./api-providers/MockedProvider";

describe("Frequent cases", () => {
	const mockedDataProvider: Api = new MockedDataProvider({notes: [], tags: [], categories: []});
	const dataApi = new SoftWikiClient({provider: mockedDataProvider});

	beforeAll(async () => {
		await dataApi.init();
	});

	describe("First note ever", () => {
		let notes: Note[];
	
		test("Notes list is empty", () => {
			notes = dataApi.notes;
			expect(notes).toHaveLength(0);
		});
	
		test("Add a note, but previous note list is still be empty", async () => {
			await dataApi.createNote({title: "Note 1", content: "test", tagsId: [], categoryId: undefined});
			expect(notes).toHaveLength(0);
		});
	
		test("Note list have 1 element", () => {
			notes = dataApi.notes;
			expect(notes).toHaveLength(1);
		});
	});

	describe("Create 2 more notes", () => {
		test("Second note", async () => {
			expect(dataApi.notes).toHaveLength(1);
			await dataApi.createNote({title: "Note 2", content: "test", tagsId: [], categoryId: undefined});
			expect(dataApi.notes).toHaveLength(2);
		});

		test("Third note", async () => {
			expect(dataApi.notes).toHaveLength(2);
			await dataApi.createNote({title: "Note 3", content: "test", tagsId: [], categoryId: undefined});
			expect(dataApi.notes).toHaveLength(3);
		});
	});

	describe("Edit notes", () => {
		const notesStates: any = [
			{start: "Note 1", end: "Note 1 edited"},
			{start: "Note 2", end: "Note 2 edited"},
			{start: "Note 3", end: "Note 3 edited"}
		];

		beforeEach(() => {
			const notes = dataApi.notes;
			expect(notes).toHaveLength(3);
		});

		test("First note", async () => {
			const nodeIndex = 0;

			let notes = dataApi.notes;
			const note = notes[nodeIndex];

			expect(note.getTitle()).toBe(notesStates[nodeIndex].start);
			await note.setTitle(notesStates[nodeIndex].end);
			expect(note.getTitle()).toBe(notesStates[nodeIndex].end);

			notes = dataApi.notes;
			expect(notes[0].getTitle()).toBe(notesStates[0].end);
			expect(notes[1].getTitle()).toBe(notesStates[1].start);
			expect(notes[2].getTitle()).toBe(notesStates[2].start);
		});

		test("Second note", async () => {
			const nodeIndex = 1;

			let notes = dataApi.notes;
			const note = notes[nodeIndex];

			expect(note.getTitle()).toBe(notesStates[nodeIndex].start);
			await note.setTitle(notesStates[nodeIndex].end);
			expect(note.getTitle()).toBe(notesStates[nodeIndex].end);

			notes = dataApi.notes;
			expect(notes[0].getTitle()).toBe(notesStates[0].end);
			expect(notes[1].getTitle()).toBe(notesStates[1].end);
			expect(notes[2].getTitle()).toBe(notesStates[2].start);
		});

		test("Last note", async () => {
			const nodeIndex = 2;

			let notes = dataApi.notes;
			const note = notes[nodeIndex];

			expect(note.getTitle()).toBe(notesStates[nodeIndex].start);
			await note.setTitle(notesStates[nodeIndex].end);
			expect(note.getTitle()).toBe(notesStates[nodeIndex].end);

			notes = dataApi.notes;
			expect(notes[0].getTitle()).toBe(notesStates[0].end);
			expect(notes[1].getTitle()).toBe(notesStates[1].end);
			expect(notes[2].getTitle()).toBe(notesStates[2].end);
		});
	});

	describe("Delete notes", () => {
		test("Second note", async () => {
			const notesBefore = dataApi.notes;
			expect(notesBefore).toHaveLength(3);

			await notesBefore[1].delete();

			const notesAfter = dataApi.notes;
			expect(notesAfter).toHaveLength(2);

			expect(notesAfter[0].getId()).toBe(notesBefore[0].getId());
			expect(notesAfter[1].getId()).toBe(notesBefore[2].getId());
		});

		test("First note", async () => {
			const notesBefore = dataApi.notes;
			expect(notesBefore).toHaveLength(2);

			await notesBefore[0].delete();

			const notesAfter = dataApi.notes;
			expect(notesAfter).toHaveLength(1);

			expect(notesAfter[0].getId()).toBe(notesBefore[1].getId());
		});

		test("Last note", async () => {
			const notesBefore = dataApi.notes;
			expect(notesBefore).toHaveLength(1);

			await notesBefore[0].delete();

			const notesAfter = dataApi.notes;
			expect(notesAfter).toHaveLength(0);
		});
	});
});

describe("Tags", () => {
	const fakeData: ICollections = {
		notes: [
			{title: "First note", content: "Amazing content", tagsId: [], id: "1", categoryId: undefined},
			{title: "Second note", content: "Amazing content", tagsId: ["1"], id: "2", categoryId: undefined},
			{title: "Third note", content: "Amazing content", tagsId: ["1", "2"], id: "3", categoryId: undefined}
		],
		tags: [
			{name: "First tag", color: {r: 20, g: 20, b: 20, a: 1}, id: "1"},
			{name: "Second tag", color: {r: 20, g: 20, b: 20, a: 1}, id: "2"},
			{name: "Third tag", color: {r: 20, g: 20, b: 20, a: 1}, id: "3"}
		],
		categories: []
	};

	let dataApi: SoftWikiClient;
	let notes: Note[];
	let tags: Tag[];

	beforeEach(async () => {
		const mockedDataProvier = new MockedDataProvider(JSON.parse(JSON.stringify(fakeData)));
		dataApi = new SoftWikiClient({provider: mockedDataProvier});
		await dataApi.init();
		notes = dataApi.notes;
		tags = dataApi.tags;

		expect(dataApi.notes).toHaveLength(3);
		expect(notes[0].getTags()).toHaveLength(0);
		expect(notes[1].getTags()).toHaveLength(1);
		expect(notes[2].getTags()).toHaveLength(2);
	});

	test("Adding the first tag", async () => {
		await notes[0].addTag(tags[0]);

		notes = dataApi.notes;
		expect(notes[0].getTags()).toHaveLength(1);
	});

	test("Adding the third tag", async () => {
		await notes[2].addTag(tags[2]);

		notes = dataApi.notes;
		expect(notes[2].getTags()).toHaveLength(3);
	});

	test("Adding tag that already exists on the note does nothing", async () => {
		await notes[2].addTag(tags[0]);

		notes = dataApi.notes;
		expect(notes[2].getTags()).toHaveLength(2);
	});

	test("Removing the last tag from a note", async () => {
		await notes[1].removeTag(tags[0]);

		notes = dataApi.notes;
		expect(notes[0].getTags()).toHaveLength(0);
		expect(notes[1].getTags()).toHaveLength(0);
		expect(notes[2].getTags()).toHaveLength(2);
	});

	test("Removing a tag from a note", async () => {
		await notes[2].removeTag(tags[0]);

		notes = dataApi.notes;
		expect(notes[0].getTags()).toHaveLength(0);
		expect(notes[1].getTags()).toHaveLength(1);
		expect(notes[2].getTags()).toHaveLength(1);
	});

	test("Deleting a tag that exists on a single note", async () => {
		await tags[1].delete();
		notes = dataApi.notes;
		expect(notes[0].getTags()).toHaveLength(0);
		expect(notes[1].getTags()).toHaveLength(1);
		expect(notes[2].getTags()).toHaveLength(1);
	});

	test("Deleting a tag that exists on multiple notes", async () => {
		await tags[0].delete();
		notes = dataApi.notes;
		expect(notes[0].getTags()).toHaveLength(0);
		expect(notes[1].getTags()).toHaveLength(0);
		expect(notes[2].getTags()).toHaveLength(1);
	});
});