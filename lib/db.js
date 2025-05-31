import { MongoClient } from "mongodb";

let client;
let clientPromise;

const options = {};

// ❗ 이 위치에서 환경변수 직접 불러오면 안 됨 → 대신 조건 안에서만 접근
if (!global._mongoClientPromise) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("❌ 환경변수 MONGODB_URI가 설정되지 않았습니다");
  }

  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db("spontany");
  return { db };
}