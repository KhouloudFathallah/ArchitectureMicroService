const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { MongoClient, ObjectID } = require("mongodb");
const userProtoPath = "user.proto";
const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;
const url = "mongodb+srv://khouloudfathallah:khouloud13@cluster0.ypkkm3r.mongodb.net/";
const dbName = "khouloudfathallah";

async function connect() {
  const client = new MongoClient(url);
  await client.connect();
  return client.db(dbName);
}
const userService = {
  getUser: async (call, callback) => {
    const db = await connect();
    const id = call.request.user_id;
    const user = await db.collection("users").findOne({ _id: ObjectID(id) });
    callback(null, { user: user });
  },
  searchUsers: async (call, callback) => {
    const db = await connect();
    const users = await db.collection("users").find().toArray();
    callback(null, { users: users });
  },
  createUser: async (call, callback) => {
    const { name, email, password } = req.body;
    const db = await connect();
    const user = {
      name,
      email,
      password,
    };
    await db.collection("users").insertOne(user);
    res.json(user);
  },
  updateUser: async (call, callback) => {
    const db = await connect();
    const { user_id, name, email, password } = call.request;
    const updatedUser = {
      user_id,
      name,
      email,
      password,
    };
    await db
      .collection("users")
      .updateOne({ _id: ObjectID(user_id) }, { $set: updatedUser });
    const user = await db
      .collection("users")
      .findOne({ _id: ObjectID(user_id) });
    callback(null, { user: user });
  },
  deleteUser: async (call, callback) => {
    const db = await connect();
    const user_id = call.request.user_id;
    const result = await db
      .collection("users")
      .deleteOne({ _id: ObjectID(user_id) });
    const success = result.deletedCount > 0;
    callback(null, { success });
  },
};

const server = new grpc.Server();
server.addService(userProto.UserService.service, userService);
const port = 50051;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Failed to bind server:", err);
      return;
    }

    console.log(`Server is running on port ${port}`);
    server.start();
  }
);
console.log(`User microservice running on port ${port}`);
