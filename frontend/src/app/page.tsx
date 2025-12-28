"use client";

import { Header } from "@/components/layout";
import { HeroSection } from "@/components/landing";

const HomePage = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
    </main>
  );
};

export default HomePage;
