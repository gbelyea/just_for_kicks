const resolvers = {
  Query: {
    ExampleQuery: (_parent, args, { context }, info) => 'Hello World'
  }
};

export default resolvers;
