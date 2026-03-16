export interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'DEPT_ADMIN' | 'TEACHER' | 'STUDENT';
  departmentId?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  teacherId: string;
}
