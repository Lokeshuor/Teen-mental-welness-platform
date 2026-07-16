-- Create database
CREATE DATABASE IF NOT EXISTS teen_mental_wellness;
USE teen_mental_wellness;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('student', 'therapist', 'parent', 'admin') NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer-not-to-say'),
    school_id VARCHAR(100),
    grade_level VARCHAR(50),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_school_id (school_id)
);

-- Therapist profiles
CREATE TABLE IF NOT EXISTS therapist_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    specialization VARCHAR(255),
    qualifications TEXT,
    experience_years INT DEFAULT 0,
    license_number VARCHAR(100),
    bio TEXT,
    consultation_fee DECIMAL(10, 2),
    rating DECIMAL(3, 2) DEFAULT 0,
    total_sessions INT DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Therapist availability
CREATE TABLE IF NOT EXISTS therapist_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    therapist_id INT NOT NULL,
    day_of_week TINYINT NOT NULL COMMENT '0=Sunday, 1=Monday, etc.',
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE,
    specific_date DATE,
    is_booked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_availability (therapist_id, day_of_week, start_time, specific_date),
    INDEX idx_therapist (therapist_id),
    INDEX idx_date (specific_date)
);

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    assessment_type VARCHAR(100) DEFAULT 'mental_health',
    responses JSON NOT NULL,
    total_score INT,
    risk_level ENUM('low', 'moderate', 'high') NOT NULL,
    recommendation VARCHAR(500),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_reviewed BOOLEAN DEFAULT FALSE,
    reviewed_by INT,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_student (student_id),
    INDEX idx_risk_level (risk_level),
    INDEX idx_completed (completed_at)
);

-- Sessions (appointments)
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    therapist_id INT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
    session_type ENUM('online', 'in-person') DEFAULT 'online',
    meeting_link VARCHAR(500),
    notes TEXT,
    cancellation_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session (therapist_id, session_date, start_time),
    INDEX idx_student (student_id),
    INDEX idx_therapist (therapist_id),
    INDEX idx_date (session_date),
    INDEX idx_status (status)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    parent_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_created (created_at)
);

-- Parent-student links (a parent can have several children; a child can have two parent accounts)
CREATE TABLE IF NOT EXISTS parent_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_link (parent_id, student_id),
    INDEX idx_parent (parent_id),
    INDEX idx_student (student_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('assessment', 'session', 'message', 'system', 'alert') NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    generated_by INT NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    data JSON NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id),
    INDEX idx_type (report_type),
    INDEX idx_created (created_at)
);

-- Insert sample admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
    'admin@teenwellness.com',
    '$2a$10$YourHashedPasswordHere', -- Use bcrypt to generate this
    'Admin',
    'User',
    'admin',
    TRUE
);