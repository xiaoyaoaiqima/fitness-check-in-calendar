import { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // 检查用户是否已存在
    const existingUser = await redis.get(`user:${username}`);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 保存用户
    await redis.set(`user:${username}`, {
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 