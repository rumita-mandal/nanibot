import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NaniBot — The Wisdom We Inherited',
  description: 'A digital archive of intergenerational household wisdom passed down through grandmothers and mothers, with evidence-aware AI.',
  keywords: ['NaniBot', 'Traditional Wisdom', 'Home Remedies', 'Grandmother Tips', 'Indian Household Hacks', 'RAG Chatbot'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col justify-between bg-parchment-50 font-sans text-charcoal">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
