import dotenv from 'dotenv';
import { createApp } from './api/app.js';
import { pool } from './config/db.js';

dotenv.config();

const app = createApp();
const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server is working on port ${port}`);
});

process.on('SIGINT', () => {
  void pool.end().finally(() => process.exit(0));
});

process.on('SIGTERM', () => {
  void pool.end().finally(() => process.exit(0));
});
