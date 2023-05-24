const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { MongoClient, ObjectId } = require("mongodb");
const userProtoPath = "user.proto";
const productProtoPath = "product.proto";
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

const url = "mongodb+srv://khouloudfathallah:khouloud13@cluster0.ypkkm3r.mongodb.net/";
const dbName = "khouloudfathallah";

async function connect() {
  const client = new MongoClient(url);
  await client.connect();
  return client.db(dbName);
}

const clientUsers = new userProto.UserService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);
const clientProducts = new productProto.ProductService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);

const resolvers = {
  Query: {
    user: (_, { id }) => {
      return new Promise(async (resolve, reject) => {
        const db = await connect();
        db.collection("users").findOne({ _id: ObjectId(id) }, (err, user) => {
          if (err) {
            reject(err);
          } else {
            resolve(user);
          }
        });
      });
    },
    users: () => {
      return new Promise(async (resolve, reject) => {
        const db = await connect();
        db.collection("users")
          .find()
          .toArray((err, users) => {
            if (err) {
              reject(err);
            } else {
              resolve(users);
            }
          });
      });
    },
    product: (_, { id }) => {
      return new Promise(async (resolve, reject) => {
        const db = await connect();
        db.collection("products").findOne(
          { _id: ObjectId(id) },
          (err, product) => {
            if (err) {
              reject(err);
            } else {
              resolve(product);
            }
          }
        );
      });
    },
    products: () => {
      return new Promise(async (resolve, reject) => {
        const db = await connect();
        db.collection("products")
          .find()
          .toArray((err, products) => {
            if (err) {
              reject(err);
            } else {
              resolve(products);
            }
          });
      });
    },
  },
  Mutation: {
    createUser: (_, { name, email, password }) => {
      return new Promise(async (resolve, reject) => {
        const db = await connect();
        db.collection("users").insertOne(
          {
            name,
            email,
            password,
          },
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve({
                name,
                email,
                password,
              });
            }
          }
        );
      });
    },
    /*updateUser: async ({ id, name, email, password }, context) => {
      const db = await connect();
      const user = {
        name,
        email,
        password,
      };

      const result = await db
        .collection("users")
        .updateOne({ _id: ObjectId(id) }, { $set: user });

      return user;
    },*/

    deleteUser: async (parent, { id }, context) => {
      const db = await connect();
      const result = await db
        .collection("users")
        .deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0; // Return true if deletion was successful
    },

    createProduct: (_, { title, description, price }) => {
      return new Promise(async (resolve, reject) => {
        const db = await connect();
        db.collection("products").insertOne(
          {
            title,
            description,
            price,
          },
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve({
                title,
                description,
                price,
              });
            }
          }
        );
      });
    },

   /* updateProduct: async (req,res, context) => {
      const db = await connect();
      const product = {
        title,
        description,
        price,
      } = req.body;

      const result = await db
        .collection("products")
        .updateOne({ _id: ObjectId(req.body.updateProductId) }, { $set: product });

      return product;
    },*/

    deleteProduct: async (parent, { id }, context) => {
      const db = await connect();
      const result = await db
        .collection("products")
        .deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0; // Return true if deletion was successful
    },
  },
};

module.exports = resolvers;
