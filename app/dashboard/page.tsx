"use client";
import { Header } from "@/components/header";

export default function Page() {
  return (
    <div className="flex flex-col">
      <Header />
      <div className="h-24 md:h-32" />
      <main className="container mx-auto px-6">
        <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
      </main>
    </div>
  );
}
