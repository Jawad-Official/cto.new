import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight">
            Linear Clone
          </h1>
          <p className="text-2xl text-muted-foreground">
            Project management powered by AI
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/register">Sign Up</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
            <p className="text-muted-foreground">
              Auto-generate issue descriptions, smart categorization, and semantic search
            </p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">Real-time</h3>
            <p className="text-muted-foreground">
              Collaborative editing with instant updates using WebSockets
            </p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">Full-featured</h3>
            <p className="text-muted-foreground">
              Issues, projects, cycles, teams, and all Linear features
            </p>
          </div>
        </div>

        <div className="mt-12 p-6 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">Demo Credentials</h3>
          <div className="space-y-1 text-sm">
            <p>Email: <code className="bg-background px-2 py-1 rounded">john@example.com</code></p>
            <p>Password: <code className="bg-background px-2 py-1 rounded">password123</code></p>
          </div>
        </div>
      </div>
    </main>
  );
}
