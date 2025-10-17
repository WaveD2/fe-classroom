export enum ROLE {
    TEACHER = 'teacher',
    STUDENT = 'student',
    ADMIN = 'admin'
}

export enum STATUS_USER {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
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
    password?: string;
    // subject?: string;
    // experience?: number;
    createdAt: Date;
    token: string;
    role: ROLE.STUDENT | ROLE.TEACHER | ROLE.ADMIN;
    attendanceCount: number;
    attendanceRate: number;
    avatar?: string;
    status?: STATUS_USER.ACTIVE | STATUS_USER.INACTIVE;
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
    academicCredit: number;
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
  _id: string;
    id: string;
  public_id: string;
  url: string;
  format: string;
  size: number;
  type: FileType;
  created_at: string;
  name: string;
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

export interface GradeData {
  attendance?: number;
  homework?: number;
  midterm?: number;
  final?: number;
}

export interface GradeFilter {
  page?: number;
  limit?: number;
  studentId?: string;
}

export interface UpdateGradeComponentResponse {
  message: string;
  data: Grade;
}

export interface CalculateFinalGradeResponse {
  message: string;
  data: Grade;
}

export interface CalculateFinalGradeClassResponse {
  message: string;
  data: {
    totalUpdated: number;
    grades: Grade[];
  };
}

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

export interface DeleteGradeResponse {
  message: string;
}

export interface FileValidation {
  maxSize: number; // in bytes
  acceptedTypes: string[];
  errorMessages?: {
    type?: string;
    size?: string;
  };
}

// Document Types
export enum DOCUMENT_STATUS {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export enum DOCUMENT_TYPE {
  PDF = 'pdf',
  DOCX = 'docx',
  DOC = 'doc',
  XLSX = 'xlsx',
  XLS = 'xls',
  PPTX = 'pptx',
  PPT = 'ppt',
  ZIP = 'zip',
  RAR = 'rar',
  TXT = 'txt'
}

export interface Document extends DateTime {
  _id: string;
  id?: string;
  name: string;
  size: number;
  type: string;
  url: string;
  cloudinaryPublicId: string;
  classId: string | {
    _id: string;
    name: string;
    uniqueCode: string;
  };
  status: DOCUMENT_STATUS;
  description?: string;
  uploadBy: User | {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  isDeleted: boolean;
}

export interface DocumentUploadRequest {
  name: string;
  size: number;
  type: string;
  url: string;
  cloudinaryPublicId: string;
  classId: string;
  status: DOCUMENT_STATUS;
  description?: string;
}

export interface DocumentFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: DOCUMENT_STATUS;
}

export interface DocumentStatistics {
  total: number;
  publicCount: number;
  privateCount: number;
  totalSize: number;
  documentsByType: {
    _id: string;
    count: number;
    totalSize: number;
  }[];
}