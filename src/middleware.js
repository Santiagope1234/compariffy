import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];

// Middleware para proteger rutas
export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Verificar si la ruta actual está protegida
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // Obtener el token desde las cookies
    const token = req.cookies.get("firebase-auth-token");

    if (!token) {
      // Si no hay token, redirige al login
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      // Verificar el token en Firebase Auth (sin Firebase Admin)
      if (token) {
        return NextResponse.next();
      } else {
        // Si el token no es válido, redirige al login
        return NextResponse.redirect(new URL("/login", req.url));
      }
    } catch (error) {
      console.error("Error al verificar el token:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Si la ruta no está protegida, permite el acceso
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // Proteger todas las rutas bajo /dashboard
};
