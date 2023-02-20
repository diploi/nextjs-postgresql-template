import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'sql-template-strings';
import { query } from '../../lib/db';
import { jsonResponse } from '../../lib/apiHelpers';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const id = (await query(
      sql`INSERT INTO todo (checked, name, sort, time_update) VALUES (FALSE, '', (SELECT coalesce(max(sort),0)+1 FROM todo), now()) RETURNING id`
    ))[0].id;
    jsonResponse(req, res, 200, { status: 'ok', id });
  } catch (error) {
    console.log(error);
    jsonResponse(req, res, 500, { status: 'error' });
  }
};
