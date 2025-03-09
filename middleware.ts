// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname === '/login';
    const isApiRoute = req.nextUrl.pathname.startsWith('/api/');
    
    // Si es una página de autenticación y hay token, redirigir al home
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Si no hay token y no es una página de autenticación ni una ruta de API de auth, redirigir al login
    if (!token && !isAuthPage && !req.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Si hay token pero no tiene rol, denegar acceso
    if (token && !token.role) {
      return NextResponse.json(
        { error: "No autorizado", message: "No tiene los permisos necesarios" },
        { status: 403 }
      );
    }

    // Verificar permisos específicos para rutas de administración
    if (token && token.role !== 'admin' && (
      req.nextUrl.pathname.startsWith('/usuarios') ||
      (req.nextUrl.pathname.startsWith('/api/users') && req.method !== 'GET')
    )) {
      return NextResponse.json(
        { error: "No autorizado", message: "Se requieren permisos de administrador" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a rutas de autenticación
        if (req.nextUrl.pathname.startsWith('/api/auth')) {
          return true;
        }
        // Permitir acceso a la página de login sin token
        if (req.nextUrl.pathname === '/login') {
          return true;
        }
        // Para todas las demás rutas, requerir token
        return !!token;
      }
    },
  }
);

// Proteger todas las rutas excepto /auth/*
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ]
};