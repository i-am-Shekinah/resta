import { Link } from 'react-router-dom';
import { ArrowRight, UtensilsCrossed, CalendarDays, ShoppingBag } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/40" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-6xl font-display font-bold mb-6 text-balance">
            Exceptional dining, <br />crafted for every occasion
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-xl">
            Explore our menu of handcrafted dishes, reserve a table, or order online for pickup or delivery.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/menu" className="btn-primary text-base px-8 py-4">
              View Menu <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/reservations" className="text-base px-8 py-4 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold hover:bg-white/20 hover:border-white/30 hover:text-white transition-colors inline-flex items-center justify-center shadow-sm">
              <CalendarDays className="mr-2 w-5 h-5" /> Reserve a Table
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-3 gap-8">
          <Link to="/menu" className="text-center p-8 card-restaurant block cursor-pointer">
            <UtensilsCrossed className="w-10 h-10 text-brand-600 mx-auto mb-4" />
            <h3 className="section-title mb-2">Browse Menu</h3>
            <p className="text-gray-600 text-sm">Explore our curated selection of appetizers, mains, desserts, and more.</p>
          </Link>
          <Link to="/cart" className="text-center p-8 card-restaurant block cursor-pointer">
            <ShoppingBag className="w-10 h-10 text-brand-600 mx-auto mb-4" />
            <h3 className="section-title mb-2">Order Online</h3>
            <p className="text-gray-600 text-sm">Add items to your cart and checkout with ease. Pickup or delivery.</p>
          </Link>
          <Link to="/reservations" className="text-center p-8 card-restaurant block cursor-pointer">
            <CalendarDays className="w-10 h-10 text-brand-600 mx-auto mb-4" />
            <h3 className="section-title mb-2">Reserve a Table</h3>
            <p className="text-gray-600 text-sm">Book a table for your next visit. Indoor and patio seating available.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
