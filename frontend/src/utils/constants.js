export const ROLES = {
    STUDENT: 'student',
    THERAPIST: 'therapist',
    PARENT: 'parent',
    ADMIN: 'admin'
};

export const RISK_LEVELS = {
    LOW: 'low',
    MODERATE: 'moderate',
    HIGH: 'high'
};

export const SESSION_STATUS = {
    SCHEDULED: 'scheduled',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no-show'
};

export const SESSION_TYPES = {
    ONLINE: 'online',
    IN_PERSON: 'in-person'
};

export const ASSESSMENT_QUESTIONS = [
    { id: 1, text: 'Over the past two weeks, how often have you felt down, depressed, or hopeless?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { id: 2, text: 'Over the past two weeks, how often have you had little interest or pleasure in doing things?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { id: 3, text: 'How often do you feel nervous, anxious, or on edge?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { id: 4, text: 'How often do you have trouble sleeping or sleeping too much?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { id: 5, text: 'How often do you feel tired or have little energy?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { id: 6, text: 'How often do you have poor appetite or overeating?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { id: 7, text: 'How often do you have trouble concentrating on things?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { id: 8, text: 'How often do you feel you have failed or let yourself or your family down?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { id: 9, text: 'How often do you think about hurting yourself or that you would be better off dead?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { id: 10, text: 'How often do you feel lonely or isolated from others?', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
];

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
];

export const GRADE_LEVELS = ['9', '10', '11', '12'];

export const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];