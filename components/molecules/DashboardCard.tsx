import Link from 'next/link';
import { UsersIcon, LineChart, ArrowUpDown } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: 'users' | 'movements' | 'reports';
}

const iconMap = {
  users: UsersIcon,
  movements: ArrowUpDown,
  reports: LineChart,
};

export function DashboardCard({ title, description, href, icon }: DashboardCardProps) {
  const Icon = iconMap[icon];

  return (
    <Link href={href}>
      <div className="relative overflow-hidden bg-white bg-opacity-10 rounded-xl p-6 hover:bg-opacity-15 transition-all duration-300 transform hover:scale-105 cursor-pointer group">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
          <div className="absolute inset-0 bg-white opacity-10 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg group-hover:bg-opacity-30 transition-colors">
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
            {title}
          </h2>
          
          <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
            {description}
          </p>
        </div>
        
        <div className="absolute bottom-0 right-0 p-4">
          <div className="text-white opacity-20 transform rotate-45 group-hover:scale-110 transition-transform">
            <Icon className="h-12 w-12" />
          </div>
        </div>
      </div>
    </Link>
  );
} 