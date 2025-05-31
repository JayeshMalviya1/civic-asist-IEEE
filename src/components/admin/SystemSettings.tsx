import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';

interface Settings {
  maxFileSize: number;
  allowedFileTypes: string[];
  autoTranslation: boolean;
  defaultLanguage: string;
  priorityThresholds: {
    urgent: number;
    high: number;
    medium: number;
  };
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  retention: {
    audioFiles: number;
    transcripts: number;
  };
  aiSettings: {
    enhancedTranscription: boolean;
    contentAnalysis: boolean;
    sentimentAnalysis: boolean;
  };
}

export const SystemSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    maxFileSize: 10,
    allowedFileTypes: ['audio/wav', 'audio/mp3', 'audio/ogg'],
    autoTranslation: true,
    defaultLanguage: 'en',
    priorityThresholds: {
      urgent: 80,
      high: 60,
      medium: 40,
    },
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
    },
    retention: {
      audioFiles: 30,
      transcripts: 365,
    },
    aiSettings: {
      enhancedTranscription: true,
      contentAnalysis: true,
      sentimentAnalysis: true,
    },
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to update settings');
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>File Upload Settings</CardTitle>
          <CardDescription>
            Configure file upload limitations and supported formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Maximum File Size (MB)</Label>
            <Input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) =>
                setSettings({ ...settings, maxFileSize: Number(e.target.value) })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Allowed File Types</Label>
            <Input
              value={settings.allowedFileTypes.join(', ')}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  allowedFileTypes: e.target.value.split(',').map((t) => t.trim()),
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Translation Settings</CardTitle>
          <CardDescription>
            Configure automatic translation and language preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Auto Translation</Label>
            <Switch
              checked={settings.autoTranslation}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoTranslation: checked })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Default Language</Label>
            <Input
              value={settings.defaultLanguage}
              onChange={(e) =>
                setSettings({ ...settings, defaultLanguage: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Priority Thresholds</CardTitle>
          <CardDescription>
            Set thresholds for complaint priority levels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Urgent Threshold</Label>
            <Slider
              value={[settings.priorityThresholds.urgent]}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  priorityThresholds: {
                    ...settings.priorityThresholds,
                    urgent: value[0],
                  },
                })
              }
              max={100}
              step={1}
            />
          </div>
          <div className="space-y-4">
            <Label>High Priority Threshold</Label>
            <Slider
              value={[settings.priorityThresholds.high]}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  priorityThresholds: {
                    ...settings.priorityThresholds,
                    high: value[0],
                  },
                })
              }
              max={100}
              step={1}
            />
          </div>
          <div className="space-y-4">
            <Label>Medium Priority Threshold</Label>
            <Slider
              value={[settings.priorityThresholds.medium]}
              onValueChange={(value) =>
                setSettings({
                  ...settings,
                  priorityThresholds: {
                    ...settings.priorityThresholds,
                    medium: value[0],
                  },
                })
              }
              max={100}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure system-wide notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Email Notifications</Label>
            <Switch
              checked={settings.notificationSettings.email}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notificationSettings: {
                    ...settings.notificationSettings,
                    email: checked,
                  },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Push Notifications</Label>
            <Switch
              checked={settings.notificationSettings.push}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notificationSettings: {
                    ...settings.notificationSettings,
                    push: checked,
                  },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>SMS Notifications</Label>
            <Switch
              checked={settings.notificationSettings.sms}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notificationSettings: {
                    ...settings.notificationSettings,
                    sms: checked,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>
            Configure data retention periods (in days)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Audio Files Retention (days)</Label>
            <Input
              type="number"
              value={settings.retention.audioFiles}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  retention: {
                    ...settings.retention,
                    audioFiles: Number(e.target.value),
                  },
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>Transcripts Retention (days)</Label>
            <Input
              type="number"
              value={settings.retention.transcripts}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  retention: {
                    ...settings.retention,
                    transcripts: Number(e.target.value),
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
          <CardDescription>
            Configure AI-powered features and analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enhanced Transcription</Label>
            <Switch
              checked={settings.aiSettings.enhancedTranscription}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  aiSettings: {
                    ...settings.aiSettings,
                    enhancedTranscription: checked,
                  },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Content Analysis</Label>
            <Switch
              checked={settings.aiSettings.contentAnalysis}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  aiSettings: {
                    ...settings.aiSettings,
                    contentAnalysis: checked,
                  },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Sentiment Analysis</Label>
            <Switch
              checked={settings.aiSettings.sentimentAnalysis}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  aiSettings: {
                    ...settings.aiSettings,
                    sentimentAnalysis: checked,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}; 