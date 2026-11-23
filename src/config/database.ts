import { Dialect, Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const database = process.env.DB_NAME || 'admin';
const username = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || 'admin';
const host = process.env.DB_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT) || 3306;
const dialect = (process.env.DB_DIALECT || 'mysql') as Dialect;

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect,
  logging: false,
  dialectOptions: {
    charset: 'utf8mb4',
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDatabase = async () => {
  const retries = 15;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await sequelize.authenticate();
      console.log('Connection to the database has been established successfully.');
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${retries} failed.`);
      if (attempt === retries) {
        throw error;
      }
      await sleep(2000);
    }
  }
};

export { sequelize, connectDatabase };
