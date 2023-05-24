const { gql } = require("@apollo/server");

const typeDefs = `#graphql
  type User {
    name: String!
    email: String!
    password:String!
  }

  type Product {
    title: String!
    description: String!
    price:Float!
  }

  type Query {
    user(id: String!): User
    users: [User]
    product(id: String!): Product
    products: [Product]
  }
  type Mutation {
    createUser(name: String!, email:String!,password:String!): User
    createProduct( title: String!,description:String!,price:Float!): Product
    
      deleteUser(id: ID! ): Boolean
      
      deleteProduct(id: ID! ): Boolean

  
  }
`;

module.exports = typeDefs;
