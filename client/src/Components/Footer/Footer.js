import React from 'react';

import discordLogo from './images/discord.svg';
import githubLogo from './images/github.svg';
import logo from './images/bio-lnk.png'


import './Footer.css';
function Footer() {
    return (
        <footer className="footer">
            <div className="footer-row">
                <div className="footer-item">
                    <img src={logo} alt="Bio.lnk Icon" className="footer-logo" />
                </div>
            </div>
            <div className="footer-row">
                <div className="footer-item">
                    <p className="footer-company-description">
                    This project was made in OPEN Summer Of Code'23💚
                    </p>
                </div>
            </div>
            <div className="footer-row">
                <div className="footer-item">
                    <a href="https://discord.gg/FyFgtY27Wf" target="_blank" rel="noopener noreferrer">
                        <img src={discordLogo} alt="Discord Logo" className="footer-icon" />
                    </a>
                    <a href="https://github.com/upes-open/OSoC-bio.lnk" target="_blank" rel="noopener noreferrer">
                        <img src={githubLogo} alt="GitHub Logo" className="footer-icon" />
                    </a>
                </div>
            </div>
            <div className="footer-row">
                <div className="footer-item">
                    <p className="footer-copyright">
                        &copy; {new Date().getFullYear()} Bio-lnk. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
