'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clipboard, BarChart, Settings, ShoppingCart, LogIn } from 'lucide-react';
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";

const navItems = [
  { name: 'Dashboard', href: '/pantry', icon: Home },
  { name: 'Inventory', href: '/inventory', icon: Clipboard },
  // { name: 'Analytics', href: '/analytics', icon: BarChart },
  // { name: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const SideNav: React.FC = () => {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <nav className="w-64 bg-gray-100 h-screen p-4 flex flex-col">
      <div className="text-2xl font-bold mb-8">Pantry Manager</div>
      <ul className="flex-grow">
        {navItems.map((item) => (
          <li key={item.name} className="mb-4">
            <Link href={item.href}>
              <div
                className={`flex items-center p-2 rounded-md ${
                  pathname === item.href
                    ? 'bg-black text-white scale-105 transition duration-300'
                    : 'hover:bg-gray-200'
                }`}
              >
                <item.icon className="mr-2" size={20} />
                {item.name}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      
      <div className="mt-auto">
        {isSignedIn ? (
          <div className="flex items-center p-2 rounded-md hover:bg-gray-200">
            <UserButton afterSignOutUrl="/" />
            <span className="ml-2">Manage Account</span>
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="flex items-center w-full p-2 rounded-md hover:bg-gray-200">
              <LogIn className="mr-2" size={20} />
              <span>Sign In</span>
            </button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
};

export default SideNav;