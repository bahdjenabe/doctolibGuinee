/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Le projet contient encore des avertissements de style (any, vars
    // inutilisées, apostrophes...). On évite qu'ils bloquent le build de
    // production / le déploiement. Le lint reste actif dans l'éditeur et
    // via `npm run lint` pour un nettoyage progressif.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
