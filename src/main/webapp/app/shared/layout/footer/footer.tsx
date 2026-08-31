import React from 'react';

const Footer = () => (
  <footer className="booking-footer">
    <div className="footer-inner">
      <div className="footer-cols" style={{ display: 'flex', justifyContent: 'space-around', padding: '2rem 0' }}>
        <div className="footer-col">
          <h4>Grand Hotel Sri Lanka</h4>
          <ul>
            <li>
              <a href="#about">About Us</a>
            </li>
            <li>
              <a href="#contact">Contact & Location</a>
            </li>
            <li>
              <a href="#dining">Dining Experiences</a>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Support & Policies</h4>
          <ul>
            <li>
              <a href="#faq">Frequently Asked Questions</a>
            </li>
            <li>
              <a href="#terms">Terms & Conditions</a>
            </li>
            <li>
              <a href="#privacy">Privacy Policy</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="mb-1">Copyright © 2026 Grand Hotel Sri Lanka™. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
