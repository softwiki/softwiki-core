import { Note, Tag } from "../Models";
import { DataApiClass } from './DataApi';
import DataProvider from './DataProvider';
import MockedDataProvider, {ICollections} from "./MockedDataProvider";

describe("Frequent cases", () => {

	let mockedDataProvider: DataProvider = new MockedDataProvider({notes: [], tags: [], projects: []})
	let dataApi = new DataApiClass(mockedDataProvider)

	describe("First note ever", () => {

		let notes: Note[]
	
		test('Notes list is empty', () => {
			notes = dataApi.GetNotes()
			expect(notes).toHaveLength(0)
		});
	
		test('Add a note, but previous note list is still be empty', async () => {
			await dataApi.CreateNote({title: "Note 1", content: "test", tags: [], project: undefined})
			expect(notes).toHaveLength(0)
		});
	
		test('Note list have 1 element', () => {
			notes = dataApi.GetNotes()
			expect(notes).toHaveLength(1)
		});
	})

	describe("Create 2 more notes", () => {
		
		test('Second note', async () => {
			expect(dataApi.GetNotes()).toHaveLength(1)
			await dataApi.CreateNote({title: "Note 2", content: "test", tags: [], project: undefined})
			expect(dataApi.GetNotes()).toHaveLength(2)
		})

		test('Third note', async () => {
			expect(dataApi.GetNotes()).toHaveLength(2)
			await dataApi.CreateNote({title: "Note 3", content: "test", tags: [], project: undefined})
			expect(dataApi.GetNotes()).toHaveLength(3)
		})

	})

	describe("Edit notes", () => {

		const NotesStates: any = [
			{START: "Note 1", END: "Note 1 edited"},
			{START: "Note 2", END: "Note 2 edited"},
			{START: "Note 3", END: "Note 3 edited"}
		]

		beforeEach(() => {
			let notes = dataApi.GetNotes()
			expect(dataApi.GetNotes()).toHaveLength(3)
		})

		test('First note', async () => {

			const NOTE_INDEX = 0

			let notes = dataApi.GetNotes()
			let note = notes[NOTE_INDEX]

			expect(note.GetTitle()).toBe(NotesStates[NOTE_INDEX].START)
			note.SetTitle(NotesStates[NOTE_INDEX].END)
			expect(note.GetTitle()).toBe(NotesStates[NOTE_INDEX].END)

			notes = dataApi.GetNotes()
			expect(notes[0].GetTitle()).toBe(NotesStates[0].END)
			expect(notes[1].GetTitle()).toBe(NotesStates[1].START)
			expect(notes[2].GetTitle()).toBe(NotesStates[2].START)
		})

		test('Second note', async () => {

			const NOTE_INDEX = 1

			let notes = dataApi.GetNotes()
			let note = notes[NOTE_INDEX]

			expect(note.GetTitle()).toBe(NotesStates[NOTE_INDEX].START)
			note.SetTitle(NotesStates[NOTE_INDEX].END)
			expect(note.GetTitle()).toBe(NotesStates[NOTE_INDEX].END)

			notes = dataApi.GetNotes()
			expect(notes[0].GetTitle()).toBe(NotesStates[0].END)
			expect(notes[1].GetTitle()).toBe(NotesStates[1].END)
			expect(notes[2].GetTitle()).toBe(NotesStates[2].START)
		})

		test('Last note', async () => {

			const NOTE_INDEX = 2

			let notes = dataApi.GetNotes()
			let note = notes[NOTE_INDEX]

			expect(note.GetTitle()).toBe(NotesStates[NOTE_INDEX].START)
			note.SetTitle(NotesStates[NOTE_INDEX].END)
			expect(note.GetTitle()).toBe(NotesStates[NOTE_INDEX].END)

			notes = dataApi.GetNotes()
			expect(notes[0].GetTitle()).toBe(NotesStates[0].END)
			expect(notes[1].GetTitle()).toBe(NotesStates[1].END)
			expect(notes[2].GetTitle()).toBe(NotesStates[2].END)
		})

	})

	describe("Delete notes", () => {

		test('Second note', async () => {
			let notesBefore = dataApi.GetNotes()
			expect(notesBefore).toHaveLength(3)

			dataApi.DeleteNote(notesBefore[1])

			let notesAfter = dataApi.GetNotes()
			expect(notesAfter).toHaveLength(2)

			expect(notesAfter[0]._GetID()).toBe(notesBefore[0]._GetID())
			expect(notesAfter[1]._GetID()).toBe(notesBefore[2]._GetID())
		})

		test('First note', async () => {
			let notesBefore = dataApi.GetNotes()
			expect(notesBefore).toHaveLength(2)

			dataApi.DeleteNote(notesBefore[0])

			let notesAfter = dataApi.GetNotes()
			expect(notesAfter).toHaveLength(1)

			expect(notesAfter[0]._GetID()).toBe(notesBefore[1]._GetID())
		})

		test('Last note', async () => {
			let notesBefore = dataApi.GetNotes()
			expect(notesBefore).toHaveLength(1)

			dataApi.DeleteNote(notesBefore[0])

			let notesAfter = dataApi.GetNotes()
			expect(notesAfter).toHaveLength(0)
		})

	})

})

