/**
 * ============================================================
 * MIDDLEWARE — src/middleware.ts
 * ============================================================
 *
 * Le middleware Next.js s'exécute AVANT chaque requête.
 * Il protège les routes en vérifiant le cookie de session
 * Firebase sans avoir besoin d'importer Firebase côté serveur.
 *
 * RÈGLES DE REDIRECTION :
 *
 *   Pages PUBLIQUES (accessibles sans connexion) :
 *     /              → landing page
 *     /login         → page de connexion
 *     /register      → page d'inscription
 *     /search        → recherche (libre pour convertir les visiteurs)
 *     /doctor/[id]   → profil médecin (bouton confirmer gère le login)
 *
 *   Pages PROTÉGÉES (connexion requise) :
 *     /dashboard          → tableau de bord patient → /login
 *     /admin/**           → pages admin médecin    → /login
 *
 *   Pages AUTH (redirigent si déjà connecté) :
 *     /login    → /search si déjà connecté
 *     /register → /search si déjà connecté
 *
 * COMMENT ÇA MARCHE :
 *   Firebase Auth stocke la session dans un cookie nommé
 *   "firebaseToken" ou dans localStorage. En middleware,
 *   on ne peut pas accéder à Firebase directement, donc on
 *   vérifie la présence du cookie de session Firebase.
 *
 *   Pour que ça fonctionne, il faut persister la session
 *   dans un cookie via AuthContext (voir commentaire en bas).
 * ============================================================
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Nom du cookie Firebase Auth (défini dans AuthContext)
const SESSION_COOKIE = "firebaseSession";

// ── Routes protégées — nécessitent d'être connecté ──
const PROTECTED_ROUTES = [
  "/dashboard",
  "/admin",
];

// ── Routes auth — redirigent si déjà connecté ──
const AUTH_ROUTES = [
  "/login",
  "/register",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Récupère le cookie de session Firebase
  const session = request.cookies.get(SESSION_COOKIE)?.value;
  const isLoggedIn = !!session;

  // ── 1. Routes protégées : redirige vers /login si non connecté ──
  // Inclut l'agenda médecin (/doctor/<id>/doctorAgenda) qui est sous
  // /doctor (public) mais ne doit pas être accessible sans connexion.
  // La vérification de PROPRIÉTÉ (bon médecin) est faite par DoctorRoute.
  const isDoctorSpace = /^\/doctor\/[^/]+\/doctorAgenda/.test(pathname);
  const isProtected =
    isDoctorSpace ||
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !isLoggedIn) {
    // Garde l'URL d'origine en paramètre pour y revenir après login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Routes auth : redirige vers /search si déjà connecté ──
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/search", request.url));
  }

  // ── 3. Toutes les autres routes : laisse passer ──
  return NextResponse.next();
}

// ── Configuration du matcher ──
// Le middleware s'applique uniquement sur ces chemins
// (exclut les fichiers statiques, _next, api, etc.)
export const config = {
  matcher: [
    /*
     * Applique le middleware sur toutes les routes SAUF :
     * - _next/static  → fichiers statiques Next.js
     * - _next/image   → optimisation images
     * - favicon.ico   → favicon
     * - api/          → routes API
     * - fichiers avec extensions (.png, .jpg, .svg...)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\..*).+)",
  ],
};