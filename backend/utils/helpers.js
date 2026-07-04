const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS } = require('../config/auth');

// Hash password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Generate random token
const generateToken = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};

// Validate email
const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Format date
const formatDate = (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes);
};

// Calculate age from date of birth
const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// Truncate text
const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Generate random color
const getRandomColor = () => {
    const colors = [
        '#3b9bb9', '#8b5cf6', '#ec4899', '#f59e0b', 
        '#10b981', '#ef4444', '#6366f1', '#14b8a6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Calculate risk band
const calculateRiskBand = (score) => {
    if (score >= 20) return 'high';
    if (score >= 12) return 'moderate';
    return 'low';
};

// Get risk color
const getRiskColor = (riskLevel) => {
    const colors = {
        low: '#10b981',
        moderate: '#f59e0b',
        high: '#ef4444'
    };
    return colors[riskLevel] || '#6b7280';
};

// Group array by key
const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
};

// Sleep/delay function
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    isValidEmail,
    formatDate,
    calculateAge,
    truncateText,
    getRandomColor,
    calculateRiskBand,
    getRiskColor,
    groupBy,
    sleep
};