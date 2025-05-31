import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComplaintManagement } from './ComplaintManagement';
import { UserManagement } from './UserManagement';
import { SystemSettings } from './SystemSettings';
import { AdminStats } from './AdminStats';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            Manage complaints, users, and system settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="complaints">Complaints</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <AdminStats />
            </TabsContent>
            <TabsContent value="complaints" className="mt-6">
              <ComplaintManagement />
            </TabsContent>
            <TabsContent value="users" className="mt-6">
              <UserManagement />
            </TabsContent>
            <TabsContent value="settings" className="mt-6">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 