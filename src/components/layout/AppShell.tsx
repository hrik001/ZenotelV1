import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { repository } from '../../lib/repository';
import { Property, Organization } from '../../types';
import { 
  Building2, 
  CalendarDays, 
  LayoutDashboard, 
  Users, 
  BedDouble, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Search, 
  HelpCircle,
  Menu,
  X,
  LogOut,
  Building
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [activePropertyId, setActivePropertyId] = useState<string>('all');
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const orgs = await repository.getOrganizations(user.id);
      setOrganizations(orgs);
      
      if (orgs.length > 0) {
        setActiveOrg(orgs[0]);
        const props = await repository.getProperties(orgs[0].id);
        setProperties(props);
      } else {
        // If they have no organizations, they should go through onboarding
        navigate('/onboarding');
      }
    };
    loadData();
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'TODAY',
      items: [
        { name: 'Overview', to: '/', icon: LayoutDashboard, exact: true },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Calendar', to: '/calendar', icon: CalendarDays },
        { name: 'Bookings', to: '/bookings', icon: BedDouble },
        { name: 'Guests', to: '/guests', icon: Users },
      ]
    },
    {
      title: 'PROPERTY',
      items: [
        { name: 'Properties', to: '/properties', icon: Building2 },
        { name: 'Units / Rooms', to: '/units', icon: Building },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { name: 'Payments', to: '/payments', icon: CreditCard },
        { name: 'Reports', to: '/reports', icon: BarChart3 },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Settings', to: '/settings', icon: Settings },
      ]
    }
  ];

  if (!activeOrg) return null; // Wait for org load

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden text-stone-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-stone-200 bg-white">
        <div className="h-16 flex items-center px-6 border-b border-stone-200">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xl tracking-tight">
            <Building2 className="w-6 h-6" />
            <span>Bookzee</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups.map((group, i) => (
            <div key={i}>
              <h3 className="px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-teal-50 text-teal-800" 
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-stone-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{user?.name}</p>
              <p className="text-xs text-stone-500 truncate">{activeOrg.name}</p>
            </div>
            <button onClick={handleLogout} className="text-stone-400 hover:text-stone-600" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-stone-200 bg-white shadow-sm z-10">
          <div className="flex items-center flex-1">
            <button 
              className="md:hidden mr-4 text-stone-500 hover:text-stone-900"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Property Switcher */}
            <div className="relative flex items-center">
              <select
                className="appearance-none bg-stone-100 border-none text-stone-900 text-sm font-medium rounded-md pl-3 pr-8 py-2 focus:ring-2 focus:ring-teal-600 focus:outline-none max-w-xs truncate"
                value={activePropertyId}
                onChange={(e) => setActivePropertyId(e.target.value)}
              >
                <option value="all">All properties</option>
                <option disabled>──────────</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-stone-400 hover:text-stone-600 hidden sm:block" title="Search (Cmd+K)">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-stone-400 hover:text-stone-600" title="Help">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-auto focus:outline-none">
          <Outlet context={{ activeOrg, properties, activePropertyId }} />
        </main>
      </div>

      {/* Mobile Drawer (simplified) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-stone-900/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-4">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            {/* Mobile Nav Content could mirror desktop */}
            <div className="h-16 flex items-center px-6 border-b border-stone-200">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-xl">
                <Building2 className="w-6 h-6" />
                <span>Bookzee</span>
              </div>
            </div>
            <div className="flex-1 h-0 overflow-y-auto pt-5 pb-4 px-3 space-y-6">
              {navGroups.map((group, i) => (
                <div key={i}>
                  <h3 className="px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.to}
                        end={item.exact}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors",
                          isActive ? "bg-teal-50 text-teal-800" : "text-stone-600"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
