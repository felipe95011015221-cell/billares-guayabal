import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_ADMIN, verificarSesion } from "./lib/session";

/** Primera barrera: toda ruta /admin (excepto /admin/login) requiere sesión válida. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const secreto = process.env.ADMIN_SESSION_SECRET;
    const sesion = await verificarSesion(req.cookies.get(COOKIE_ADMIN)?.value, secreto && secreto.length >= 32 ? secreto : null);
    if (!sesion) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|images|favicon.ico).*)"] };
