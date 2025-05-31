import { toast } from '@/hooks/use-toast';

interface Complaint {
  id: string;
  category: string;
  priority: string;
  status: string;
  timestamp: string;
  location?: string;
}

interface NotificationPreferences {
  categories: string[];
  priorities: string[];
  locations: string[];
  notifyOnStatusChange: boolean;
  notifyOnNewComplaints: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private preferences: NotificationPreferences;
  private subscribers: Map<string, (complaint: Complaint) => void>;
  private socket: WebSocket | null;

  private constructor() {
    this.preferences = this.loadPreferences();
    this.subscribers = new Map();
    this.socket = null;
    this.initializeWebSocket();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private loadPreferences(): NotificationPreferences {
    const savedPrefs = localStorage.getItem('notificationPreferences');
    return savedPrefs ? JSON.parse(savedPrefs) : {
      categories: [],
      priorities: ['Urgent', 'High'],
      locations: [],
      notifyOnStatusChange: true,
      notifyOnNewComplaints: true,
      emailNotifications: false,
      pushNotifications: true
    };
  }

  private savePreferences(): void {
    localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
  }

  private initializeWebSocket(): void {
    // Replace with your actual WebSocket server URL
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.subscribeToUpdates();
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleIncomingUpdate(data);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.reconnect();
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed');
        this.reconnect();
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      setTimeout(() => this.initializeWebSocket(), 5000);
    }
  }

  private reconnect(): void {
    setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.initializeWebSocket();
    }, 5000);
  }

  private subscribeToUpdates(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'subscribe',
        preferences: this.preferences
      }));
    }
  }

  private handleIncomingUpdate(data: any): void {
    const { type, complaint } = data;

    switch (type) {
      case 'new_complaint':
        this.handleNewComplaint(complaint);
        break;
      case 'status_update':
        this.handleStatusUpdate(complaint);
        break;
      case 'priority_update':
        this.handlePriorityUpdate(complaint);
        break;
      default:
        console.warn('Unknown update type:', type);
    }

    // Notify subscribers
    this.subscribers.forEach(callback => callback(complaint));
  }

  private handleNewComplaint(complaint: Complaint): void {
    if (!this.preferences.notifyOnNewComplaints) return;

    if (
      this.preferences.categories.includes(complaint.category) ||
      this.preferences.priorities.includes(complaint.priority) ||
      (complaint.location && this.preferences.locations.includes(complaint.location))
    ) {
      this.showNotification(
        'New Complaint',
        `${complaint.category} complaint received from ${complaint.location || 'unknown location'}`,
        'default'
      );
    }
  }

  private handleStatusUpdate(complaint: Complaint): void {
    if (!this.preferences.notifyOnStatusChange) return;

    this.showNotification(
      'Status Update',
      `Complaint #${complaint.id} status changed to: ${complaint.status}`,
      'default'
    );
  }

  private handlePriorityUpdate(complaint: Complaint): void {
    if (this.preferences.priorities.includes(complaint.priority)) {
      this.showNotification(
        'Priority Update',
        `Complaint #${complaint.id} priority changed to: ${complaint.priority}`,
        complaint.priority === 'Urgent' ? 'destructive' : 'default'
      );
    }
  }

  private showNotification(
    title: string,
    message: string,
    type: 'default' | 'destructive' = 'default'
  ): void {
    // Show in-app notification
    toast({
      title,
      description: message,
      variant: type
    });

    // Show browser notification if enabled
    if (this.preferences.pushNotifications && 'Notification' in window) {
      this.showBrowserNotification(title, message);
    }

    // Send email notification if enabled
    if (this.preferences.emailNotifications) {
      this.sendEmailNotification(title, message);
    }
  }

  private async showBrowserNotification(title: string, message: string): Promise<void> {
    try {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/notification-icon.png'
        });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/notification-icon.png'
          });
        }
      }
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }

  private async sendEmailNotification(title: string, message: string): Promise<void> {
    // Implement email notification logic here
    // This could be an API call to your backend service
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email notification');
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  // Public methods for managing preferences and subscriptions
  public updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
    this.subscribeToUpdates();
  }

  public subscribe(id: string, callback: (complaint: Complaint) => void): void {
    this.subscribers.set(id, callback);
  }

  public unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
}

export const notificationService = NotificationService.getInstance(); 