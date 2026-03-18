import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Get all chat sessions (Direct & Groups) for the current user
router.get('/sessions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // 1. Get Direct Chats (where user is sender or receiver)
    // In a real system, we might need a separate 'Conversation' model, 
    // but for now we'll fetch unique partners from messages.
    const directPartners = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, groupId: null },
          { receiverId: userId, groupId: null }
        ]
      },
      select: {
        senderId: true,
        receiverId: true,
      },
      distinct: ['senderId', 'receiverId'],
    });

    const partnerIds = new Set<string>();
    directPartners.forEach(m => {
      if (m.senderId !== userId) partnerIds.add(m.senderId);
      if (m.receiverId && m.receiverId !== userId) partnerIds.add(m.receiverId);
    });

    const partners = await prisma.user.findMany({
      where: { id: { in: Array.from(partnerIds) } },
      select: { id: true, name: true, role: true }
    });

    // 2. Get Groups the user is a member of
    const groups = await prisma.chatGroup.findMany({
      where: { members: { some: { id: userId } } },
      include: { course: true }
    });

    res.json({
        direct: partners,
        groups: groups
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat sessions', error });
  }
});

// Get messages for a specific partner (Direct) or Group
router.get('/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { partnerId, groupId } = req.query;
    const userId = req.user!.userId;

    const messages = await prisma.message.findMany({
      where: groupId ? {
        groupId: String(groupId)
      } : {
        OR: [
          { senderId: userId, receiverId: String(partnerId) },
          { senderId: String(partnerId), receiverId: userId }
        ],
        groupId: null
      },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { name: true, id: true } } }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
});

// Send a message
router.post('/send', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { content, receiverId, groupId } = req.body;
    const senderId = req.user!.userId;

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId: receiverId || null,
        groupId: groupId || null
      },
      include: { sender: { select: { name: true } } }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
});

// Create/Join Group (Automatically done for courses, but manual for testing)
router.post('/groups', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, memberIds } = req.body;
        const group = await prisma.chatGroup.create({
            data: {
                name,
                description,
                members: {
                    connect: [...(memberIds || []).map((id: string) => ({ id })), { id: req.user!.userId }]
                }
            }
        });
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: 'Error creating group', error });
    }
});

export default router;
