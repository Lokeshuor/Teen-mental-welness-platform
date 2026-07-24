CREATE TABLE IF NOT EXISTS session_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    therapist_id INT NOT NULL,
    rating TINYINT NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_rating (session_id),
    INDEX idx_rating_therapist (therapist_id),
    CONSTRAINT chk_session_rating CHECK (rating BETWEEN 1 AND 5)
);
