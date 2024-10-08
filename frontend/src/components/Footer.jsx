import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <p>&copy; 2024 EchoAssistant. All rights reserved.</p>
            <p>Designed and developed by Pratyush Ranjan</p>
            <div className="footer-links">
                <a href="/privacy-policy">Privacy Policy</a>
                <a href="/terms-of-service">Terms of Service</a>
            </div>
        </footer>
    );
};

export default Footer;
