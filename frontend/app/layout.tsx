import './globals.css';
// Geist fonts removed; using system defaults
import Navbar from '@/components/layout/Navbar';
import { QueryProvider } from '@/app/providers';

export const metadata = {
  title: 'Lexis AI',
  description: 'Research Intelligence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-primary text-text">
        <QueryProvider>
          <Navbar />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
