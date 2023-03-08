import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'sql-template-strings';
import { query } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.body.id as number;

  await query(sql`DELETE FROM todo WHERE id = ${id}`);

  res.send('ok');
};
