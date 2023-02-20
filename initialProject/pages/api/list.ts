import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'sql-template-strings';
import { query } from '../../lib/db';
import { jsonResponse } from '../../lib/apiHelpers';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const list = await query(
      sql`SELECT id, checked, name, time_update FROM todo ORDER BY sort`
    );
    jsonResponse(req, res, 200, { status: 'ok', list });
  } catch (error) {
    console.log(error);
    jsonResponse(req, res, 500, { status: 'error' });
  }
};
