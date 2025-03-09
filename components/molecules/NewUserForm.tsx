import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { useSession } from "next-auth/react";

interface NewUserFormProps {
  onUserCreated?: (user: any) => void;
}

export function NewUserForm({ onUserCreated }: NewUserFormProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🔍 Estado de sesión:", status);
  console.log("🧑‍💻 Datos de sesión:", session);

  // Si la sesión aún se está cargando, mostramos un mensaje
  if (status === "loading") return <p>Cargando sesión...</p>;

  // Si no hay sesión o el usuario no es admin, bloqueamos el acceso
  const isAdmin = session?.user?.role === "admin";
  if (!isAdmin) {
    return <p>No tienes permisos para acceder a este formulario.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    const payload = { ...formData };
  
    console.log("📤 Enviando datos:", payload);
  
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.token || ''}`,
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al crear el usuario: ${errorText}`);
      }
  
      const user = await response.json();
      console.log("✅ Usuario creado:", user);
  
      onUserCreated?.(user);
      setOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
      });
    } catch (error: any) {
      console.error("❌ Error:", error);
      setError("Hubo un problema al guardar el usuario. Verifica tus permisos.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gray-800 hover:bg-gray-700 text-white">
            <PlusIcon className="mr-2 h-4 w-4" /> Nuevo Usuario
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md rounded-lg bg-black text-white border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-200">
              Nuevo Usuario
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Nombre
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-gray-500 p-2 rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-gray-500 p-2 rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-gray-500 p-2 rounded-md"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-300">
                Rol
              </Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-gray-500 p-2 rounded-md"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Usuario"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
