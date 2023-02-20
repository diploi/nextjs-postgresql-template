import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'sql-template-strings';
import { query } from '../../lib/db';
import { jsonResponse } from '../../lib/apiHelpers';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, checked, name } = req.body as {
    id: number;
    checked: boolean;
    name: string;
  };

  try {
    await query(
      sql`UPDATE todo SET checked=${checked}, name=${name}, time_update=now() WHERE id=${id}`
    );
    jsonResponse(req, res, 200, { status: 'ok' });
  } catch (error) {
    console.log(error);
    jsonResponse(req, res, 500, { status: 'error' });
  }
};
