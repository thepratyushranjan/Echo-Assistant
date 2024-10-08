import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="header-logo">
                <Link to="/">EchoAssistant</Link>
            </div>
            <nav className="header-nav">
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/login">Login</Link>
            </nav>
        </header>
    );
};

export default Header;
