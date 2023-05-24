const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { MongoClient, ObjectId } = require("mongodb");
const userProtoPath = "user.proto";
const productProtoPath = "product.proto";

const resolvers = require("./resolvers");
const typeDefs = require("./schema");

const app = express();
app.use(bodyParser.json());

const userProtoDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProtoDefinition = protoLoader.loadSync(productProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;
const productProto = grpc.loadPackageDefinition(productProtoDefinition).product;
const clientUsers = new userProto.UserService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);
const clientProducts = new productProto.ProductService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);
// MongoDB connection
const url = "mongodb+srv://khouloudfathallah:khouloud13@cluster0.ypkkm3r.mongodb.net/";
const dbName = "khouloudfathallah";

async function connect() {
  const client = new MongoClient(url);
  await client.connect();
  return client.db(dbName);
}
const server = new ApolloServer({ typeDefs, resolvers });

server.start().then(() => {
  app.use(cors(), bodyParser.json(), expressMiddleware(server));
});

app.get("/users", async (req, res) => {
  const db = await connect();
  const users = await db.collection("users").find().toArray();
  res.json(users);
});

app.post("/user", async (req, res) => {
  const { name, email, password } = req.body;
  const db = await connect();
  const user = {
    name,
    email,
    password,
  };
  await db.collection("users").insertOne(user);
  res.json(user);
});

app.post("/product", async (req, res) => {
  const { title, description, price } = req.body;
  const db = await connect();
  const product = {
    title,
    description,
    price,
  };
  await db.collection("products").insertOne(product);
  res.json(product);
});
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const db = await connect();
  const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
  res.json(user);
});

app.put("/user/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, password } = req.body;
  const db = await connect();
  const user = {
    name,
    email,
    password,
  };
  const result = await db
    .collection("users")
    .updateOne({ _id: new ObjectId(id) }, { $set: user });
  res.json(user);
});

app.get("/products", async (req, res) => {
  const db = await connect();
  const products = await db.collection("products").find().toArray();
  res.json(products);
});

app.delete("/user/:id", async (req, res) => {
  const id = req.params.id;
  const db = await connect();
  await db.collection("users").deleteOne({ _id: new ObjectId(id) });
  res.json({ message: "User deleted successfully" });
});

app.get("/products/:id", async (req, res) => {
  const id = req.params.id;
  const db = await connect();
  const product = await db
    .collection("products")
    .findOne({ _id: new ObjectId(id) });
  res.json(product);
});

app.delete("/product/:id", async (req, res) => {
  const id = req.params.id;
  const db = await connect();
  await db.collection("products").deleteOne({ _id: new ObjectId(id) });
  res.json({ message: "Product deleted successfully" });
});

app.put("/product/:id", async (req, res) => {
  const id = req.params.id;
  const { title, description, price } = req.body;
  const db = await connect();
  const product = {
    title,
    description,
    price,
  };
  const result = await db
    .collection("products")
    .updateOne({ _id: new ObjectId(id) }, { $set: product });
  res.json(product);
});

const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
