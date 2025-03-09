import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import MovementsTable from '@/components/molecules/MovementsTable';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Movement {
  id: number;
  concept: string;
  amount: number;
  date: string;
  type: string;
  userId: number;
}

export default function MovementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    concept: "",
    type: "",
  });

  const movementsPerPage = 8;
  const indexOfLastMovement = currentPage * movementsPerPage;
  const indexOfFirstMovement = indexOfLastMovement - movementsPerPage;
  const currentMovements = filteredMovements.slice(
    indexOfFirstMovement,
    indexOfLastMovement
  );
  const totalPages = Math.ceil(filteredMovements.length / movementsPerPage);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await fetch("/api/movements");
        if (!res.ok) throw new Error("Error al cargar los movimientos");
        const data = await res.json();
        setMovements(data);
        setFilteredMovements(data);
      } catch (error: any) {
        console.error("Error:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovements();
  }, []);

  useEffect(() => {
    const filtered = movements.filter((movement) => {
      if (
        filters.startDate &&
        new Date(movement.date) < new Date(filters.startDate)
      )
        return false;
      if (filters.endDate && new Date(movement.date) > new Date(filters.endDate))
        return false;
      if (
        filters.minAmount &&
        movement.amount < Number(filters.minAmount)
      )
        return false;
      if (
        filters.maxAmount &&
        movement.amount > Number(filters.maxAmount)
      )
        return false;
      if (
        filters.concept &&
        !movement.concept
          .toLowerCase()
          .includes(filters.concept.toLowerCase())
      )
        return false;
      if (filters.type && movement.type !== filters.type) return false;
      return true;
    });

    setFilteredMovements(filtered);
    setCurrentPage(1);
  }, [filters, movements]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      concept: "",
      type: "",
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <DashboardLayout>
        <div className="bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Cargando...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-900 min-h-screen">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Movimientos</h1>
            <Link href="/ingresos-egresos/crear">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Movimiento
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Rango de fechas</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    placeholder="Fecha inicio"
                  />
                  <Input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    placeholder="Fecha fin"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rango de montos</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    name="minAmount"
                    value={filters.minAmount}
                    onChange={handleFilterChange}
                    placeholder="Monto mínimo"
                  />
                  <Input
                    type="number"
                    name="maxAmount"
                    value={filters.maxAmount}
                    onChange={handleFilterChange}
                    placeholder="Monto máximo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Filtros adicionales</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    name="concept"
                    value={filters.concept}
                    onChange={handleFilterChange}
                    placeholder="Buscar por concepto"
                  />
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="ingreso">Ingresos</option>
                    <option value="egreso">Egresos</option>
                  </select>
                  <Button variant="outline" onClick={resetFilters}>
                    Limpiar
                  </Button>
                </div>
              </div>
            </div>

            <MovementsTable
              movements={currentMovements}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
