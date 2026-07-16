import * as yup from 'yup';

export const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required')
});

export const registerSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    role: yup.string().oneOf(['student', 'therapist', 'parent']).required('Role is required'),
    schoolId: yup.string().when('role', {
        is: 'student',
        then: () => yup.string().required('School ID is required for students')
    }),
    gradeLevel: yup.string().when('role', {
        is: 'student',
        then: () => yup.string().required('Grade level is required for students')
    }),
    childEmail: yup.string().when('role', {
        is: 'parent',
        then: () => yup.string().email('Invalid email')
    })
});

export const assessmentSchema = yup.object().shape({
    responses: yup.array().of(
        yup.number().min(0).max(3)
    ).required('Please answer all questions')
});

export const sessionBookingSchema = yup.object().shape({
    therapistId: yup.number().required('Please select a therapist'),
    sessionDate: yup.string().required('Please select a date'),
    startTime: yup.string().required('Please select a time'),
    endTime: yup.string().required('Please select an end time')
});

export const messageSchema = yup.object().shape({
    content: yup.string()
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message is too long')
        .required('Message is required')
});