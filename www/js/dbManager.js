import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { Preferences } from "@capacitor/preferences";

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db = null;

async function copyDBIfFirstTime() {
  const { value } = await Preferences.get({ key: "db_copied" });

  if (value !== "true") {
    try {
      await CapacitorSQLite.copyFromAssets();
      console.log("Database copied from assets");
      await Preferences.set({ key: "db_copied", value: "true" });
    } catch (err) {
      console.error("Failed to copy DB from assets:", err);
    }
  } else {
    console.log("DB already copied, skipping...");
  }
}

export async function getConnection() {
  if (db) return db;

  try {
    try {
      await copyDBIfFirstTime() 
    } catch (e) {
      console.warn("Database might have already been copied.");
    }
    const isConn = await sqlite.isConnection("filedb", false);

    if (isConn.result) {
      db = await sqlite.retrieveConnection("filedb");
    } else {
        db = await sqlite.createConnection(
        "filedb",
        false,
        "no-encryption",
        1,
        false
      );
    }

    await db.open();
    return db;
  } catch (err) {
    console.error("Failed to get DB connection:", err);
    return null;
  }
}

export async function closeConnection() {
  try {
    await sqlite.closeConnection("filedb");
    db = null;
  } catch (err) {
    console.error("Error closing connection:", err);
  }
}
