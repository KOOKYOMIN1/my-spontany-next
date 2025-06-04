// 1. /lib/db.js (몽고디비 연결)
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error("MONGODB_URI 환경변수가 없습니다");
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

/**
 * DB 연결 (재사용 가능)
 * @returns { client, db }
 */
export async function connectToDatabase() {
  const client = await clientPromise;
  // "spontany"는 DB 이름, Atlas에서 사용한 것과 동일하게!
  const db = client.db("spontany");
  return { client, db };
}