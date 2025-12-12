import React from 'react';
import { Home, PlusCircle, Phone, Menu, Building2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* --- DESKTOP NAVIGATION (Top Bar) --- */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white border-b border-slate-200 px-8 py-3 z-50 items-center justify-between shadow-sm h-16">
        <Link to="/" className="flex items-center space-x-2 text-emerald-600 hover:opacity-80 transition-opacity">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Building2 size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">Phayao Asset Hub</span>
        </Link>

        <div className="flex items-center space-x-8">
          <Link 
            to="/" 
            className={`text-sm font-bold transition-colors ${isActive('/') ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            หน้าหลัก
          </Link>
          <Link 
            to="/list" 
            className={`text-sm font-bold transition-colors ${isActive('/list') ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            รายการทรัพย์
          </Link>
          <Link 
            to="/mortgage" 
            className={`text-sm font-bold transition-colors ${isActive('/mortgage') ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            ขายฝาก/จำนอง
          </Link>
          <Link 
            to="/contact" 
            className={`text-sm font-bold transition-colors ${isActive('/contact') ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            ติดต่อเรา
          </Link>
          
          <Link 
            to="/submit" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all shadow-sm active:scale-95"
          >
            <PlusCircle size={18} className="mr-2" />
            ฝากขายทรัพย์กับเรา
          </Link>
        </div>
      </nav>

      {/* --- MOBILE NAVIGATION (Bottom Bar) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-pb">
        <Link 
          to="/" 
          className={`flex flex-col items-center space-y-1 ${isActive('/') ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-medium">หน้าหลัก</span>
        </Link>
        
        <Link 
          to="/submit" 
          className={`flex flex-col items-center space-y-1 ${isActive('/submit') ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <PlusCircle size={24} />
          <span className="text-[10px] font-medium">เสนอทรัพย์</span>
        </Link>

        <Link 
          to="/contact" 
          className={`flex flex-col items-center space-y-1 ${isActive('/contact') ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <Phone size={24} />
          <span className="text-[10px] font-medium">ติดต่อเรา</span>
        </Link>
      </div>
    </>
  );
};

export default Navigation;