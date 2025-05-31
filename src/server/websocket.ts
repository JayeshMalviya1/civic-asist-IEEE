import { Server } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';

interface Client {
  ws: WebSocket;
  preferences: {
    categories: string[];
    priorities: string[];
    locations: string[];
    notifyOnStatusChange: boolean;
    notifyOnNewComplaints: boolean;
  };
}

interface Complaint {
  id: string;
  category: string;
  priority: string;
  status: string;
  location?: string;
  timestamp: string;
}

class NotificationServer {
  private wss: Server;
  private clients: Map<WebSocket, Client>;

  constructor(port: number = 3001) {
    this.wss = new Server({ port });
    this.clients = new Map();

    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      console.log('New client connected');
      
      // Initialize client with empty preferences
      this.clients.set(ws, {
        ws,
        preferences: {
          categories: [],
          priorities: [],
          locations: [],
          notifyOnStatusChange: true,
          notifyOnNewComplaints: true
        }
      });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error handling message:', error);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    console.log(`WebSocket server is running on port ${port}`);
  }

  private handleMessage(ws: WebSocket, data: any): void {
    switch (data.type) {
      case 'subscribe':
        this.handleSubscription(ws, data.preferences);
        break;
      case 'unsubscribe':
        this.clients.delete(ws);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  private handleSubscription(ws: WebSocket, preferences: any): void {
    const client = this.clients.get(ws);
    if (client) {
      client.preferences = preferences;
      this.clients.set(ws, client);
      
      ws.send(JSON.stringify({
        type: 'subscribed',
        message: 'Successfully subscribed to notifications'
      }));
    }
  }

  public broadcastComplaint(complaint: Complaint): void {
    this.clients.forEach((client) => {
      const { preferences } = client;
      
      // Check if client should receive this notification
      const shouldNotify = this.shouldNotifyClient(preferences, complaint);
      
      if (shouldNotify) {
        try {
          client.ws.send(JSON.stringify({
            type: 'new_complaint',
            complaint
          }));
        } catch (error) {
          console.error('Error sending notification to client:', error);
          this.clients.delete(client.ws);
        }
      }
    });
  }

  public broadcastStatusUpdate(complaint: Complaint): void {
    this.clients.forEach((client) => {
      const { preferences } = client;
      
      if (preferences.notifyOnStatusChange) {
        try {
          client.ws.send(JSON.stringify({
            type: 'status_update',
            complaint
          }));
        } catch (error) {
          console.error('Error sending status update to client:', error);
          this.clients.delete(client.ws);
        }
      }
    });
  }

  private shouldNotifyClient(preferences: any, complaint: Complaint): boolean {
    if (!preferences.notifyOnNewComplaints) return false;

    // Check category filter
    if (preferences.categories.length > 0 &&
        !preferences.categories.includes(complaint.category)) {
      return false;
    }

    // Check priority filter
    if (preferences.priorities.length > 0 &&
        !preferences.priorities.includes(complaint.priority)) {
      return false;
    }

    // Check location filter
    if (preferences.locations.length > 0 && complaint.location &&
        !preferences.locations.includes(complaint.location)) {
      return false;
    }

    return true;
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public shutdown(): void {
    this.wss.close(() => {
      console.log('WebSocket server shut down');
    });
  }
}

// Create and export server instance
const notificationServer = new NotificationServer();
export default notificationServer;

// Example usage in API routes:
/*
import notificationServer from './websocket';

// When a new complaint is created
app.post('/api/complaints', async (req, res) => {
  try {
    const complaint = await createComplaint(req.body);
    
    // Broadcast to subscribed clients
    notificationServer.broadcastComplaint(complaint);
    
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// When a complaint status is updated
app.patch('/api/complaints/:id/status', async (req, res) => {
  try {
    const complaint = await updateComplaintStatus(req.params.id, req.body.status);
    
    // Broadcast status update
    notificationServer.broadcastStatusUpdate(complaint);
    
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});
*/ 