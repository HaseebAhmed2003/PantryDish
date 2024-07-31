'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <Card className="w-full max-w-lg p-6 shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Welcome to the Pantry Management System</h1>
          <p className="text-lg sm:text-xl mb-8">Organize your kitchen inventory with ease</p>
          <Button 
            onClick={() => router.push('/pantry')}
            className="px-6 py-3 text-lg hover:scale-105 transition duration-300"
          >
            Go to Pantry
          </Button>
        </div>
      </Card>
    </div>
  );
}