import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verificar inicialmente
    checkIfMobile();

    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener('resize', checkIfMobile);

    // Limpiar listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
} 