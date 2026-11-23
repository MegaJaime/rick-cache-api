import { startServer } from './app';

startServer().catch((error) => {
  console.error('Error during app initialization:', error);
  process.exit(1);
});
