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

export type WelcomeMessage = BaseMessage<{ message: string }>;
export type UserLoginMessage = BaseMessage<{ user: User }>;