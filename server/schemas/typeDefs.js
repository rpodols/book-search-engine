const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Book {
        _id: ID
        authors: String
        description: String
        image: String
        link: String
        title: String

    }

    type User {
        _id: ID
        username: String
        email: String
        password: String
        savedBooks: [Book]
    }

    type Query {
        me: User
        users: [User]
        user(username: String!): User
        books(username: String): [Book]
        book(_id: ID!): Book
    }

    type Mutation {
        login(email: String!, password: String!): User
        addUser(username: String!, email: String!, password: String!): User
    }

`;

module.exports = typeDefs;


  