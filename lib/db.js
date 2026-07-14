import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// Helper for simulator local storage keys
const STORAGE_KEYS = {
  STUDENTS: 'kd_students',
  ATTENDANCE: 'kd_attendance',
  ACTIVITIES: 'kd_activities',
};

// Seed initial data for simulator mode
const seedInitialData = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    const defaultStudents = [
      { id: 'std-1', name: 'Sophia Miller', birthDate: '2021-04-12', parentName: 'Sarah Miller', parentPhone: '555-0199', parentEmail: 'sarah.miller@example.com', address: '123 Oak St, Springfield', emergencyContact: 'John Miller (Father) - 555-0198', classGroup: 'Toddlers' },
      { id: 'std-2', name: 'Liam Johnson', birthDate: '2020-08-22', parentName: 'David Johnson', parentPhone: '555-0122', parentEmail: 'd.johnson@example.com', address: '456 Maple Ave, Springfield', emergencyContact: 'Emma Johnson (Mother) - 555-0123', classGroup: 'Pre-K' },
      { id: 'std-3', name: 'Olivia Smith', birthDate: '2021-01-05', parentName: 'Jessica Smith', parentPhone: '555-0155', parentEmail: 'jess.smith@example.com', address: '789 Pine Rd, Springfield', emergencyContact: 'Robert Smith (Uncle) - 555-0156', classGroup: 'Toddlers' },
      { id: 'std-4', name: 'Noah Davis', birthDate: '2020-11-30', parentName: 'Michael Davis', parentPhone: '555-0177', parentEmail: 'm.davis@example.com', address: '321 Birch Ln, Springfield', emergencyContact: 'Linda Davis (Grandmother) - 555-0178', classGroup: 'Pre-K' },
      { id: 'std-5', name: 'Emma Wilson', birthDate: '2020-05-14', parentName: 'Karen Wilson', parentPhone: '555-0144', parentEmail: 'karen.w@example.com', address: '654 Elm St, Springfield', emergencyContact: 'James Wilson (Father) - 555-0143', classGroup: 'Pre-K' },
    ];
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(defaultStudents));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    const today = new Date().toISOString().split('T')[0];
    const defaultAttendance = [
      { studentId: 'std-1', date: today, status: 'present', timestamp: new Date().toISOString() },
      { studentId: 'std-2', date: today, status: 'present', timestamp: new Date().toISOString() },
      { studentId: 'std-3', date: today, status: 'absent', timestamp: new Date().toISOString() },
      { studentId: 'std-4', date: today, status: 'present', timestamp: new Date().toISOString() },
      { studentId: 'std-5', date: today, status: 'absent', timestamp: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(defaultAttendance));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    const today = new Date().toISOString().split('T')[0];
    const defaultActivities = [
      { id: 'act-1', date: today, classGroup: 'Toddlers', text: 'Today the Toddlers painted paper plates to look like sunflowers and practiced their animal sounds during circle time.', timestamp: new Date().toISOString() },
      { id: 'act-2', date: today, classGroup: 'Pre-K', text: 'Pre-K started learning the letter "S", read the story of Silly Squirrel, and practiced tracing shapes in sand trays.', timestamp: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(defaultActivities));
  }
};

// Initialize seed data
seedInitialData();

// Generic simulated DB actions
const simGet = (key) => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(key) || '[]');
};

