import type { NextApiRequest, NextApiResponse } from 'next';
import chalk from 'chalk';

export const jsonResponse = (req: NextApiRequest, res: NextApiResponse, code: number, data: any) => {
  const requestString = JSON.stringify(req.body);
  const responseString = JSON.stringify(data);

  console.log(
    chalk.yellow(new Date().toISOString()),
    chalk.gray(res.req.method),
    res.req.url,
    chalk.green(requestString.substring(0, 250) + (requestString.length > 250 ? '...' : '')),
    '=>',
    chalk.cyan(responseString.substring(0, 250) + (responseString.length > 250 ? '...' : ''))
  );

  res.status(code).json(data);
};
