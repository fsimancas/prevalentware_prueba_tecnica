import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

interface FormData {
  concept: string;
  amount: string;
  date: string;
  type: string;
  userId?: string;
}

interface FormErrors {
  concept?: string;
  amount?: string;
  date?: string;
  type?: string;
  userId?: string;
  submit?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function CreateMovementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    concept: "",
    amount: "",
    date: "",
    type: "ingreso",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((error) => console.error("Error fetching users:", error));
    }
  }, [session]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.concept.trim()) {
      newErrors.concept = "El concepto es requerido";
    } else if (formData.concept.length > 100) {
      newErrors.concept = "El concepto no puede tener más de 100 caracteres";
    }

    if (!formData.amount) {
      newErrors.amount = "El monto es requerido";
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "El monto debe ser un número positivo";
    }

    if (!formData.date) {
      newErrors.date = "La fecha es requerida";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date = "La fecha no puede ser futura";
      }
    }

    if (!formData.type) {
      newErrors.type = "El tipo de movimiento es requerido";
    }

    if (session?.user?.role === "admin" && !selectedUserId) {
      newErrors.userId = "Debe seleccionar un usuario";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        userId: session?.user?.role === "admin" ? Number(selectedUserId) : session?.user?.id,
      };

      const res = await fetch("/api/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al crear el movimiento");
      }

      toast.success("Movimiento creado correctamente");
      router.push("/ingresos-egresos");
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Error al crear el movimiento",
      }));
      toast.error(error.message || "Error al crear el movimiento");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Cargando...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-900 min-h-screen">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Nuevo Movimiento</h1>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
              <div>
                <Label htmlFor="concept">Concepto</Label>
                <Input
                  id="concept"
                  value={formData.concept}
                  onChange={(e) =>
                    setFormData({ ...formData, concept: e.target.value })
                  }
                  className={errors.concept ? "border-red-500" : ""}
                />
                {errors.concept && (
                  <p className="text-red-500 text-sm mt-1">{errors.concept}</p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className={errors.amount ? "border-red-500" : ""}
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingreso">Ingreso</SelectItem>
                    <SelectItem value="egreso">Egreso</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                )}
              </div>

              {session?.user?.role === "admin" && (
                <div>
                  <Label htmlFor="userId">Usuario</Label>
                  <Select
                    value={selectedUserId}
                    onValueChange={setSelectedUserId}
                  >
                    <SelectTrigger className={errors.userId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccione un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.userId && (
                    <p className="text-red-500 text-sm mt-1">{errors.userId}</p>
                  )}
                </div>
              )}

              {errors.submit && (
                <p className="text-red-500 text-sm mt-1">{errors.submit}</p>
              )}

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/ingresos-egresos")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
