console.log('[Bootstrap]: Backend is starting at ' + new Date().toISOString());

process.on('uncaughtException', (err) => {
  console.error('[Critical]: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Critical]: Unhandled Rejection at:', promise, 'reason:', reason);
});

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
// Removed xss-clean due to deprecation and instability
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
import enrollmentRouter from './enrollment/enrollment.controller';
import reportsRouter from './reports/reports.controller';
import feesRouter from './fees/fees.controller';
import examsRouter from './exams/exams.controller';
import facultyRouter from './faculty/faculty.controller';
import labsRouter from './labs/labs.controller';
import resultsRouter from './results/results.controller';
import prisma from './lib/prisma';

const app = express();
const port = process.env.PORT || 4000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://fop-web.vercel.app',
      'https://fopwebsite.vercel.app'
    ];
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' })); // Limit body size
// app.use(xss());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/auth', limiter); // Apply rate limit specifically to auth routes

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
app.use('/enrollments', enrollmentRouter);
app.use('/academic-reports', reportsRouter);
app.use('/fees', feesRouter);
app.use('/exams', examsRouter);
app.use('/faculty', facultyRouter);
app.use('/labs', labsRouter);
app.use('/results', resultsRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'KU APP Backend is alive' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      message: 'KU APP Backend is running and database is connected',
      env: process.env.NODE_ENV,
      vercel: process.env.VERCEL
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'KU APP Backend is running but database is not connected',
      error: error.message
    });
  }
});

// Conditional server start: Only listen if NOT on Vercel
const isVercel = process.env.VERCEL === '1';

if (!isVercel && process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      app.listen(port, () => {
        console.log(`[Server]: KU APP Backend running on port ${port}`);
        console.log(`[Env]: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      console.error('[Critical]: Server failed to start:', error);
    }
  };
  startServer();
}

export default app;
