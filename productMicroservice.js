const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { MongoClient, ObjectID } = require("mongodb");
const productProtoPath = "product.proto";
const productProtoDefinition = protoLoader.loadSync(productProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(productProtoDefinition).product;
const url = "mongodb+srv://khouloudfathallah:khouloud13@cluster0.ypkkm3r.mongodb.net/";
const dbName = "khouloudfathallah";

async function connect() {
  const client = new MongoClient(url);
  await client.connect();
  return client.db(dbName);
}
const productService = {
  getProduct: async (call, callback) => {
    const db = await connect();
    const id = call.request.product_id;
    const product = await db
      .collection("products")
      .findOne({ _id: ObjectID(id) });
    callback(null, { product: product });
  },
  searchProducts: async (call, callback) => {
    const db = await connect();
    const products = await db.collection("products").find().toArray();
    callback(null, { products: products });
  },
  createProduct: async (call, callback) => {
    const { title, description, price } = req.body;
    const db = await connect();
    const product = {
      title,
      description,
      price,
    };
    await db.collection("products").insertOne(product);
    res.json(product);
  },

  updateProduct: async (call, callback) => {
    const db = await connect();
    const { updateProductId, title, description, price } = call.request;
    const updatedProduct = {
      title,
      description,
      price,
    };
    await db
      .collection("products")
      .updateOne({ _id: ObjectID(updateProductId) }, { $set: updatedProduct });
    const product = await db
      .collection("products")
      .findOne({ _id: ObjectID(updateProductId) });
    callback(null, { product: product });
  },

  deleteProduct: async (call, callback) => {
    const db = await connect();
    const product_id = call.request.product_id;
    const result = await db
      .collection("products")
      .deleteOne({ _id: ObjectID(product_id) });
    const success = result.deletedCount > 0;
    callback(null, { success });
  },
};

const server = new grpc.Server();
server.addService(productProto.ProductService.service, productService);
const port = 50052;
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
console.log(`Product microservice running on port ${port}`);
