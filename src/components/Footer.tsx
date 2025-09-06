"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from 'lucide-react';
import { TranslatableText } from './TranslatableText';

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center">
              <img src="/logo.svg" alt="PropertyShodh Logo" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground">
              <TranslatableText textKey="footer_tagline" defaultText="Your trusted partner in finding the perfect property." />
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4"><TranslatableText textKey="footer_quick_links" defaultText="Quick Links" /></h3>
            <ul className="space-y-2">
              <li><Link to="/properties" className="text-muted-foreground hover:text-primary transition-colors"><TranslatableText textKey="footer_properties" defaultText="Properties" /></Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors"><TranslatableText textKey="footer_about_us" defaultText="About Us" /></Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors"><TranslatableText textKey="footer_contact_us" defaultText="Contact Us" /></Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors"><TranslatableText textKey="footer_faq" defaultText="FAQ" /></Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors"><TranslatableText textKey="footer_terms" defaultText="Terms & Conditions" /></Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4"><TranslatableText textKey="footer_services" defaultText="Services" /></h3>
            <ul className="space-y-2">
              <li><Link to="/sell-property" className="text-muted-foreground hover:text-primary transition-colors"><TranslatableText textKey="footer_sell_property" defaultText="Sell Your Property" /></Link></li>
              <li><Link to="/rent-property" className="text-muted-foreground hover:text-primary transition-colors"><TranslatableText textKey="footer_rent_property" defaultText="Rent Your Property" /></Link></li>
              <li><Link to="/property-valuation" className="text-muted-foreground hover:text-primary transition-colors"><TranslatableText textKey="footer_property_valuation" defaultText="Property Valuation" /></Link></li>
              <li><Link to="/legal-advice" className="text-muted-foreground hover:text-primary transition-colors"><TranslatableText textKey="footer_legal_advice" defaultText="Legal Advice" /></Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4"><TranslatableText textKey="footer_contact_info" defaultText="Contact Info" /></h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Mail size={16} />
                <span>info@propertyshodh.com</span>
              </li>
              <li className="flex items-center space-x-2 text-muted-foreground">
                <Phone size={16} />
                <span>+91 98765 43210</span>
              </li>
              <li className="text-muted-foreground">
                <TranslatableText textKey="footer_address_line1" defaultText="123 Property Lane," /><br />
                <TranslatableText textKey="footer_address_line2" defaultText="Real Estate City, PIN 400001" />
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-muted-foreground/20 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} <TranslatableText textKey="footer_copyright" defaultText="PropertyShodh. All rights reserved." /></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;