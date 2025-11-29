import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const AdminStatusBanner: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-slate-900/95 backdrop-blur-md z-[1000] flex items-center justify-between px-4 text-xs font-bold text-white border-b border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
      <div className="flex items-center gap-2">
        <Shield size={14} className="text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]" />
        <span className="tracking-wider">מצב מנהל מערכת פעיל</span>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="hover:text-red-300 transition-colors"
        >
          פאנל ניהול
        </button>
        <button
          onClick={() => logout()}
          className="hover:text-red-300 transition-colors"
        >
          התנתק
        </button>
      </div>
    </div>
  );
};

export default AdminStatusBanner;