import SQLiteProvider from "../api-providers/SQLiteProvider";
import fs from "fs/promises";
import testScenario from "./scenario";

async function createSQLiteProvider(): Promise<SQLiteProvider> {
	await fs.rm("./tests.sqlite3", {force: true});
	const provider = await SQLiteProvider.create("./tests.sqlite3");
	return provider;
}

describe("SQLite provider", () => {
	testScenario(createSQLiteProvider);
});