import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  ShoppingBag,
  Star,
  TrendingUp,
  MessageSquare,
  Settings,
  Building2,
  UserCog,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/locales/useTranslation';
import { UserRole } from '@/types';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const menuItems = [
    {
      name: t('nav.dashboard'),
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: [UserRole.SALON_MANAGER, UserRole.DESIGNER, UserRole.SUPER_ADMIN],
    },
    {
      name: t('nav.bookings'),
      icon: Calendar,
      href: '/bookings',
      roles: [UserRole.SALON_MANAGER, UserRole.DESIGNER, UserRole.SUPER_ADMIN],
    },
    {
      name: t('nav.customers'),
      icon: Users,
      href: '/customers',
      roles: [UserRole.SALON_MANAGER, UserRole.DESIGNER],
    },
    {
      name: t('nav.designers'),
      icon: Scissors,
      href: '/designers',
      roles: [UserRole.SALON_MANAGER],
    },
    {
      name: t('nav.services'),
      icon: ShoppingBag,
      href: '/services',
      roles: [UserRole.SALON_MANAGER],
    },
    {
      name: t('nav.reviews'),
      icon: Star,
      href: '/reviews',
      roles: [UserRole.SALON_MANAGER, UserRole.DESIGNER],
    },
    {
      name: t('nav.sales'),
      icon: TrendingUp,
      href: '/sales',
      roles: [UserRole.SALON_MANAGER, UserRole.DESIGNER],
    },
    {
      name: t('nav.chat'),
      icon: MessageSquare,
      href: '/chat',
      roles: [UserRole.SALON_MANAGER, UserRole.DESIGNER],
    },
    {
      name: t('nav.salons'),
      icon: Building2,
      href: '/salons',
      roles: [UserRole.SUPER_ADMIN],
    },
    {
      name: t('nav.users'),
      icon: UserCog,
      href: '/users',
      roles: [UserRole.SALON_MANAGER, UserRole.SUPER_ADMIN],
    },
    {
      name: t('nav.settings'),
      icon: Settings,
      href: '/settings',
      roles: [UserRole.SALON_MANAGER, UserRole.DESIGNER, UserRole.SUPER_ADMIN],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-white border-r border-secondary-200 transition-transform duration-300 lg:relative',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ width: '280px' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
            <Link href="/dashboard" className="flex items-center">
              <Scissors className="w-8 h-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-secondary-900">
                Salon Admin
              </span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-secondary-500 hover:text-secondary-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center px-4 py-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-secondary-700 hover:bg-secondary-100'
                      )}
                    >
                      <Icon size={20} className="mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info */}
          <div className="px-6 py-4 border-t border-secondary-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900">
                  {user?.name}
                </p>
                <p className="text-xs text-secondary-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
