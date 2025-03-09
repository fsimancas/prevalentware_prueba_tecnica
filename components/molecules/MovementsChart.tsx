import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingDown, TrendingUp } from "lucide-react"
import { BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Movement {
  id: number;
  concept: string;
  amount: number;
  date: string;
  type: "ingreso" | "egreso";
  userId: number;
}

interface MovementsChartProps {
  movements: Movement[];
}

export function MovementsChart({ movements }: MovementsChartProps) {
  const today = useMemo(() => new Date(), []);
  const firstDayOfMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const lastDayOfMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 1, 0), [today]);

  const chartData = useMemo(() => {
    const dailyTotals = new Map<string, { income: number; expense: number }>();

    // Inicializar todos los días del mes con 0
    let currentDate = new Date(firstDayOfMonth);
    while (currentDate <= lastDayOfMonth) {
      const dateStr = currentDate.toISOString().split("T")[0];
      dailyTotals.set(dateStr, { income: 0, expense: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Sumar los movimientos por día
    movements.forEach((movement) => {
      const dateStr = new Date(movement.date).toISOString().split("T")[0];
      const current = dailyTotals.get(dateStr) || { income: 0, expense: 0 };

      if (movement.type === "ingreso") {
        current.income += movement.amount;
      } else {
        current.expense += movement.amount;
      }

      dailyTotals.set(dateStr, current);
    });

    const sortedDates = Array.from(dailyTotals.keys()).sort();
    const incomes = sortedDates.map((date) => dailyTotals.get(date)?.income || 0);
    const expenses = sortedDates.map(
      (date) => dailyTotals.get(date)?.expense || 0
    );

    return {
      labels: sortedDates.map((date) =>
        new Date(date).toLocaleDateString("es-ES", { day: "numeric" })
      ),
      datasets: [
        {
          label: "Ingresos",
          data: incomes,
          backgroundColor: "rgba(34, 197, 94, 0.5)",
          borderColor: "rgb(34, 197, 94)",
          borderWidth: 1,
        },
        {
          label: "Egresos",
          data: expenses,
          backgroundColor: "rgba(239, 68, 68, 0.5)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 1,
        },
      ],
    };
  }, [movements, firstDayOfMonth, lastDayOfMonth]);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Movimientos del Mes",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(Number(value));
          }
        },
      },
    },
  };

  // Calcular totales del período
  const totals = useMemo(() => {
    return movements.reduce(
      (acc, movement) => {
        if (movement.type === "ingreso") {
          acc.income += movement.amount;
        } else {
          acc.expense += movement.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [movements]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen del Período</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-green-500">
            Ingresos: {formatCurrency(totals.income)}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-red-500">
            Egresos: {formatCurrency(totals.expense)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
