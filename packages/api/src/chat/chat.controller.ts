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

// ---------------------------------------------------------
// NEW ALIASED ROUTES FOR FRONTEND COMPATIBILITY
// ---------------------------------------------------------

// Get all groups for current user
router.get('/groups', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId;
        const groups = await prisma.chatGroup.findMany({
            where: { members: { some: { id: userId } } },
            include: { course: true }
        });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching groups', error });
    }
});

// Get messages for a specific group
router.get('/group/:id/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const messages = await prisma.message.findMany({
            where: { groupId: String(id) },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true, role: true } } }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching group messages', error });
    }
});

// Get messages for a specific DM
router.get('/dm/:id/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // Partner physical ID
        const userId = req.user!.userId;
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: String(id) },
                    { senderId: String(id), receiverId: userId }
                ],
                groupId: null
            },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true, role: true } } }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching DM messages', error });
    }
});

// Send message to group
router.post('/group/:id/send', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const message = await prisma.message.create({
            data: {
                content,
                senderId: req.user!.userId,
                groupId: String(id)
            },
            include: { sender: { select: { name: true } } }
        });
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error sending group message', error });
    }
});

// Send message to DM
router.post('/dm/:id/send', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const message = await prisma.message.create({
            data: {
                content,
                senderId: req.user!.userId,
                receiverId: String(id)
            },
            include: { sender: { select: { name: true } } }
        });
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error sending DM message', error });
    }
});

export default router;
