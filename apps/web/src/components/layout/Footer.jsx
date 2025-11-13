import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  // Use import.meta.env for Vite environment variables instead of process.env
  const appVersion = import.meta.env?.VITE_APP_VERSION || '2.1.0';

  return (
    <footer className="footer-glass">
      <div className="text-sm text-gray-300">
        &copy; {currentYear} Shahin-AI. All rights reserved.
      </div>
      <div className="flex items-center gap-4 text-sm">
        <a href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
        <a href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a>
        <span className="text-gray-400">|</span>
        <span className="text-gray-400">Version: {appVersion}</span>
      </div>
    </footer>
  );
};

export default Footer;
