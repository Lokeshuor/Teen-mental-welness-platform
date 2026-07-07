import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Teen Mental Wellness Platform</h4>
                        <p>Supporting adolescent mental health through technology</p>
                    </div>
                    <div className="footer-section">
                        <h5>Quick Links</h5>
                        <ul>
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/privacy">Privacy Policy</a></li>
                            <li><a href="/terms">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5>Contact</h5>
                        <p>Email: support@teenwellness.com</p>
                        <p>Phone: 1-800-555-0199</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Teen Mental Wellness Platform. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;