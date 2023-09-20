// db.js
import { Pool } from 'pg';
import sql, { SQLStatement } from 'sql-template-strings';

export const conn = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT!) || 5432,
  database: process.env.POSTGRES_DB,
});

export const query = async (statement: string | SQLStatement) => {
  try {
    return (await conn.query(statement)).rows;
  } catch (error: any) {
    throw new Error(`\DB error: ${error.message}`);
  }
};
