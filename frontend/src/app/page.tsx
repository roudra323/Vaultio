"use client";

import { Header } from "@/components/layout";
import { HeroSection } from "@/components/landing";

const HomePage = () => {
  return (
    <main className="bg-background min-h-screen">
      <Header />
      <HeroSection />
    </main>
  );
};

export default HomePage;
