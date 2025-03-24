// Student interface
export interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  notificationEmail: string;
  createdAt: Date;
}

// Purchase interface
export interface Purchase {
  id: string;
  studentId: string;
  classesPurchased: number;
  purchaseDate: Date;
  notes?: string;
}

// Attendance interface
export interface Attendance {
  id: string;
  studentId: string;
  attendanceDate: Date;
  timeIn: Date | null;
  timeOut: Date | null;
  className?: string | null;
  location?: string | null;
  coach?: string | null;
  notes?: string | null;
}

// Extended attendance interface with student details for display
export interface AttendanceWithStudentDetails extends Omit<Attendance, 'studentId'> {
  studentId: string;
  studentName: string;
  studentEmail?: string;
}

// User roles for authentication
export enum UserRole {
  Admin = 'admin',
  Student = 'student'
}

// User interface with role
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
}

// Calculate remaining classes
export interface StudentWithClasses extends Student {
  remainingClasses: number;
  totalPurchased: number;
  totalAttended: number;
} 