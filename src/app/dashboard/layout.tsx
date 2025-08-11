
import Header from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 mb-20 md:mb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
