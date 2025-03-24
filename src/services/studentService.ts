import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Student, Purchase, Attendance, StudentWithClasses, AttendanceWithStudentDetails } from '../types';

// Collection references
const studentsCollection = collection(db, 'students');
const purchasesCollection = collection(db, 'purchases');
const attendancesCollection = collection(db, 'attendances');

// Student CRUD operations
export const addStudent = async (student: Omit<Student, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(studentsCollection, {
    ...student,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateStudent = async (id: string, data: Partial<Omit<Student, 'id' | 'createdAt'>>): Promise<void> => {
  await updateDoc(doc(studentsCollection, id), data);
};

export const deleteStudent = async (id: string): Promise<void> => {
  await deleteDoc(doc(studentsCollection, id));
};

export const getStudent = async (id: string): Promise<Student | null> => {
  const docRef = doc(studentsCollection, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      notificationEmail: data.notificationEmail,
      createdAt: (data.createdAt as Timestamp).toDate()
    };
  }
  
  return null;
};

export const getAllStudents = async (): Promise<Student[]> => {
  const q = query(studentsCollection, orderBy('name'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      notificationEmail: data.notificationEmail,
      createdAt: (data.createdAt as Timestamp).toDate()
    };
  });
};

// Purchase operations
export const addPurchase = async (purchase: Omit<Purchase, 'id'>): Promise<string> => {
  const docRef = await addDoc(purchasesCollection, {
    studentId: purchase.studentId,
    classesPurchased: purchase.classesPurchased,
    purchaseDate: purchase.purchaseDate,
    notes: purchase.notes || ''
  });
  return docRef.id;
};

export const getPurchasesByStudent = async (studentId: string): Promise<Purchase[]> => {
  const q = query(
    purchasesCollection, 
    where('studentId', '==', studentId),
    orderBy('purchaseDate', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      studentId: data.studentId,
      classesPurchased: data.classesPurchased,
      purchaseDate: (data.purchaseDate as Timestamp).toDate(),
      notes: data.notes
    };
  });
};

// Attendance operations
export const recordAttendance = async (attendance: Omit<Attendance, 'id'>): Promise<string> => {
  const now = new Date();
  const docRef = await addDoc(attendancesCollection, {
    studentId: attendance.studentId,
    attendanceDate: attendance.attendanceDate,
    timeIn: attendance.timeIn || now,
    timeOut: attendance.timeOut || null,
    className: attendance.className || null,
    location: attendance.location || null,
    notes: attendance.notes || null,
    coach: attendance.coach || null
  });
  return docRef.id;
};

export const updateAttendance = async (attendanceId: string, updates: Partial<Omit<Attendance, 'id' | 'studentId'>>): Promise<void> => {
  // Get the reference to the attendance document
  const attendanceRef = doc(attendancesCollection, attendanceId);
  
  // Update only the fields that are provided in the updates object
  await updateDoc(attendanceRef, updates);
};

export const deleteAttendance = async (attendanceId: string): Promise<void> => {
  // Get the reference to the attendance document
  const attendanceRef = doc(attendancesCollection, attendanceId);
  
  // Delete the attendance record
  await deleteDoc(attendanceRef);
};

export const getAttendancesByStudent = async (studentId: string): Promise<Attendance[]> => {
  const q = query(
    attendancesCollection,
    where('studentId', '==', studentId),
    orderBy('attendanceDate', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      studentId: data.studentId,
      attendanceDate: (data.attendanceDate as Timestamp).toDate(),
      timeIn: data.timeIn ? (data.timeIn as Timestamp).toDate() : (data.attendanceDate as Timestamp).toDate(),
      timeOut: data.timeOut ? (data.timeOut as Timestamp).toDate() : null,
      className: data.className || undefined,
      location: data.location || undefined,
      notes: data.notes || undefined,
      coach: data.coach || undefined
    };
  });
};

// Get all attendances with student details
export const getAllAttendancesWithStudentDetails = async (): Promise<AttendanceWithStudentDetails[]> => {
  const attendances = await getDocs(query(attendancesCollection, orderBy('attendanceDate', 'desc')));
  const result: AttendanceWithStudentDetails[] = [];
  
  for (const doc of attendances.docs) {
    const data = doc.data();
    const studentId = data.studentId;
    const student = await getStudent(studentId);
    
    if (student) {
      result.push({
        id: doc.id,
        studentId: studentId,
        studentName: student.name,
        studentEmail: student.email,
        attendanceDate: (data.attendanceDate as Timestamp).toDate(),
        timeIn: data.timeIn ? (data.timeIn as Timestamp).toDate() : (data.attendanceDate as Timestamp).toDate(),
        timeOut: data.timeOut ? (data.timeOut as Timestamp).toDate() : null,
        className: data.className || undefined,
        location: data.location || undefined,
        notes: data.notes || undefined,
        coach: data.coach || undefined
      });
    }
  }
  
  return result;
};

// Get student with remaining classes calculation
export const getStudentWithClasses = async (studentId: string): Promise<StudentWithClasses | null> => {
  const student = await getStudent(studentId);
  
  if (!student) {
    return null;
  }
  
  const purchases = await getPurchasesByStudent(studentId);
  const attendances = await getAttendancesByStudent(studentId);
  
  const totalPurchased = purchases.reduce((sum, purchase) => sum + purchase.classesPurchased, 0);
  const totalAttended = attendances.length;
  const remainingClasses = totalPurchased - totalAttended;
  
  return {
    ...student,
    remainingClasses,
    totalPurchased,
    totalAttended
  };
};

// Get all students with remaining classes calculation
export const getAllStudentsWithClasses = async (): Promise<StudentWithClasses[]> => {
  const students = await getAllStudents();
  const studentsWithClasses: StudentWithClasses[] = [];
  
  for (const student of students) {
    const purchases = await getPurchasesByStudent(student.id);
    const attendances = await getAttendancesByStudent(student.id);
    
    const totalPurchased = purchases.reduce((sum, purchase) => sum + purchase.classesPurchased, 0);
    const totalAttended = attendances.length;
    const remainingClasses = totalPurchased - totalAttended;
    
    studentsWithClasses.push({
      ...student,
      remainingClasses,
      totalPurchased,
      totalAttended
    });
  }
  
  return studentsWithClasses;
}; 