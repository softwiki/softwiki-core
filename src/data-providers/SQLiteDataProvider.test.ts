import SQLiteDataProvider from "./SQLiteDataProvider";
import fs from "fs/promises";
import testScenario from "../tests/scenario";

async function createSQLiteProvider(): Promise<SQLiteDataProvider> {
	await fs.rm("./tests.sqlite3", {force: true});
	const provider = await SQLiteDataProvider.create("./tests.sqlite3");
	return provider;
}

describe("SQLite provider", () => {
	testScenario(createSQLiteProvider);
});