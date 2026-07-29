import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import client from '../../api/client';

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => client.get('/menu/categories/').then((r) => r.data),
  });

  const { data: items } = useQuery({
    queryKey: ['menu-items', activeCategory],
    queryFn: () => client.get('/menu/items/', { params: activeCategory ? { category__slug: activeCategory } : {} }).then((r) => r.data),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="page-heading mb-8">Our Menu</h1>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !activeCategory ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories?.results?.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.slug ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.results?.map((item) => (
          <Link
            key={item.id}
            to={`/menu/${item.slug}`}
            className="card-restaurant overflow-hidden group"
          >
            <div className="aspect-[4/3] overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex flex-col items-center justify-center gap-2">
                  <UtensilsCrossed className="w-10 h-10 text-brand-400" />
                  <span className="text-xs font-medium text-brand-500">{item.name}</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <span className="text-brand-600 font-semibold">${item.price}</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