describe("Tags", () => {

	let fakeData: ICollections = {
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
	}

	let dataApi: DataApiClass
	let notes: Note[]
	let tags: Tag[]

	beforeEach(async () => {
		let mockedDataProvier = new MockedDataProvider(JSON.parse(JSON.stringify(fakeData)))
		dataApi = new DataApiClass(mockedDataProvier)
		await dataApi.Setup()
		notes = dataApi.GetNotes()
		tags = dataApi.GetTags()

		expect(dataApi.GetNotes()).toHaveLength(3)
		expect(notes[0].GetTags()).toHaveLength(0)	
		expect(notes[1].GetTags()).toHaveLength(1)	
		expect(notes[2].GetTags()).toHaveLength(2)	
	})

	test("Adding the first tag", () => {
		dataApi.AddTagToNote(notes[0], tags[0])

		notes = dataApi.GetNotes()
		expect(notes[0].GetTags()).toHaveLength(1)
	})

	test("Adding the third tag", () => {
		dataApi.AddTagToNote(notes[2], tags[2])

		notes = dataApi.GetNotes()
		expect(notes[2].GetTags()).toHaveLength(3)
	})

	test("Adding tag that already exists on the note does nothing", () => {
		dataApi.AddTagToNote(notes[2], tags[0])

		notes = dataApi.GetNotes()
		expect(notes[2].GetTags()).toHaveLength(2)
	})

	test("Removing the last tag from a note", () => {
		dataApi.RemoveTagFromNote(notes[1], tags[0])

		notes = dataApi.GetNotes()
		expect(notes[0].GetTags()).toHaveLength(0)
		expect(notes[1].GetTags()).toHaveLength(0)
		expect(notes[2].GetTags()).toHaveLength(2)
	})

	test("Removing a tag from a note", () => {
		dataApi.RemoveTagFromNote(notes[2], tags[0])

		notes = dataApi.GetNotes()
		expect(notes[0].GetTags()).toHaveLength(0)
		expect(notes[1].GetTags()).toHaveLength(1)
		expect(notes[2].GetTags()).toHaveLength(1)
	})

	test("Deleting a tag that exists on a single note", () => {
		dataApi.DeleteTag(tags[1])
		notes = dataApi.GetNotes()
		expect(notes[0].GetTags()).toHaveLength(0)
		expect(notes[1].GetTags()).toHaveLength(1)
		expect(notes[2].GetTags()).toHaveLength(1)
	})

	test("Deleting a tag that exists on multiple notes", () => {
		dataApi.DeleteTag(tags[0])
		notes = dataApi.GetNotes()
		expect(notes[0].GetTags()).toHaveLength(0)
		expect(notes[1].GetTags()).toHaveLength(0)
		expect(notes[2].GetTags()).toHaveLength(1)
	})
})