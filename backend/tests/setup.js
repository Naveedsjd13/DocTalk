process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
let connected = false;

const connect = async () => {
  if (connected) return;
  mongoServer = await MongoMemoryServer.create({
    instance: { startupTimeoutMS: 60000 },
  });
  await mongoose.connect(mongoServer.getUri());
  connected = true;
};

const disconnect = async () => {
  if (!connected) return;
  await mongoose.disconnect();
  await mongoServer.stop();
  connected = false;
};

const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connect, disconnect, clearCollections };
