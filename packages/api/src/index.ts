import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.controller';
import userRoutes from './users/users.controller';
import deptRoutes from './departments/departments.controller';
import courseRoutes from './courses/courses.controller';
import classRoutes from './classes/classes.controller';
import attendanceRoutes from './attendance/attendance.controller';
import assignmentRoutes from './assignments/assignments.controller';
import reportRoutes from './users/reporting.controller';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/departments', deptRoutes);
app.use('/courses', courseRoutes);
app.use('/classes', classRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'KU APP Backend is running' });
});

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
