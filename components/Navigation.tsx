import React from 'react';
import { Home, PlusCircle, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <Link 
        to="/" 
        className={`flex flex-col items-center space-y-1 ${isActive('/') ? 'text-emerald-600' : 'text-slate-400'}`}
      >
        <Home size={24} />
        <span className="text-xs font-medium">หน้าหลัก</span>
      </Link>
      
      <Link 
        to="/submit" 
        className={`flex flex-col items-center space-y-1 ${isActive('/submit') ? 'text-emerald-600' : 'text-slate-400'}`}
      >
        <PlusCircle size={24} />
        <span className="text-xs font-medium">เสนอทรัพย์</span>
      </Link>

      <Link 
        to="/contact" 
        className={`flex flex-col items-center space-y-1 ${isActive('/contact') ? 'text-emerald-600' : 'text-slate-400'}`}
      >
        <Phone size={24} />
        <span className="text-xs font-medium">ติดต่อเรา</span>
      </Link>
    </div>
  );
};

export default Navigation;