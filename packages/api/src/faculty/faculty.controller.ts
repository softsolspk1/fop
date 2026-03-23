import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Get all faculty members (Users with TEACHER role)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const faculty = await prisma.user.findMany({
      where: {
        role: 'TEACHER'
      },
      include: {
        department: true
      }
    });

    // Map to match the frontend expectations if necessary, 
    // though the frontend seems to handle both.
    const mappedFaculty = faculty.map(f => ({
      id: f.id,
      name: f.name,
      email: f.email,
      designation: f.designation,
      qualification: f.qualification,
      department: f.department?.name || 'General',
      yearOfAssociation: f.yearOfAssociation
    }));

    res.json(mappedFaculty);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching faculty members', error });
  }
});

// Create faculty member (Super Admin or Dept Admin only)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, designation, email, qualification, departmentId } = req.body;
    const hashedPassword = await require('bcryptjs').hash('Softsols@123', 10);
    
    const facultyMember = await prisma.user.create({
      data: { 
        name, 
        designation, 
        email: email || `${name.toLowerCase().replace(/\s/g, '.')}@uok.edu.pk`,
        qualification,
        departmentId,
        password: hashedPassword,
        role: 'TEACHER',
        status: 'APPROVED'
      }
    });
    res.status(201).json(facultyMember);
  } catch (error) {
    res.status(500).json({ message: 'Error creating faculty member account', error });
  }
});

// Update faculty member
router.put('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, designation, qualification, departmentId, email } = req.body;
    const facultyMember = await prisma.user.update({
      where: { id: String(id) },
      data: { name, designation, qualification, departmentId, email }
    });
    res.json(facultyMember);
  } catch (error) {
    res.status(500).json({ message: 'Error updating faculty member', error });
  }
});

// Delete faculty member
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting faculty member', error });
  }
});

export default router;
