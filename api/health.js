/**
 * Vercel Serverless Function - Health Check
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    redis: process.env.REDIS_URL ? 'configured' : 'not configured',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    version: '3.0.0'
  });
}
