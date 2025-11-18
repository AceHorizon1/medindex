import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function HomePage() {
  async function handleSearch(formData: FormData) {
    'use server';
    const query = formData.get('query') as string;
    if (query) {
      redirect(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Find Your Perfect Medical School
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Search, compare, and get AI-guided insights on every U.S. MD/DO medical school. Make
            informed decisions with comprehensive data and expert advice.
          </p>
        </div>

        <form action={handleSearch} className="max-w-2xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="query"
                type="search"
                placeholder="Search by school name or location..."
                className="pl-10"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">Search</Button>
          </div>
        </form>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-8 sm:pt-12 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Comprehensive Database</CardTitle>
              <CardDescription className="text-sm">
                Access detailed information on all accredited MD and DO programs in the United
                States
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/search">
                <Button variant="outline" className="w-full">
                  Browse Schools
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Side-by-Side Comparison</CardTitle>
              <CardDescription className="text-sm">
                Compare tuition, requirements, stats, and more across multiple schools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/compare">
                <Button variant="outline" className="w-full">
                  Compare Schools
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">AI-Powered Advisor</CardTitle>
              <CardDescription className="text-sm">
                Get personalized guidance from our AI advisor trained on medical school admissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/advisor">
                <Button variant="outline" className="w-full">
                  Chat with Advisor
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
