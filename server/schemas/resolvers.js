const { Book, User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } =  require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
            const userData = await User
                .findOne({ _id: context.user._id})
                .select('-__v -password')
                .populate('books')
            return userData;
            }

            throw new AuthenticationError('Please log in.');
        },
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
        },
        saveBook: async(parent, { bookInfo }, context) => {
            if (context.user) {
                const addBookToUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookInfo } },
                    { new: true }
                    );
                return addBookToUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async(parent, { bookId }, context) => {
            if (context.user) {
                const removeBookFromUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return removeBookFromUser;
            }
            throw new AuthenticationError('You need to be logged in!')
        }
    }
};

module.exports = resolvers;