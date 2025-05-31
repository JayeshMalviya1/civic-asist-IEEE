import { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, Globe, Filter, MapPin, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { notificationService } from '@/utils/notificationService';
import { useToast } from '@/hooks/use-toast';

export const NotificationSettings = () => {
  const [preferences, setPreferences] = useState(notificationService.getPreferences());
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const granted = await notificationService.requestNotificationPermission();
    setIsPermissionGranted(granted);
  };

  const handlePreferenceChange = (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    notificationService.updatePreferences(newPreferences);
    
    toast({
      title: 'Settings Updated',
      description: 'Your notification preferences have been saved.',
      variant: 'default'
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = preferences.categories.includes(category)
      ? preferences.categories.filter(c => c !== category)
      : [...preferences.categories, category];
    
    handlePreferenceChange('categories', newCategories);
  };

  const handlePriorityToggle = (priority: string) => {
    const newPriorities = preferences.priorities.includes(priority)
      ? preferences.priorities.filter(p => p !== priority)
      : [...preferences.priorities, priority];
    
    handlePreferenceChange('priorities', newPriorities);
  };

  const categories = [
    'Roads & Infrastructure',
    'Water Supply',
    'Electricity',
    'Sanitation',
    'Public Safety',
    'Noise Pollution'
  ];

  const priorities = ['Urgent', 'High', 'Medium', 'Low'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Customize how and when you want to receive updates about civic complaints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-500">General Settings</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">New Complaints</label>
                  <p className="text-sm text-gray-500">
                    Receive notifications when new complaints are filed
                  </p>
                </div>
                <Switch
                  checked={preferences.notifyOnNewComplaints}
                  onCheckedChange={(checked) => handlePreferenceChange('notifyOnNewComplaints', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Status Updates</label>
                  <p className="text-sm text-gray-500">
                    Get notified when complaint status changes
                  </p>
                </div>
                <Switch
                  checked={preferences.notifyOnStatusChange}
                  onCheckedChange={(checked) => handlePreferenceChange('notifyOnStatusChange', checked)}
                />
              </div>
            </div>
          </div>

          {/* Notification Channels */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-500">Notification Channels</h3>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Browser Notifications</label>
                    <p className="text-sm text-gray-500">
                      Push notifications in your browser
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.pushNotifications && isPermissionGranted}
                  onCheckedChange={async (checked) => {
                    if (checked && !isPermissionGranted) {
                      const granted = await notificationService.requestNotificationPermission();
                      setIsPermissionGranted(granted);
                      if (granted) {
                        handlePreferenceChange('pushNotifications', true);
                      }
                    } else {
                      handlePreferenceChange('pushNotifications', checked);
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Email Notifications</label>
                    <p className="text-sm text-gray-500">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                />
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-500">Category Filters</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={preferences.categories.includes(category) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Priority Filters */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-500">Priority Filters</h3>
            <div className="flex flex-wrap gap-2">
              {priorities.map((priority) => (
                <Badge
                  key={priority}
                  variant={preferences.priorities.includes(priority) ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    priority === 'Urgent' ? 'bg-red-500 hover:bg-red-600' :
                    priority === 'High' ? 'bg-orange-500 hover:bg-orange-600' :
                    priority === 'Medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                    'bg-green-500 hover:bg-green-600'
                  }`}
                  onClick={() => handlePriorityToggle(priority)}
                >
                  {priority === 'Urgent' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {priority}
                </Badge>
              ))}
            </div>
          </div>

          {/* Location Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-500">Location Settings</h3>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Select
                value={preferences.locations[0] || ''}
                onValueChange={(value) => handlePreferenceChange('locations', [value])}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="north">North Zone</SelectItem>
                  <SelectItem value="south">South Zone</SelectItem>
                  <SelectItem value="east">East Zone</SelectItem>
                  <SelectItem value="west">West Zone</SelectItem>
                  <SelectItem value="central">Central Zone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 