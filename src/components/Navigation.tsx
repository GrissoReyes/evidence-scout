import { Link, useLocation } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Sources', path: '/sources' },
  ];

  return (
    <header className="bg-teal-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 max-w-4xl flex flex-col sm:flex-row items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 mb-4 sm:mb-0">
          <Stethoscope className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Evidence Scout</h1>
            <p className="text-teal-100 text-xs tracking-wide uppercase font-semibold">Clinical evidence, at the bedside.</p>
          </div>
        </Link>
        <nav>
          <ul className="flex space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`hover:text-teal-200 transition-colors ${
                    location.pathname === link.path ? 'border-b-2 border-white pb-1' : ''
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
