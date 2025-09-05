"use client";

import React from 'react';
import { TranslatableText } from '@/components/TranslatableText';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10 md:py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Company Info */}
        <div className="col-span-full md:col-span-1">
          <h3 className="text-2xl font-bold text-white mb-4">PropertyShodh</h3>
          <p className="text-sm leading-relaxed">
            <TranslatableText text="Your trusted partner in finding the perfect property. We offer a wide range of residential and commercial listings." />
          </p>
          <div className="flex space-x-4 mt-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            <TranslatableText text="Quick Links" />
          </h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:text-white transition-colors"><TranslatableText text="Home" /></Link></li>
            <li><Link to="/properties" className="hover:text-white transition-colors"><TranslatableText text="Properties" /></Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors"><TranslatableText text="About Us" /></Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors"><TranslatableText text="Contact" /></Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            <TranslatableText text="Legal" />
          </h4>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="hover:text-white transition-colors"><TranslatableText text="Privacy Policy" /></Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors"><TranslatableText text="Terms of Service" /></Link></li>
            <li><Link to="/sitemap" className="hover:text-white transition-colors"><TranslatableText text="Sitemap" /></Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">
            <TranslatableText text="Connect With Us" />
          </h4>
          <p className="text-sm">Email: info@propertyshodh.com</p>
          <p className="text-sm">Phone: +91 12345 67890</p>
          <p className="text-sm mt-2">Address: 123 Property Lane, Aurangabad, India</p>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} PropertyShodh. <TranslatableText text="All Rights Reserved." />
      </div>
    </footer>
  );
};

export { Footer };