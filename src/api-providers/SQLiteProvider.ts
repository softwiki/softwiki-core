/* eslint @typescript-eslint/no-unused-vars: off */

import { TagProperties, NoteProperties } from "../objects";
import Api, { NoteModel, CategoryModel, TagModel } from "./Api";
import { CategoryProperties } from "../objects/Category";
import sqlite, { RunResult } from "sqlite3";

const TABLE_NOTES = "notes";
const TABLE_TAGS = "tags";
const TABLE_CATEGORIES = "categories";
const TABLE_LINK_NOTES_TAGS = "link_notes_tags";

export default class SQLiteProvider extends Api
{
	private _filename: string
	private _db: sqlite.Database

	private constructor(filename: string)
	{
		super();
		this._filename = filename;
		this._db = new sqlite.Database(this._filename);
	}

	public static async create(filename: string): Promise<SQLiteProvider>
	{
		const db = new SQLiteProvider(filename);
		await db.setup();
		return db;
	}

	public async setup(): Promise<void>
	{
		await this._run(`
			CREATE TABLE IF NOT EXISTS '${TABLE_NOTES}' (
				'id' INTEGER PRIMARY KEY,
				'title' VARCHAR(64) NOT NULL,
				'content' TEXT NOT NULL,
				'categoryId' INTEGER,
				FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
			)`);

		await this._run(`
			CREATE TABLE IF NOT EXISTS '${TABLE_TAGS}' (
				'id' INTEGER PRIMARY KEY,
				'name' VARCHAR(64) NOT NULL,
				'color' VARCHAR(64) NOT NULL
			)`);

		await this._run(`
			CREATE TABLE IF NOT EXISTS '${TABLE_CATEGORIES}' (
				'id' INTEGER PRIMARY KEY,
				'name' VARCHAR(64) NOT NULL
			)`);

		await this._run(`
			CREATE TABLE IF NOT EXISTS '${TABLE_LINK_NOTES_TAGS}' (
				'id' INTEGER PRIMARY KEY,
				'noteId' INTEGER NOT NULL,
				'tagId' INTEGER NOT NULL,
				FOREIGN KEY (noteId) REFERENCES notes(id),
				FOREIGN KEY (tagId) REFERENCES tags(id),
				UNIQUE(noteId, tagId)
			)`);
	}

	private _run(query: string): Promise<RunResult>
	{
		return new Promise((resolve, reject) =>
		{
			this._db.run(query, function(err)
			{
				if (err)
					return reject(err);
				resolve(this);
			});
		});
	}

	private _all(query: string): Promise<any[]>
	{
		return new Promise((resolve, reject) =>
		{
			this._db.all(query, function(err, raws)
			{
				if (err)
					return reject(err);
				resolve(raws);
			});
		});
	}

	public async createNote(properties: NoteProperties): Promise<NoteModel>
	{
		const propertiesForSQL: Partial<NoteProperties> = properties;
		delete propertiesForSQL.tagsId;
		
		const keys = Object.keys(propertiesForSQL).map((value: string) => `'${value}'`).join(", ");
		const values = (Object.values(propertiesForSQL) as string[]).map((value: string) => `'${value}'`).join(", ");

		const sqlQuery = `INSERT INTO ${TABLE_NOTES} (${keys}) VALUES (${values})`;
		const runResult = await this._run(sqlQuery);
		return {...properties, id: runResult.lastID.toString()};
	}

	public async getNotes(): Promise<NoteModel[]>
	{
		const notes = await this._all(`SELECT CAST(n.id AS VARCHAR) id, n.title, n.content, n.categoryId, group_concat(tagId) AS tagsId
		FROM ${TABLE_NOTES} AS n
		LEFT JOIN ${TABLE_LINK_NOTES_TAGS} AS l
		ON n.id = l.noteId
		GROUP BY n.id`) as NoteModel[];

		for (const note of notes)
		{
			note.tagsId = note.tagsId ? (note.tagsId as unknown as string).split(",") : []
		}

		return notes;
	}

	public async updateNote(id: string, properties: Partial<NoteModel>): Promise<void>
	{
		const propertiesForSQL: Partial<NoteProperties> = properties;
		delete propertiesForSQL.tagsId;
		
		const entries = Object.entries(propertiesForSQL).map(([key, value]) => `${key} = '${value}'`).join(",");

		const sqlQuery = `UPDATE ${TABLE_NOTES} SET ${entries} WHERE id = ${id}`;
		await this._run(sqlQuery);
	}

	public async deleteNote(id: string): Promise<void>
	{
		await this._run(`DELETE FROM ${TABLE_NOTES} WHERE id = ${id}`)
	}

	public async createTag(properties: TagProperties): Promise<TagModel>
	{
		const sqlQuery = `INSERT INTO ${TABLE_TAGS} (name, color) VALUES ('${properties.name}', '${JSON.stringify(properties.color)}')`;
		const runResult = await this._run(sqlQuery)
		return {...properties, id: runResult.lastID.toString()};
	}

	public async getTags(): Promise<TagModel[]>
	{
		const tagsRaw = await this._all(`
			SELECT CAST(t.id AS VARCHAR) id, t.name, t.color 
			FROM ${TABLE_TAGS} t`) as any[]
		const tags: TagModel[] = tagsRaw.map((tagRaw) => {return {...tagRaw, color: JSON.parse(tagRaw.color)}});
		return tags;
	}

	public async updateTag(id: string, properties: Partial<TagModel>): Promise<void>
	{
		const entries = Object.entries(properties).map(([key, value]) => `${key} = '${value}'`).join(",");
		await this._run(`UPDATE ${TABLE_TAGS} SET ${entries} WHERE id = ${id}`);
	}

	public async deleteTag(id: string): Promise<void>
	{
		await this._run(`DELETE FROM ${TABLE_TAGS} WHERE id = ${id}`)
		await this._run(`DELETE FROM ${TABLE_LINK_NOTES_TAGS} WHERE tagId=${id}`)
	}

	public async addTagToNote(noteId: string, tagId: string): Promise<void>
	{
		await this._run(`INSERT OR IGNORE INTO ${TABLE_LINK_NOTES_TAGS} (noteId, tagId) VALUES (${noteId}, ${tagId})`)
	}

	public async removeTagFromNote(noteId: string, tagId: string): Promise<void>
	{
		await this._run(`DELETE FROM ${TABLE_LINK_NOTES_TAGS} WHERE noteId='${noteId}' AND tagId='${tagId}'`);
	}

	public async createCategory(properties: CategoryProperties): Promise<CategoryModel>
	{
		const runResult = await this._run(`INSERT INTO ${TABLE_CATEGORIES} (name) VALUES ('${properties.name}')`)
		return {...properties, id: runResult.lastID.toString()};
	}

	public async getCategories(): Promise<CategoryModel[]>
	{
		return await this._all(`
			SELECT CAST(c.id AS VARCHAR) id, c.name 
			FROM ${TABLE_CATEGORIES} c`) as CategoryModel[];
	}

	public async updateCategory(id: string, properties: Partial<CategoryProperties>): Promise<void>
	{
		const entries = Object.entries(properties).map(([key, value]) => `${key} = '${value}'`).join(",");
		await this._run(`UPDATE ${TABLE_CATEGORIES} SET ${entries} WHERE id = ${id}`);
	}

	public async deleteCategory(id: string): Promise<void>
	{
		await this._run(`DELETE FROM ${TABLE_CATEGORIES} WHERE id = ${id}`)
	}
}