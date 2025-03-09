import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { DashboardCard } from '@/components/molecules/DashboardCard';
import { useIsMobile } from '@/components/hooks/use-mobile';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export default function Home() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const router = useRouter();
  const isMobile = useIsMobile();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="text-white">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="text-gray-400">
            Bienvenido, {session?.user?.name}
          </div>
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-6`}>
          {session?.user?.role === 'admin' && (
            <DashboardCard
              title="Usuarios"
              description="Gestiona los usuarios del sistema"
              href="/usuarios"
              icon="users"
            />
          )}
          <DashboardCard
            title="Movimientos"
            description="Visualiza y registra movimientos"
            href="/ingresos-egresos"
            icon="movements"
          />
          <DashboardCard
            title="Reportes"
            description="Genera reportes y estadísticas"
            href="/reportes"
            icon="reports"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
