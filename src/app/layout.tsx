import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SideNav from '@/components/sideNav';
import { ClerkProvider, SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import SyncUserWithFirebase from '@/components/SyncUserWithFirebase'; // Import the sync component
import { dark, neobrutalism } from '@clerk/themes';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pantry Management System',
  description: 'Organize your kitchen inventory with ease',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className={`${inter.className} h-full`}>
          <SignedOut>
            <div className="flex items-center justify-center min-h-screen">
              <SignIn />
            </div>
          </SignedOut>
          <SignedIn>
            <SyncUserWithFirebase /> {/* Sync with Firebase when signed in */}
            <div className="flex flex-col h-screen lg:flex-row">
              <div className="w-full lg:w-64 flex-shrink-0">
                <SideNav />
              </div>
              <main className="flex-grow p-4 overflow-y-auto lg:p-8">
                {children}
              </main>
            </div>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
