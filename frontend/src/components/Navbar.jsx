import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Menu as MenuIcon, User, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-display text-2xl font-bold text-brand-600">
            Resta
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/menu" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors">
              Menu
            </Link>
            <Link to="/reservations" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors">
              Reservations
            </Link>
            <Link to="/orders" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors">
              Orders
            </Link>

            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-brand-600 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors">
                  Dashboard
                </Link>
                <span className="text-sm text-gray-400">{user.email}</span>
                <button onClick={logout} className="btn-ghost">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth/login" className="btn-primary text-sm px-4 py-2">
                Sign In
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/menu" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Menu</Link>
            <Link to="/reservations" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Reservations</Link>
            <Link to="/orders" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Orders</Link>
            <Link to="/cart" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Cart ({itemCount})</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Dashboard</Link>
                <button onClick={logout} className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Sign Out</button>
              </>
            ) : (
              <Link to="/auth/login" className="block px-3 py-2 text-sm font-medium text-brand-600 hover:bg-gray-50 rounded-lg">Sign In</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
