import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo">ProjectX</div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="nav-link">Register</Link>
        </div>
      </nav>
      
      <main className="hero-section">
        <h1>Welcome to ProjectX</h1>
        <p>Your platform for seamless collaboration</p>
        <div className="cta-buttons">
          <Link to="/register" className="cta-button primary">Get Started</Link>
          <Link to="/login" className="cta-button secondary">Sign In</Link>
        </div>
      </main>
    </div>
  );
};

export default Home; 