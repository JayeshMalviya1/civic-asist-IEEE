
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [voiceTimeout, setVoiceTimeout] = useState('30');
  const { toast } = useToast();

  const handleSave = () => {
    const settings = {
      autoTranslate,
      defaultLanguage,
      voiceTimeout: parseInt(voiceTimeout)
    };
    localStorage.setItem('civicAssistSettings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <SettingsIcon size={24} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice Recording</CardTitle>
              <CardDescription>Configure your voice recording preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-translate">Auto-translate complaints</Label>
                <Switch
                  id="auto-translate"
                  checked={autoTranslate}
                  onCheckedChange={setAutoTranslate}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Default Language</Label>
                <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Voice Recording Timeout (seconds)</Label>
                <Select value={voiceTimeout} onValueChange={setVoiceTimeout}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
