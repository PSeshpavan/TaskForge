import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test_secret";

  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  await mongoose.connect(uri);
});

afterEach(async () => {
  // wipe DB between tests
  if (mongoose.connection && mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const c of collections) await c.deleteMany({});
  } else {
    // Handle the case when the connection is not established
    console.error('Mongoose connection is not established');
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});