'use client';

import { ReactNode } from 'react';
import { AuthProvider as AuthContextProvider } from '@/hooks/use-auth';

/**
 * Auth Provider component to be used in app layout
 * Provides authentication context to all child components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
