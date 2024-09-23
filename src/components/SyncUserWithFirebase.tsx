'use client';
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import firebaseConfig from '@/app/firebase/config';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

const SyncUserWithFirebase = () => {
  const { getToken, userId } = useAuth();

  useEffect(() => {
    // Function to sign in with Firebase using the Clerk custom token
    const signInWithFirebase = async () => {
      try {
        // Get the custom token from Clerk
        const token = await getToken({ template: 'integration_firebase' });

        if (token) {
          // Sign in to Firebase using the custom token
          await signInWithCustomToken(firebaseAuth, token);
          console.log('Successfully signed in to Firebase');
        }
      } catch (error) {
        console.error('Error signing in to Firebase:', error);
      }
    };

    // If the user is signed in via Clerk, sign them into Firebase
    if (userId) {
      signInWithFirebase();
    }
  }, [getToken, userId]);

  return null; // This component does not render anything
};

export default SyncUserWithFirebase;
