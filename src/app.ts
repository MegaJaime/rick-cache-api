import http from 'http';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { connectDatabase, sequelize } from './config/database';
import { initializeRedis } from './config/redis';
import { typeDefs } from './schema/characterSchema';
import { resolvers } from './resolvers/characterResolver';
import logger from './middleware/logger';
import { runCronJobManually, startCronJob } from './utils/cronJob';
import { Character } from './models/character';
import { characterService } from './services/characterService';

const app: Application = express();
const httpServer = http.createServer(app);

app.use(logger);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'rick-and-morty-api',
    graphql: '/graphql',
    health: '/health',
    cron: 'POST /cronjob/run',
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.post('/cronjob/run', async (_req: Request, res: Response) => {
  try {
    const count = await runCronJobManually();
    res.status(200).json({ message: 'Cron job executed successfully.', count });
  } catch (error) {
    console.error('Error executing cron job:', error);
    res.status(500).json({ message: 'Error executing cron job.' });
  }
});

export const startServer = async () => {
  await connectDatabase();
  await sequelize.sync();
  console.log('Database schema is ready');

  const count = await Character.count();
  if (count === 0) {
    try {
      const imported = await characterService.syncFromApi();
      console.log(`Imported ${imported} characters from the Rick and Morty API`);
    } catch (error) {
      console.error(
        'Initial character import failed. The server will start with an empty table. POST /cronjob/run to retry.',
        error
      );
    }
  }

  await initializeRedis();
  startCronJob();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    includeStacktraceInErrorResponses: false,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  app.use('/graphql', cors(), express.json(), expressMiddleware(server));

  const port = Number(process.env.PORT) || 4000;
  await new Promise<void>((resolve) => {
    httpServer.listen(port, resolve);
  });

  console.log(`Server is running on http://localhost:${port}`);
  console.log(`GraphQL ready at http://localhost:${port}/graphql`);
};

export default app;
