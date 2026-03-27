import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authenticateToken, AuthRequest } from './auth.middleware';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../services/mail.service';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    role: z.enum(['MAIN_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'HOD', 'FACULTY', 'STUDENT']),
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
        departmentId: departmentId || undefined,
        shift: shift || undefined,
        year: year || undefined,
        rollNumber: rollNumber || null,
        enrollmentNumber: enrollmentNumber || null,
        phoneNumber: phoneNumber || null,
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
    console.log(`[Auth]: Login attempt for ${email}`);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`[Auth]: User Not Found - ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'APPROVED') {
      console.warn(`[Auth]: User Not Approved - ${email} (Status: ${user.status})`);
      const message = user.status === 'PENDING' 
        ? 'Your registration is pending administrator approval.' 
        : 'Your registration has been rejected. Please contact support.';
      return res.status(403).json({ message });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn(`[Auth]: Password Mismatch - ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    console.log(`[Auth]: Login Successful - ${email} (${user.role})`);
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
    console.error(`[Auth]: Login Error for ${req.body.email}:`, error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        departmentId: true,
        status: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.upsert({
      where: { token },
      update: { token, expiresAt },
      create: { email, token, expiresAt }
    });

    try {
      await sendResetPasswordEmail(email, token);
      res.json({ message: 'Password reset email sent' });
    } catch (mailError) {
      console.error('[Auth]: Error sending reset email:', mailError);
      res.status(500).json({ message: 'Error sending reset email' });
    }
  } catch (error) {
    console.error('[Auth]: Forgot Password Fatal Error:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    });

    // Delete used token
    await prisma.passwordResetToken.delete({ where: { token } });

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
});

export default router;
