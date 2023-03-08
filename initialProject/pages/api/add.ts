import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'sql-template-strings';
import { query } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await query(sql`
    INSERT INTO todo (name, checked) VALUES ('', FALSE)
  `);

  res.send('ok');
};
