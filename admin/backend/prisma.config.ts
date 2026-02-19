import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const user = process.env.POSTGRES_USER;
const password = encodeURIComponent(process.env.POSTGRES_PASSWORD || '');
const host = process.env.POSTGRES_HOST || 'localhost';
const port = process.env.POSTGRES_PORT || '5432';
const database = process.env.POSTGRES_DATABASE;
const schema = process.env.POSTGRES_SCHEMA || 'rst';
const url = `postgresql://${user}:${password}@${host}:${port}/${database}?schema=${schema}`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url,
  },
});
