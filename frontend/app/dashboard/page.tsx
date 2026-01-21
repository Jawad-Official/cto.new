'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { workspacesApi, issuesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [workspacesRes, issuesRes] = await Promise.all([
        workspacesApi.getAll(),
        issuesApi.getAll({}),
      ]);

      setWorkspaces(workspacesRes.data);
      setIssues(issuesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Linear Clone</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.name}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <section>
            <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Here's an overview of your workspaces and issues.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{workspaces.length}</CardTitle>
                <CardDescription>Workspaces</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{issues.length}</CardTitle>
                <CardDescription>Total Issues</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  {issues.filter((i) => i.status === 'IN_PROGRESS').length}
                </CardTitle>
                <CardDescription>In Progress</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <section>
            <h3 className="text-2xl font-bold mb-4">Your Workspaces</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace) => (
                <Card key={workspace.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{workspace.name}</CardTitle>
                    <CardDescription>
                      {workspace.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/workspace/${workspace.id}`)}
                    >
                      Open Workspace
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {workspaces.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>No workspaces yet</CardTitle>
                    <CardDescription>
                      Create your first workspace to get started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Create Workspace</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold mb-4">Recent Issues</h3>
            <div className="space-y-2">
              {issues.slice(0, 10).map((issue) => (
                <Card key={issue.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {issue.project?.key}-{issue.number}: {issue.title}
                      </CardTitle>
                      <span className={`px-2 py-1 rounded text-xs ${
                        issue.status === 'DONE' ? 'bg-green-100 text-green-700' :
                        issue.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                    <CardDescription>
                      {issue.assignee?.name || 'Unassigned'}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
              {issues.length === 0 && (
                <Card>
                  <CardHeader>
                    <CardDescription>No issues found</CardDescription>
                  </CardHeader>
                </Card>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
