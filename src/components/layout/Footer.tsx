import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {currentYear} EduTest Pro | Developed by Aftab Alam
        </p>
      </div>
    </footer>
  );
}