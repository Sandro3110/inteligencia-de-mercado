/**
 * Vercel Serverless Function - Health Check
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    redis: process.env.REDIS_URL ? 'configured' : 'not configured',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    environment: process.env.NODE_ENV || 'development',
  });
}
