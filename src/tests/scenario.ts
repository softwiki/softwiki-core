import { Api } from "../data-providers";
import { CategoryModel, NoteModel, TagModel } from "../data-providers/AbstractDataProvider";
import {UnknownIdError} from "../errors/ApiError";

const FIRST_NOTE = 0;
const SECOND_NOTE = 1;
const THIRD_NOTE = 2;

export default function(createProvider: () => Promise<Api>): void {
	describe("Simple scenario", () => {
		let notes: NoteModel[];
		const notesCache: NoteModel[] = [];

		let provider: Api;

		beforeAll(async () => {
			provider = await createProvider();
		});

		describe("Notes", () => {
			test("Notes list is empty", async () => {
				notes = await provider.getNotes();
				expect(notes).toHaveLength(0);
			});

			test("Create first note", async () => {
				const note = await provider.createNote({title: "Note 1", content: "test", tagsId: [], categoryId: undefined});
				notesCache.push(note);
				const notes = await provider.getNotes();
				expect(notes).toHaveLength(1);

				expect(notes[FIRST_NOTE]).toHaveProperty("title");
				expect(notes[FIRST_NOTE]).toHaveProperty("content");
				expect(notes[FIRST_NOTE]).toHaveProperty("tagsId");
				expect(notes[FIRST_NOTE]).toHaveProperty("categoryId");

				expect(notes[FIRST_NOTE].title).toEqual(notesCache[FIRST_NOTE].title);
			});

			test("Create second note", async () => {
				expect(await provider.getNotes()).toHaveLength(1);
				const note = await provider.createNote({title: "Note 2", content: "test", tagsId: [], categoryId: undefined});
				notesCache.push(note);
				const notes = await provider.getNotes();
				expect(notes).toHaveLength(2);
				expect(notes[SECOND_NOTE].title).toEqual(notesCache[SECOND_NOTE].title);
			});

			test("Create third note", async () => {
				expect(await provider.getNotes()).toHaveLength(2);
				const note = await provider.createNote({title: "Note 3", content: "test", tagsId: [], categoryId: undefined});
				notesCache.push(note);
				const notes = await provider.getNotes();
				expect(notes).toHaveLength(3);
				expect(notes[THIRD_NOTE].title).toEqual(notesCache[THIRD_NOTE].title);
			});

			test("Edit first note", async () => {
				await provider.updateNote(notesCache[FIRST_NOTE].id, {title: "Note 1 edited"});

				notes = await provider.getNotes();
				expect(notes[0].title).toEqual("Note 1 edited");
				expect(notes[1].title).toEqual(notesCache[1].title);
				expect(notes[2].title).toEqual(notesCache[2].title);
			});

			test("Edit sccond note", async () => {
				await provider.updateNote(notesCache[SECOND_NOTE].id, {title: "Note 2 edited"});

				notes = await provider.getNotes();
				expect(notes[0].title).toEqual("Note 1 edited");
				expect(notes[1].title).toEqual("Note 2 edited");
				expect(notes[2].title).toEqual(notesCache[2].title);
			});

			test("Edit last note", async () => {
				await provider.updateNote(notesCache[THIRD_NOTE].id, {title: "Note 3 edited"});

				notes = await provider.getNotes();
				expect(notes[0].title).toEqual("Note 1 edited");
				expect(notes[1].title).toEqual("Note 2 edited");
				expect(notes[2].title).toEqual("Note 3 edited");
			});

			test("Delete second note", async () => {
				const notesBefore = await provider.getNotes();

				await provider.deleteNote(notesBefore[SECOND_NOTE].id);
				const notes = await provider.getNotes();
				expect(notes).toHaveLength(2);

				expect(notes[0].id).toEqual(notesBefore[FIRST_NOTE].id);
				expect(notes[1].id).toEqual(notesBefore[THIRD_NOTE].id);
			});

			test("Delete first note", async () => {
				const notesBefore = await provider.getNotes();

				await provider.deleteNote(notesBefore[FIRST_NOTE].id);
				const notes = await provider.getNotes();
				expect(notes).toHaveLength(1);

				expect(notes[0].id).toEqual(notesBefore[SECOND_NOTE].id);
			});

			test("Delete last note", async () => {
				const notesBefore = await provider.getNotes();

				await provider.deleteNote(notesBefore[FIRST_NOTE].id);

				const notes = await provider.getNotes();
				expect(notes).toHaveLength(0);
			});
		});

		describe("Tags", () => {
			let tag1: TagModel;
			let tag2: TagModel;

			test("Empty results", async () => {
				const tags = await provider.getTags();
				expect(tags).toHaveLength(0);
			});

			test("Adding first tag", async () => {
				tag1 = await provider.createTag({name: "Tag 1", color: {r: 1, g: 1, b: 1}});
				const tags = await provider.getTags();
				expect(tags).toHaveLength(1);

				expect(tags[FIRST_NOTE]).toHaveProperty("name");
				expect(tags[FIRST_NOTE]).toHaveProperty("color");
			});

			test("Adding second tag", async () => {
				tag2 = await provider.createTag({name: "Tag 2", color: {r: 1, g: 1, b: 1}});
				const tags = await provider.getTags();
				expect(tags).toHaveLength(2);
			});

			test("Modify first tag doesn't affect others", async () => {
				await provider.updateTag(tag1.id, {name: "Tag 1 edited"});
				const tags = await provider.getTags();
				expect(tags).toHaveLength(2);
				expect(tags[0].name).toStrictEqual("Tag 1 edited");
				expect(tags[1].name).toStrictEqual("Tag 2");
			});

			test("Delete first tag doesn't affect others", async () => {
				await provider.deleteTag(tag1.id);
				const tags = await provider.getTags();
				expect(tags).toHaveLength(1);
				expect(tags[0].name).toStrictEqual("Tag 2");
			});

			test("Delete second tag", async () => {
				await provider.deleteTag(tag2.id);
				const tags = await provider.getTags();
				expect(tags).toHaveLength(0);
			});
		});

		describe("Add/Remove tags to/from notes", () => {
			let notesCache: NoteModel[] = [];
			let tagsCache: TagModel[] = [];

			it("creates 2 notes", async () => {
				await provider.createNote({title: "Note 1", content: "content", tagsId: [], categoryId: undefined});
				await provider.createNote({title: "Note 2", content: "content", tagsId: [], categoryId: undefined});
				notesCache = await provider.getNotes();
			});

			it("creates 2 tags", async () => {
				await provider.createTag({name: "Tag 1", color: {r: 1, g: 1, b: 1}});
				await provider.createTag({name: "Tag 2", color: {r: 1, g: 1, b: 1}});
				tagsCache = await provider.getTags();
			});

			it("adds Tag 1 to Note 2", async () => {
				await provider.addTagToNote(notesCache[1].id, tagsCache[0].id);
				const notes = await provider.getNotes();

				expect(notes[0].tagsId).toHaveLength(0);

				expect(notes[1].tagsId).toHaveLength(1);
				expect(notes[1].tagsId[0]).toStrictEqual(tagsCache[0].id);
			});

			it("adds Tag 2 to Note 2", async () => {
				await provider.addTagToNote(notesCache[1].id, tagsCache[1].id);
				const notes = await provider.getNotes();

				expect(notes[0].tagsId).toHaveLength(0);

				expect(notes[1].tagsId).toHaveLength(2);
				expect(notes[1].tagsId[0]).toStrictEqual(tagsCache[0].id);
				expect(notes[1].tagsId[1]).toStrictEqual(tagsCache[1].id);
			});

			it("fails silently adding Tag 2 to Note 2 again", async () => {
				await provider.addTagToNote(notesCache[1].id, tagsCache[1].id);
				const notes = await provider.getNotes();
				expect(notes[1].tagsId).toHaveLength(2);
				expect(notes[1].tagsId[0]).toStrictEqual(tagsCache[0].id);
				expect(notes[1].tagsId[1]).toStrictEqual(tagsCache[1].id);
			});
			
			it("removes Tag 1 from Note 2", async () => {
				await provider.removeTagFromNote(notesCache[1].id, tagsCache[0].id);
				const notes = await provider.getNotes();
				expect(notes[1].tagsId).toHaveLength(1);
				expect(notes[1].tagsId[0]).toStrictEqual(tagsCache[1].id);
			});
			
			it("deletes Tag 2, should remove it from notes automatically", async () => {
				await provider.deleteTag(tagsCache[1].id);

				const tags = await provider.getTags();
				expect(tags).toHaveLength(1);
				expect(tags[0].id).toStrictEqual(tagsCache[0].id);

				const notes = await provider.getNotes();
				expect(notes[1].tagsId).toHaveLength(0);
			});
			
			it("delete last tag", async () => {
				await provider.deleteTag(tagsCache[0].id);

				const tags = await provider.getTags();
				expect(tags).toHaveLength(0);
			});
		});

		describe("Categories", () => {
			let category1: CategoryModel;
			let category2: CategoryModel;

			test("Empty results", async () => {
				const categories = await provider.getCategories();
				expect(categories).toHaveLength(0);
			});

			test("Adding first category", async () => {
				category1 = await provider.createCategory({name: "Category 1"});
				const categories = await provider.getCategories();
				expect(categories).toHaveLength(1);

				expect(categories[FIRST_NOTE]).toHaveProperty("name");
			});

			test("Adding second category", async () => {
				category2 = await provider.createCategory({name: "Category 2"});
				const categories = await provider.getCategories();
				expect(categories).toHaveLength(2);
			});

			test("Modify first category doesn't affect others", async () => {
				await provider.updateCategory(category1.id, {name: "Category 1 edited"});
				const categories = await provider.getCategories();
				expect(categories).toHaveLength(2);
				expect(categories[0].name).toStrictEqual("Category 1 edited");
				expect(categories[1].name).toStrictEqual("Category 2");
			});

			test("Delete first category doesn't affect others", async () => {
				await provider.deleteCategory(category1.id);
				const categories = await provider.getCategories();
				expect(categories).toHaveLength(1);
				expect(categories[0].name).toStrictEqual("Category 2");
			});

			test("Delete second category", async () => {
				await provider.deleteCategory(category2.id);
				const categories = await provider.getCategories();
				expect(categories).toHaveLength(0);
			});
		});
	});

	describe("Wrong uses", () => {
		let provider: Api;

		beforeAll(async () => {
			provider = await createProvider();

			await provider.createNote({title: "Note 1", content: "test", tagsId: [], categoryId: undefined});
			await provider.createNote({title: "Note 2", content: "test", tagsId: [], categoryId: undefined});

			await provider.createTag({name: "Tag 1", color: {r: 1, g: 1, b: 1}});
			await provider.createTag({name: "Tag 2", color: {r: 1, g: 1, b: 1}});

			await provider.createCategory({name: "Category 1"});
			await provider.createCategory({name: "Category 2"});
		});

		it("throws error when trying to update a note with an unknown id", async () => {
			expect(provider.updateNote("7355608", {title: "Note unknown"})).rejects.toThrow(UnknownIdError);
		});

		it("throws error when trying to delete a note with an unknown id", async () => {
			expect(provider.deleteNote("7355608")).rejects.toThrow(UnknownIdError);
		});

		it("throws error when trying to update a tag with an unknown id", async () => {
			expect(provider.updateTag("7355608", {name: "Tag unknown"})).rejects.toThrow(UnknownIdError);
		});

		it("throws error when trying to delete a tag with an unknown id", async () => {
			expect(provider.deleteTag("7355608")).rejects.toThrow(UnknownIdError);
		});

		it("throws error when trying to update a category with an unknown id", async () => {
			expect(provider.updateCategory("7355608", {name: "Tag unknown"})).rejects.toThrow(UnknownIdError);
		});

		it("throws error when trying to delete a category with an unknown id", async () => {
			expect(provider.deleteCategory("7355608")).rejects.toThrow(UnknownIdError);
		});
	});
}