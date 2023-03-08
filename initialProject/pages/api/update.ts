import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'sql-template-strings';
import { query } from '../../lib/db';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, checked, name } = req.body as {
    id: number;
    checked: boolean;
    name: string;
  };

  await query(sql`
    UPDATE todo SET checked = ${checked}, name = ${name} WHERE id = ${id}
  `);

res.send('ok');
};
