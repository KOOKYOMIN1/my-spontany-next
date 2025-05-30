import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client;
let db;

export async function connectToDatabase() {
  if (db) return { db };

  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }

  db = client.db("spontany");
  return { db };
}