const { Book, User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } =  require('../utils/auth')

const resolvers = {
    Query: {
        books: async (parent, { username }) => {
            const params = username ? { username } : {};
            return Book.find(params);
        },
        book: async (parent, { _id }) => {
            return Book.findOne({ _id });
        },
        users: async () => {
            return User.find()
                .select('-__v -password')
                .populate('books');
        },
        user: async (parent, { username }) => {
            return User.findOne({ username })
                .select('-__v -password')
                .populate('books');
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Provided email does not have an account associated with it!  Please try again.');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!');
            }
            
            const token = signToken(user);
            return { token, user };
        }
    }
};

module.exports = resolvers;