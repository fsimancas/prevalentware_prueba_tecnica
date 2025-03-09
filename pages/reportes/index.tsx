import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { MovementsChart } from '@/components/molecules/MovementsChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';

interface Movement {
  id: number;
  concept: string;
  amount: number;
  date: string;
  type: "ingreso" | "egreso";
  userId: number;
  user?: {
    name: string;
  };
}

export default function ReportsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Establecer las fechas iniciales al primer y último día del mes actual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await fetch('/api/movements');
        if (!response.ok) throw new Error('Error al cargar los movimientos');
        const data = await response.json();
        setMovements(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Filtrar movimientos por fecha
  const filteredMovements = movements.filter(movement => {
    const movementDate = new Date(movement.date).toISOString().split('T')[0];
    return movementDate >= startDate && movementDate <= endDate;
  });

  // Calcular estadísticas solo de los movimientos filtrados
  const totalIngresos = filteredMovements
    .filter(m => m.type === "ingreso")
    .reduce((sum, m) => sum + m.amount, 0);

  const totalEgresos = filteredMovements
    .filter(m => m.type === "egreso")
    .reduce((sum, m) => sum + m.amount, 0);

  const balance = totalIngresos - totalEgresos;

  const handleDownloadCSV = () => {
    // Crear el contenido del CSV
    const headers = ['Fecha', 'Concepto', 'Tipo', 'Monto', 'Usuario'];
    const rows = filteredMovements.map(m => [
      new Date(m.date).toLocaleDateString('es-CO'),
      m.concept,
      m.type,
      m.amount,
      m.user?.name || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="bg-gray-900 text-white min-h-screen p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-gray-400 mt-2">
            Visualiza el resumen de movimientos y estadísticas generales
          </p>
        </div>

        {/* Filtros y botón de descarga */}
        <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <Label htmlFor="startDate" className="text-white">Fecha Inicio</Label>
              <Input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white bg-opacity-10 text-white"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-white">Fecha Fin</Label>
              <Input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white bg-opacity-10 text-white"
              />
            </div>
            <Button
              onClick={handleDownloadCSV}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Descargar Reporte CSV
            </Button>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-300">Total Ingresos</h3>
            <p className="text-2xl font-bold text-green-400 mt-2">
              {formatCurrency(totalIngresos)}
            </p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-300">Total Egresos</h3>
            <p className="text-2xl font-bold text-red-400 mt-2">
              {formatCurrency(totalEgresos)}
            </p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-300">Balance</h3>
            <p className={`text-2xl font-bold mt-2 ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Gráfico de barras */}
        <div className="bg-white bg-opacity-10 rounded-lg p-6">
          <MovementsChart movements={filteredMovements} />
        </div>
      </div>
    </DashboardLayout>
  );
}
