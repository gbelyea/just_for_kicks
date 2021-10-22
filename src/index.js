import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { loadFilesSync } from '@graphql-tools/load-files';
import directiveResolvers from './directives';
import path from 'path';
import { startApolloServer } from './server';

// These are to help with the organization of the project as it grows, logical
// separation of schema objects and resolvers, schema and resolver directories can
// have as many files or subdirectories as you like
const typesArray = loadFilesSync(path.join(__dirname, './schema'), { extensions: ['graphql'], recursive: true });
const typeDefs = mergeTypeDefs(typesArray);
const resolversArray = loadFilesSync(path.join(__dirname, './resolvers'), { recursive: true });
const resolvers = mergeResolvers(resolversArray);


// directive resolvers are how you can lock down queries and mutations for only those who
// should be allowed to call them
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  directiveResolvers,
  inheritResolversFromInterfaces: true,
});

startApolloServer(schema);
