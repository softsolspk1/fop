import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRouter from './auth/auth.controller';
import usersRouter from './users/users.controller';
import departmentsRouter from './departments/departments.controller';
import coursesRouter from './courses/courses.controller';
import classesRouter from './classes/classes.controller';
import attendanceRouter from './attendance/attendance.controller';
import assignmentsRouter from './assignments/assignments.controller';
import reportRoutes from './users/reporting.controller';
import semestersRouter from './semesters/semesters.controller';
import quizzesRouter from './quizzes/quizzes.controller';
import aiRouter from './ai/ai.controller';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/departments', departmentsRouter);
app.use('/courses', coursesRouter);
app.use('/classes', classesRouter);
app.use('/attendance', attendanceRouter);
app.use('/assignments', assignmentsRouter);
app.use('/reports', reportRoutes);
app.use('/semesters', semestersRouter);
app.use('/quizzes', quizzesRouter);
app.use('/ai', aiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'KU APP Backend is running' });
});

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