const simSave = (key, data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// ==========================================
// DB SERVICE INTERFACE
// ==========================================

export const dbService = {
  // --- STUDENTS ---
  async getStudents() {
    if (isFirebaseConfigured) {
      const snap = await getDocs(collection(db, 'students'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      return simGet(STORAGE_KEYS.STUDENTS);
    }
  },

  async addStudent(studentData) {
    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, 'students'), studentData);
      return { id: docRef.id, ...studentData };
    } else {
      const students = simGet(STORAGE_KEYS.STUDENTS);
      const newStudent = { id: `std-${Date.now()}`, ...studentData };
      students.push(newStudent);
      simSave(STORAGE_KEYS.STUDENTS, students);
      return newStudent;
    }
  },

  async updateStudent(id, studentData) {
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'students', id);
      await updateDoc(docRef, studentData);
      return { id, ...studentData };
    } else {
      const students = simGet(STORAGE_KEYS.STUDENTS);
      const index = students.findIndex(s => s.id === id);
      if (index !== -1) {
        students[index] = { ...students[index], ...studentData };
        simSave(STORAGE_KEYS.STUDENTS, students);
        return students[index];
      }
      throw new Error("Student not found");
    }
  },

  async deleteStudent(id) {
    if (isFirebaseConfigured) {
      await deleteDoc(doc(db, 'students', id));
      return id;
    } else {
      let students = simGet(STORAGE_KEYS.STUDENTS);
      students = students.filter(s => s.id !== id);
      simSave(STORAGE_KEYS.STUDENTS, students);
      return id;
    }
  },

  // --- ATTENDANCE ---
  async getAttendanceForDate(dateStr) {
    if (isFirebaseConfigured) {
      const q = query(collection(db, 'attendance'), where('date', '==', dateStr));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const all = simGet(STORAGE_KEYS.ATTENDANCE);
      return all.filter(a => a.date === dateStr);
    }
  },

  async saveAttendanceBatch(dateStr, records) {
    // records is an array of { studentId, status }
    const timestamp = new Date().toISOString();
    if (isFirebaseConfigured) {
      for (const record of records) {
        const id = `${dateStr}_${record.studentId}`;
        const docRef = doc(db, 'attendance', id);
        await setDoc(docRef, {
          studentId: record.studentId,
          date: dateStr,
          status: record.status,
          timestamp,
        }, { merge: true });
      }
      return true;
    } else {
      const all = simGet(STORAGE_KEYS.ATTENDANCE);
      // Remove existing for this date
      const filtered = all.filter(a => a.date !== dateStr);
      // Add new
      records.forEach(r => {
        filtered.push({
          studentId: r.studentId,
          date: dateStr,
          status: r.status,
          timestamp,
        });
      });
      simSave(STORAGE_KEYS.ATTENDANCE, filtered);
      return true;
    }
  },

  async getAttendanceHistoryForStudent(studentId) {
    if (isFirebaseConfigured) {
      const q = query(
        collection(db, 'attendance'), 
        where('studentId', '==', studentId),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const all = simGet(STORAGE_KEYS.ATTENDANCE);
      return all
        .filter(a => a.studentId === studentId)
        .sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  async getAllAttendanceHistory() {
    if (isFirebaseConfigured) {
      const snap = await getDocs(collection(db, 'attendance'));
      return snap.docs.map(doc => doc.data());
    } else {
      return simGet(STORAGE_KEYS.ATTENDANCE);
    }
  },

  // --- ACTIVITIES ---
  async getActivitiesForDate(dateStr) {
    if (isFirebaseConfigured) {
      const q = query(collection(db, 'activities'), where('date', '==', dateStr));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const all = simGet(STORAGE_KEYS.ACTIVITIES);
      return all.filter(a => a.date === dateStr);
    }
  },

  async getAllActivities() {
    if (isFirebaseConfigured) {
      const snap = await getDocs(collection(db, 'activities'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.date.localeCompare(a.date));
    } else {
      const all = simGet(STORAGE_KEYS.ACTIVITIES);
      return [...all].sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  async addActivity(dateStr, classGroup, text) {
    const activityData = {
      date: dateStr,
      classGroup,
      text,
      timestamp: new Date().toISOString()
    };
    if (isFirebaseConfigured) {
      const docRef = await addDoc(collection(db, 'activities'), activityData);
      return { id: docRef.id, ...activityData };
    } else {
      const activities = simGet(STORAGE_KEYS.ACTIVITIES);
      const newActivity = { id: `act-${Date.now()}`, ...activityData };
      activities.push(newActivity);
      simSave(STORAGE_KEYS.ACTIVITIES, activities);
      return newActivity;
    }
  }
};
