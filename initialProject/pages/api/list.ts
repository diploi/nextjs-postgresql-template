import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'sql-template-strings';
import { query } from '../../lib/db';

export type ListResponse = { list: { id: number; name: string; checked: boolean }[] };

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const list = await query(sql`
    SELECT id, name, checked FROM todo ORDER BY id
  `);

  res.json({ list });
};
