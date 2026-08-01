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

// Date and time are managed outside react-hook-form (component state) and
// validated in the submit handler, so the schema only covers registered fields.
export const sessionBookingSchema = yup.object().shape({
    therapistId: yup.number()
        .typeError('Please select a therapist')
        .required('Please select a therapist'),
    sessionType: yup.string()
        .oneOf(['online', 'in-person'])
        .required('Please select a session type')
});

export const messageSchema = yup.object().shape({
    content: yup.string()
        .min(1, 'Message cannot be empty')
        .max(2000, 'Message is too long')
        .required('Message is required')
});