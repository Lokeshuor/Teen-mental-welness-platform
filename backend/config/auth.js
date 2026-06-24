module.exports = {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    BCRYPT_ROUNDS: 10,
    ROLES: {
        STUDENT: 'student',
        THERAPIST: 'therapist',
        PARENT: 'parent',
        ADMIN: 'admin'
    },
    RISK_BANDS: {
        HIGH: 'high',
        MODERATE: 'moderate',
        LOW: 'low'
    }
};