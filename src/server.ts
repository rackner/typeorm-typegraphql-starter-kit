import 'reflect-metadata';
import { createConnection, useContainer } from 'typeorm';
import { ApolloServer } from 'apollo-server-express';
import express = require('express');
import helmet = require('helmet');
import cors = require('cors');
import { Container } from 'typedi';
import compression = require('compression');
import bodyParser = require('body-parser');
import { ApolloLoggingPlugin } from './plugins';
import { ErrorLogger } from './middlewares';
import { alterContext, authChecker } from './utilities';
import { buildSchema } from 'type-graphql';
import { graphqlUploadExpress } from 'graphql-upload';

require('dotenv').config();

const initializeAndStartServer = async () => {
  // Allows dependency injection within TypeORM
  useContainer(Container);

  const connection = await createConnection({
    type: 'postgres',
    host: process.env.DB_URL,
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
    synchronize: true,
    cache: true,
    entities: [process.env.LOCAL ? '**/**.entity.ts' : 'dist/entities/**/*.js'],
    subscribers: ['dist/subscribers/**/*.js'],
    migrations: ['dist/migrations/**/*.js'],
    cli: {
      entitiesDir: 'src/entities',
      migrationsDir: 'src/migrations',
      subscribersDir: 'src/subscribers',
    },
  });
  // await connection.runMigrations();

  const app = express();

  // Enable CORS in application
  app.use(cors({ origin: true }));

  // Helps secure application by setting some various default HTTP headers
  app.use(helmet());

  // Compresses response bodies
  app.use(
    compression({
      filter: (req, res) => {
        return true;
      },
    }),
  );

  app.use(bodyParser.json());

  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  const schema = await buildSchema({
    resolvers: [`${__dirname}/resolvers/**/*.resolver.{ts,js}`],
    emitSchemaFile: true,
    container: Container,
    globalMiddlewares: [ErrorLogger],
    authChecker,
  });

  const apolloServer = new ApolloServer({
    schema,
    tracing: true,
    cacheControl: true,
    playground: true,
    plugins: [new ApolloLoggingPlugin()],
    context: async ({ req, res }) => alterContext(req, res),
    uploads: false, // disable appollo upload property and hand off ot graphql-upload
  });

  apolloServer.applyMiddleware({ app });

  await app.listen({ port: 3000 });
  console.log(
    `🍺 Server ready at http://localhost:3000${apolloServer.graphqlPath} 🍻`,
  );
};

initializeAndStartServer();
