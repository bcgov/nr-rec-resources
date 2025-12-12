import { Client } from 'pg';

export function getClient(): Client {
  const dbClient = new Client({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'rst',
    port: 5432,
  });

  return dbClient;
}
