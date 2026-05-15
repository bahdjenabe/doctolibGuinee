// ============================================================
// PAGE PRINCIPALE — src/app/page.tsx
// ============================================================
//
// Ce fichier est la page d'accueil (landing page).
// Il importe et assemble tous les composants dans l'ordre.
//
// Pour modifier une section, va dans le fichier correspondant :
//   - Navbar      → components/landing/Navbar.tsx
//   - Hero        → components/landing/Hero.tsx
//   - Stats       → components/landing/Stats.tsx
//   - HowItWorks  → components/landing/HowItWorks.tsx
//   - Specialties → components/landing/Specialties.tsx
//   - Testimonials→ components/landing/Testimonials.tsx
//   - ForDoctors  → components/landing/ForDoctors.tsx
//   - CallToAction→ components/landing/CallToAction.tsx
//   - Footer      → components/landing/Footer.tsx
// ============================================================

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import HowItWorks from "@/components/landing/HowItWorks";
import Specialties from "@/components/landing/Specialties";
import Testimonials from "@/components/landing/Testimonials";
import ForDoctors from "@/components/landing/ForDoctors";
import CallToAction from "@/components/landing/CallToAction";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Specialties />
      <Testimonials />
      <ForDoctors />
      <CallToAction />
      <Footer />
    </main>
  );
}
