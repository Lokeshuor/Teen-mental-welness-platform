// Route constants for easier management
export const ROUTES = {
    // Public
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    
    // Student
    STUDENT_DASHBOARD: '/student/dashboard',
    STUDENT_ASSESSMENT: '/student/assessment',
    STUDENT_ASSESSMENT_RESULTS: '/student/assessment/results',
    STUDENT_THERAPISTS: '/student/therapists',
    STUDENT_BOOK_SESSION: '/student/book-session',
    STUDENT_SESSIONS: '/student/sessions',
    STUDENT_MESSAGES: '/student/messages',
    STUDENT_PROFILE: '/student/profile',
    
    // Therapist
    THERAPIST_DASHBOARD: '/therapist/dashboard',
    THERAPIST_SESSIONS: '/therapist/sessions',
    THERAPIST_STUDENTS: '/therapist/students',
    THERAPIST_MESSAGES: '/therapist/messages',
    THERAPIST_AVAILABILITY: '/therapist/availability',
    THERAPIST_REPORTS: '/therapist/reports',
    
    // Parent
    PARENT_DASHBOARD: '/parent/dashboard',
    PARENT_NOTIFICATIONS: '/parent/notifications',
    
    // Admin
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_REPORTS: '/admin/reports',
    ADMIN_SETTINGS: '/admin/settings',
};

// Role-based route access
export const ROLE_ROUTES = {
    student: [
        ROUTES.STUDENT_DASHBOARD,
        ROUTES.STUDENT_ASSESSMENT,
        ROUTES.STUDENT_ASSESSMENT_RESULTS,
        ROUTES.STUDENT_THERAPISTS,
        ROUTES.STUDENT_BOOK_SESSION,
        ROUTES.STUDENT_SESSIONS,
        ROUTES.STUDENT_MESSAGES,
        ROUTES.STUDENT_PROFILE,
    ],
    therapist: [
        ROUTES.THERAPIST_DASHBOARD,
        ROUTES.THERAPIST_SESSIONS,
        ROUTES.THERAPIST_STUDENTS,
        ROUTES.THERAPIST_MESSAGES,
        ROUTES.THERAPIST_AVAILABILITY,
        ROUTES.THERAPIST_REPORTS,
    ],
    parent: [
        ROUTES.PARENT_DASHBOARD,
        ROUTES.PARENT_NOTIFICATIONS,
    ],
    admin: [
        ROUTES.ADMIN_DASHBOARD,
        ROUTES.ADMIN_USERS,
        ROUTES.ADMIN_REPORTS,
        ROUTES.ADMIN_SETTINGS,
    ],
};

export const getDashboardRoute = (role) => {
    switch (role) {
        case 'student': return ROUTES.STUDENT_DASHBOARD;
        case 'therapist': return ROUTES.THERAPIST_DASHBOARD;
        case 'parent': return ROUTES.PARENT_DASHBOARD;
        case 'admin': return ROUTES.ADMIN_DASHBOARD;
        default: return ROUTES.LOGIN;
    }
};