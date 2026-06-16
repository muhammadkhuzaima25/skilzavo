import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  MessageSquare,
  LogOut,
  ChevronDown,
  Globe,
  Trash2,
  Menu,
  Settings,
  Briefcase,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useCurrency } from '../context/CurrencyContext';
import API from '../utils/axios';

const CURRENCIES = ['USD', 'PKR', 'INR', 'EUR', 'GBP'];

const Navbar = () => {
  const { user, setUser, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [mode, setMode] = useState(localStorage.getItem('mode') || 'seller');
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const profileRef = useRef(null);
  const currencyRef = useRef(null);

  const closeAll = useCallback(() => {
    setProfileOpen(false);
    setCurrencyOpen(false);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (currencyRef.current && !currencyRef.current.contains(e.target)) setCurrencyOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNav = (path) => {
    setProfileOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    closeAll();
    logout();
    navigate('/login');
  };

  const selectCurrency = (c) => {
    setCurrency(c);
    setCurrencyOpen(false);
  };

  const toggleMode = () => {
    const next = mode === 'seller' ? 'buyer' : 'seller';
    setMode(next);
    localStorage.setItem('mode', next);
    closeAll();
    navigate(next === 'buyer' ? '/dashboard/customer' : '/dashboard/provider');
  };

  const handleDeletePhoto = async () => {
    if (!user?.profilePicture && !user?.avatar) return;
    setDeletingPhoto(true);
    try {
      const { data } = await API.put('/api/auth/profile', { avatar: '' });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      /* silent */
    } finally {
      setDeletingPhoto(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const roleDashboard = (role) => {
    if (role === 'customer') return '/dashboard/customer';
    if (role === 'provider') return '/dashboard/provider';
    if (role === 'admin') return '/dashboard/admin';
    return '/dashboard';
  };

  return (
    <nav className="bg-primary-dark sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src="/Skilzavo_logo.svg" alt="Skilzavo" className="h-8 w-8" />
            <span className="font-body text-xl font-black text-white">Skilzavo</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/services" className="text-white/80 hover:text-accent font-medium text-sm transition-colors">
              Services
            </Link>

            {user ? (
              <>
                <Link to={roleDashboard(user.role)} className="text-white/80 hover:text-accent font-medium text-sm transition-colors">
                  Dashboard
                </Link>

                {user.role === 'customer' || user.role === 'provider' ? (
                  <div className="flex items-center bg-black/20 rounded-full p-0.5">
                    <button
                      onClick={() => mode !== 'buyer' && toggleMode()}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        mode === 'buyer' ? 'bg-primary-dark text-white shadow-sm' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Buyer
                    </button>
                    <button
                      onClick={() => mode !== 'seller' && toggleMode()}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        mode === 'seller' ? 'bg-primary-dark text-white shadow-sm' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Seller
                    </button>
                  </div>
                ) : null}

                <div className="relative" ref={currencyRef}>
                  <button
                    onClick={() => { setCurrencyOpen(!currencyOpen); setProfileOpen(false); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/80 hover:text-accent text-sm font-medium transition-colors"
                  >
                    <Globe size={15} />
                    <span>{currency}</span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${currencyOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {currencyOpen && (
                    <div className="absolute right-0 top-full mt-2 w-28 bg-primary-dark rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
                      {CURRENCIES.map((c) => (
                        <button
                          key={c}
                          onClick={() => selectCurrency(c)}
                          className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                            currency === c
                              ? 'text-accent font-medium bg-white/10'
                              : 'text-white/70 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setCurrencyOpen(false); }}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary-dark flex items-center justify-center overflow-hidden ring-2 ring-white/20 hover:ring-white/40 transition-all">
                      {user.profilePicture || user.avatar ? (
                        <img src={user.profilePicture || user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white">{initials}</span>
                      )}
                    </div>
                    <ChevronDown size={14} className={`text-white/60 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-primary-dark rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
                      <div className="relative group px-4 pt-4 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-full bg-primary-dark overflow-hidden flex-shrink-0 ring-2 ring-white/20">
                            {user.profilePicture || user.avatar ? (
                              <>
                                <img src={user.profilePicture || user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  {deletingPhoto ? (
                                    <span className="text-white text-[10px] font-medium">...</span>
                                  ) : (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeletePhoto(); }}
                                      className="text-red-400 hover:text-red-300"
                                      title="Delete photo"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  )}
                                </div>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-white w-full h-full flex items-center justify-center">
                                {initials}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-xs text-white/50 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="h-px bg-white/10" />

                      <Link
                        to="/dashboard/overview"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <LayoutDashboard size={16} className="text-white/40" />
                        Overview
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <User size={16} className="text-white/40" />
                        My Profile
                      </Link>
                      {user.role === 'provider' && (
                        <Link
                          to="/dashboard/services"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                        >
                          <Briefcase size={16} className="text-white/40" />
                          My Services
                        </Link>
                      )}
                      <Link
                        to="/dashboard/messages"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <MessageSquare size={16} className="text-white/40" />
                        Messages
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <Settings size={16} className="text-white/40" />
                        Settings
                      </Link>

                      <div className="h-px bg-white/10" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-white/80 hover:text-accent font-medium text-sm transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <MobileMenu user={user} logout={handleLogout} mode={mode} toggleMode={toggleMode} currency={currency} selectCurrency={selectCurrency} roleDashboard={roleDashboard} navigate={navigate} />
          </div>
        </div>
      </div>
    </nav>
  );
};

const MobileMenu = ({ user, logout, mode, toggleMode, currency, selectCurrency, roleDashboard, navigate }) => {
  const [open, setOpen] = useState(false);

  const handleNav = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-1">
        {user && (user.profilePicture || user.avatar) ? (
          <img src={user.profilePicture || user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
        ) : (
          <Menu size={22} className="text-white" />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-primary-dark rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
            {user ? (
              <>
                <div className="px-4 py-3">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>
                <div className="h-px bg-white/10" />

                {user.role === 'customer' || user.role === 'provider' ? (
                  <div className="px-4 py-2">
                    <div className="flex bg-primary-dark rounded-full p-0.5">
                      <button
                        onClick={() => { mode !== 'buyer' && toggleMode(); setOpen(false); }}
                        className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          mode === 'buyer' ? 'bg-primary text-white shadow-sm' : 'text-white/70'
                        }`}
                      >
                        Buyer
                      </button>
                      <button
                        onClick={() => { mode !== 'seller' && toggleMode(); setOpen(false); }}
                        className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          mode === 'seller' ? 'bg-primary text-white shadow-sm' : 'text-white/70'
                        }`}
                      >
                        Seller
                      </button>
                    </div>
                  </div>
                ) : null}

                <button onClick={() => handleNav(roleDashboard(user.role))} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left">
                  Dashboard
                </button>
                <button onClick={() => handleNav('/services')} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left">
                  Services
                </button>

                <div className="h-px bg-white/10" />

                <div className="px-4 py-2">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                    <Globe size={13} />
                    Currency
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['USD', 'PKR', 'INR', 'EUR', 'GBP'].map((c) => (
                      <button
                        key={c}
                        onClick={() => { selectCurrency(c); }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          currency === c ? 'bg-primary text-white' : 'bg-white/10 text-white/70 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/10" />
                <button onClick={() => { setOpen(false); logout(); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors text-left">
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleNav('/login')} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left">
                  Login
                </button>
                <button onClick={() => handleNav('/register')} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors text-left">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
