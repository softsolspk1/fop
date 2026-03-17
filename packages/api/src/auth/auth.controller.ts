import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.enum(['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER', 'STUDENT']),
    departmentId: z.string().optional(),
    shift: z.enum(['MORNING', 'EVENING']).optional(),
    year: z.string().optional(),
    rollNumber: z.string().optional(),
    enrollmentNumber: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { 
      email, 
      password, 
      name, 
      role, 
      departmentId,
      shift,
      year,
      rollNumber,
      enrollmentNumber,
      phoneNumber 
    } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        departmentId,
        shift,
        year,
        rollNumber,
        enrollmentNumber,
        phoneNumber,
        status: role === 'STUDENT' ? 'PENDING' : 'APPROVED'
      },
    });

    res.status(201).json({ message: 'User created', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'APPROVED') {
      const message = user.status === 'PENDING' 
        ? 'Your registration is pending administrator approval.' 
        : 'Your registration has been rejected. Please contact support.';
      return res.status(403).json({ message });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
