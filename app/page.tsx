import { Footer } from "@/components/ui/footer";
import { Header } from "@/components/ui/header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex items-center justify-center"></main>
      <Footer />
    </div>
  );
}
