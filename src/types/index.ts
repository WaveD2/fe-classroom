export enum ROLE {
    TEACHER = 'teacher',
    STUDENT = 'student',
    ADMIN = 'admin'
}

export enum STATUS_CLASS {
    OPEN = 'open',
    CLOSED = 'close'
}

export interface DateTime{
    updatedAt?: Date;
    createdAt?: Date;
}
export enum GRADE_TYPE {
  ATTENDANCE = 'attendance',
  MIDTERM = 'midterm',
  FINAL = 'final',
  HOMEWORK = 'homework'
} 
export interface User {
    _id: string;
    id: string;
    name: string;
    email: string;
    phone?: string;
    studentId?: string;
    teacherId?: string;
    dateOfBirth?: string;
    subject?: string;
    experience?: number;
    createdAt: Date;
    token: string;
    role: ROLE.STUDENT | ROLE.TEACHER | ROLE.ADMIN;
    attendanceCount: number;
    attendanceRate: number;
    attendanceTimes: string[];
}

export interface SensorData {
    _id: string;
    userId: string;
    heartRate: number;
    temperature: number;
    timestamp: Date;
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    _id: string;
    userId: string;
    type: 'HIGH_HEART_RATE' | 'LOW_HEART_RATE' | 'HIGH_TEMPERATURE' | 'LOW_TEMPERATURE';
    message: string;
    read: boolean;
    createdAt: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (userData: Partial<User>) => Promise<void>;
}

export interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
}

export interface TrendData {
    trend: 'increasing' | 'decreasing' | 'stable';
    data: number[];
}

export interface HealthReport {
    period: {
        start: string;
        end: string;
        days: number;
    };
    averages: {
        averageHeartRate: number;
        averageTemperature: number;
    };
    trends: {
        heartRate: TrendData;
        temperature: TrendData;
    };
    alerts: {
        highHeartRate: number;
        lowHeartRate: number;
        highTemperature: number;
        lowTemperature: number;
        total: number;
    };
    dataPoints: number;
}

export interface WebSocketMessage {
    type: string;
    payload: any;
}

export interface BaseMessage<T = unknown> {
    event: string;
    payload: T;
}

export interface HeartRate {
    timestamp: number;  // UNIX timestamp
    value: number;      // BPM
}

export interface Temperature {
    timestamp: number;
    value: number;      // °C
}


export interface ClassI extends DateTime {
    id: string;
    _id: string;
    name: string;
    description: string;
    teacher: User;
    status: STATUS_CLASS;
    uniqueCode: string;
    studentCount: number;
    students?: User[];
}

export interface HistoryAttendance extends DateTime {
    userId: string;  
    classId: string;
    role: ROLE.STUDENT | ROLE.TEACHER;
    user: User;
    _id: string;
    id:string
}

export interface StudentWithAttendance extends User {
    attendanceCount: number;
    attendanceRate: number;
    attendanceTimes: string[];
}

export interface ManualAttendanceData {
    studentId: string;
    timeAttendance: string;
    type: 'active' | 'inactive';
}

export interface ManualAttendanceRequest {
    attendanceData: ManualAttendanceData[];
}

export interface QrI extends DateTime {
    classId: string;
    userId?: string;
    _id?: string;
    id?: string;
    content: string;
    expiresAt: Date | string;
    status?: string;
    type: string;
    sessionId: string;
}

export interface QrHistoryI extends DateTime {
    classId: string;
    userId?: string;
    _id?: string;
    id?: string;
    content: string;
    expiresAt: Date | string;
    status?: 'active' | 'inactive' | 'expired';
    type: string;
    sessionId: string;
    qrImage: string;
    createdByUserId: string;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

export interface ClassFilter {
    page?: number;
    limit?: number;
    search?: string;
    status?: STATUS_CLASS;
}

export type FileType = 'image' | 'document';

export interface UploadedFile {
  public_id: string;
  url: string;
  format: string;
  size: number;
  type: FileType;
  created_at: string;
}

export interface UploadResponse {
  success: boolean;
  data?: UploadedFile;
  error?: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  data?: UploadedFile[];
  errors?: string[];
}


export type WelcomeMessage = BaseMessage<{ message: string }>;
export type UserLoginMessage = BaseMessage<{ user: User }>;

// ===================================
// GRADE MANAGEMENT TYPES
// Cập nhật theo API documentation
// ===================================

// Grade entity - Điểm của học sinh
export interface Grade {
  _id: string;
  classId: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  attendance: number;    // Chuyên cần (0-10)
  homework: number;      // Bài tập (0-10)
  midterm: number;       // Giữa kỳ (0-10)
  final: number;         // Cuối kỳ (0-10)
  letterGrade?: string | null;  // Điểm chữ (A+, A, B+, B, C+, C, D+, D, F)
  gpaValue?: number | null;     // GPA (0.0 - 4.0)
  gradedBy?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  updatedAt: string;
  createdAt?: string;
}

// Grade data for partial updates
export interface GradeData {
  attendance?: number;
  homework?: number;
  midterm?: number;
  final?: number;
}

// Grade filter for queries
export interface GradeFilter {
  page?: number;
  limit?: number;
  studentId?: string;
}

// ===================================
// API RESPONSE TYPES
// ===================================

// Response for update/create grade component (API 1)
export interface UpdateGradeComponentResponse {
  message: string;
  data: Grade;
}

// Response for calculate final grade for 1 student (API 2)
export interface CalculateFinalGradeResponse {
  message: string;
  data: Grade;
}

// Response for calculate final grade for class (API 3)
export interface CalculateFinalGradeClassResponse {
  message: string;
  data: {
    totalUpdated: number;
    grades: Grade[];
  };
}

// Response for get student grade (API 4)
export interface StudentGradeResponse {
  message: string;
  data: {
    student: {
      _id: string;
      name: string;
      email: string;
    };
    grade: Grade | {
      classId: string;
      studentId: string;
      attendance: number;
      homework: number;
      midterm: number;
      final: number;
      letterGrade: null;
      gpaValue: null;
      gradedBy: null;
      updatedAt: null;
    };
  };
}

// Response for get class grades list (API 5)
export interface ClassGradesResponse {
  message: string;
  data: {
    grades: Grade[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Response for get class grade statistics (API 6)
export interface ClassGradeStatisticsResponse {
  message: string;
  data: {
    classInfo: {
      _id: string;
      name: string;
      description: string;
    };
    statistics: {
      totalStudents: number;
      totalGrades: number;
      studentsWithGrades: number;
      studentsWithoutGrades: number;
      studentsWithFinalGrade: number;
      averageGPA: string;
      gradeDistribution: {
        "A+": number;
        "A": number;
        "B+": number;
        "B": number;
        "C+": number;
        "C": number;
        "D+": number;
        "D": number;
        "F": number;
      };
    };
    students: User[];
    grades: Grade[];
  };
}

// Response for delete grade (API 7)
export interface DeleteGradeResponse {
  message: string;
}