import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";

interface Movement {
  id: number;
  concept: string;
  amount: number;
  date: string;
  type: string;
  userId: number;
  user?: {
    name: string;
  };
}

interface MovementsTableProps {
  movements: Movement[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function MovementsTable({
  movements,
  currentPage,
  totalPages,
  onPageChange,
}: MovementsTableProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const formatAmount = (amount: number, type: string) => {
    const formattedAmount = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount);

    const colorClass = type === "ingreso" ? "text-green-600" : "text-red-600";
    return <span className={colorClass}>{formattedAmount}</span>;
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Concepto</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>{movement.concept}</TableCell>
              <TableCell>
                {formatAmount(movement.amount, movement.type)}
              </TableCell>
              <TableCell className="capitalize">{movement.type}</TableCell>
              <TableCell>
                {format(new Date(movement.date), "dd/MM/yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 