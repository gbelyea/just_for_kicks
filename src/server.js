import 'dotenv/config';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { setupRoutes } from './rest/routes';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import redis from 'redis';
import bluebird from'bluebird';


// You can setup a free redis cloud instance and pass connection string here to attach to it
const client = redis.createClient(process.env.TEST_REDIS_CONNECTION_STRING);

// You can setup the mongo test data in a free mongo cloud cluster
const mongo = new MongoClient(process.env.TEST_MONGO_CONNECTION_STRING);

// Define the request origins you want to be in the env variable LOCAL_CORS_ORIGINS
// for instance if you ran a local UI on port 3000, then add http://localhost:3000 to the array
// or the request will be denied... google CORS for more information
const allowedOrigins = process.env.LOCAL_CORS_ORIGINS || ['http://localhost:4000','https://studio.apollographql.com'];

export async function startApolloServer(schema) {
  // Required logic for integrating with Express
  const app = express();
  const httpServer = http.createServer(app);

  // Node redis does not currently support promises so bluebird will take care of that for you
  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);

  // Same ApolloServer initialization as before, plus the drain plugin.
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    // context is available in all resolvers so add things to it that you may want to access freely
    context: async ({ req }) => ({
      redisClient: { client },
      dataSources: { mongo_dsrc: mongo },
      request: req,
      user: req.user,
    })
  });

  app.use(cors({
    origin(origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not '
          + 'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  }));

  // More required logic for integrating with Express
  await server.start();
  server.applyMiddleware({
    app,

    // By default, apollo-server hosts its GraphQL endpoint at the
    // server root. However, *other* Apollo Server packages host it at
    // /graphql. Optionally provide this to match apollo-server.
    path: '/graphql'
  });

  setupRoutes(app);

  // Modified server startup
  await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}



