import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Menu as MenuIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  User,
  Calendar,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function UserAvatar({ user }) {
  const initial = (user.first_name?.[0] || user.email[0] || '?').toUpperCase();

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt=""
        className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
      />
    );
  }

  const colors = [
    'bg-brand-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-rose-500',
  ];
  const color = colors[(user.id || 0) % colors.length];

  return (
    <div
      className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-sm font-semibold ring-2 ring-white`}
    >
      {initial}
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="font-display text-2xl font-bold text-brand-600 flex-shrink-0"
          >
            Resta
          </Link>

          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {user && (
              <NavLink to="/dashboard" label="Dashboard" />
            )}
            <NavLink to="/menu" label="Menu" />
            <NavLink to="/reservations" label="Reservations" />
            <NavLink to="/orders" label="Orders" />

            <Link
              to="/cart"
              className="relative p-2 ml-2 text-gray-700 hover:text-brand-600 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <UserAvatar user={user} />
                  <span className="text-sm font-medium text-gray-700">
                    Hi, {user.first_name || 'there'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/reservations/my"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-gray-400" />
                      My Reservations
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      My Profile
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="btn-primary text-sm px-4 py-2 ml-2"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {user && (
              <MobileNavLink
                to="/dashboard"
                label="Dashboard"
                onClick={() => setMobileOpen(false)}
              />
            )}
            <MobileNavLink
              to="/menu"
              label="Menu"
              onClick={() => setMobileOpen(false)}
            />
            <MobileNavLink
              to="/reservations"
              label="Reservations"
              onClick={() => setMobileOpen(false)}
            />
            <MobileNavLink
              to="/orders"
              label="Orders"
              onClick={() => setMobileOpen(false)}
            />
            <MobileNavLink
              to="/cart"
              label={`Cart (${itemCount})`}
              onClick={() => setMobileOpen(false)}
            />
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3 border-t border-gray-100 mt-2 pt-3">
                  <UserAvatar user={user} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <MobileNavLink
                  to="/profile"
                  label="My Profile"
                  icon={<User className="w-4 h-4" />}
                  onClick={() => setMobileOpen(false)}
                />
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <MobileNavLink
                to="/auth/login"
                label="Sign In"
                onClick={() => setMobileOpen(false)}
              />
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors rounded-lg hover:bg-gray-50"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label, icon, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
