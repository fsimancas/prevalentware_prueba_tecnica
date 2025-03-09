import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { 
  MenuIcon,
  XIcon,
  UsersIcon,
  LineChart,
  ArrowUpDown,
  LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const isActive = (path: string) => router.pathname === path;

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: MenuIcon,
      show: true
    },
    {
      name: 'Usuarios',
      href: '/usuarios',
      icon: UsersIcon,
      show: session?.user?.role === 'admin'
    },
    {
      name: 'Movimientos',
      href: '/ingresos-egresos',
      icon: ArrowUpDown,
      show: true
    },
    {
      name: 'Reportes',
      href: '/reportes',
      icon: LineChart,
      show: session?.user?.role === 'admin'
    }
  ];

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  return (
    <div 
      className={`bg-gray-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        {!isCollapsed && <h1 className="text-xl font-bold">Dashboard</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-800 rounded-lg"
        >
          {isCollapsed ? (
            <MenuIcon className="h-6 w-6" />
          ) : (
            <XIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.filter(item => item.show).map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  {!isCollapsed && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LogOut className="h-6 w-6" />
          {!isCollapsed && <span className="ml-3">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
} 