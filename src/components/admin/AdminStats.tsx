import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';

interface Stats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  categoryStats: Array<{
    category: string;
    _count: number;
  }>;
  priorityStats: Array<{
    priority: string;
    _count: number;
  }>;
}

export const AdminStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/voice-complaints/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const resolutionRate = Math.round(
    (stats.resolvedComplaints / stats.totalComplaints) * 100
  );

  const categoryData = stats.categoryStats.map((stat) => ({
    name: stat.category,
    count: stat._count,
  }));

  const priorityData = stats.priorityStats.map((stat) => ({
    name: stat.priority,
    count: stat._count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComplaints}</div>
            <p className="text-xs text-muted-foreground">
              All time complaints received
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingComplaints}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting resolution
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolutionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Overall resolution rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaint Analytics</CardTitle>
          <CardDescription>
            Breakdown of complaints by category and priority
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="category">By Category</TabsTrigger>
              <TabsTrigger value="priority">By Priority</TabsTrigger>
            </TabsList>
            <TabsContent value="category" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="priority" className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>
              Breakdown of complaints by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center">
                  <div className="w-1/2">
                    <p className="text-sm font-medium">{category.name}</p>
                  </div>
                  <div className="w-1/2">
                    <div className="flex items-center">
                      <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(category.count / stats.totalComplaints) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {category.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>
              Breakdown of complaints by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityData.map((priority) => (
                <div key={priority.name} className="flex items-center">
                  <div className="w-1/2">
                    <p className="text-sm font-medium">{priority.name}</p>
                  </div>
                  <div className="w-1/2">
                    <div className="flex items-center">
                      <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500"
                          style={{
                            width: `${(priority.count / stats.totalComplaints) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {priority.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 