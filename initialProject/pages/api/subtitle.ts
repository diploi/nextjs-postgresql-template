import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Example of using values stored in environment variables
  res.json(process.env.SUBTITLE);
};
