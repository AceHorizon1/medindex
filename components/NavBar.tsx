'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export function NavBar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const links = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search' },
    { href: '/compare', label: 'Compare' },
    { href: '/advisor', label: 'AI Advisor' }
  ];

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          MedIndex
        </Link>
        <div className="flex items-center gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors hover:text-primary ${
                pathname === link.href ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <Link href="/auth">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

