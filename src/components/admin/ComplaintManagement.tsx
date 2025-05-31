import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Search, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface Complaint {
  id: string;
  originalText: string;
  translatedText: string;
  category: string;
  priority: string;
  status: string;
  timestamp: string;
  user?: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
}

export const ComplaintManagement = () => {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    startDate: '',
    endDate: '',
    searchTerm: '',
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/voice-complaints/search?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch complaints');
      
      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (complaintId: string, userId: string) => {
    try {
      const response = await fetch(`/api/voice-complaints/${complaintId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: userId }),
      });

      if (!response.ok) throw new Error('Failed to assign complaint');
      await fetchComplaints();
    } catch (error) {
      console.error('Error assigning complaint:', error);
    }
  };

  const handleStatusUpdate = async (complaintId: string, status: string) => {
    try {
      const response = await fetch(`/api/voice-complaints/${complaintId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      await fetchComplaints();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      Urgent: 'bg-red-500',
      High: 'bg-orange-500',
      Medium: 'bg-yellow-500',
      Low: 'bg-green-500',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      'in-progress': 'bg-blue-500',
      resolved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search complaints..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="w-64"
          />
          <Select
            value={filters.category}
            onValueChange={(value) => setFilters({ ...filters, category: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
              <SelectItem value="sanitation">Sanitation</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="noise">Noise</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.priority}
            onValueChange={(value) => setFilters({ ...filters, priority: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={fetchComplaints} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Text</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow key={complaint.id}>
              <TableCell className="font-mono">{complaint.id.slice(0, 8)}</TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <p className="truncate">{complaint.originalText}</p>
                  {complaint.translatedText !== complaint.originalText && (
                    <p className="text-sm text-gray-500 truncate">
                      {complaint.translatedText}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{complaint.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={getPriorityColor(complaint.priority)}>
                  {complaint.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(complaint.status)}>
                  {complaint.status}
                </Badge>
              </TableCell>
              <TableCell>
                {complaint.user ? (
                  <div>
                    <p className="font-medium">{complaint.user.name}</p>
                    <p className="text-sm text-gray-500">{complaint.user.email}</p>
                  </div>
                ) : (
                  <span className="text-gray-500">Anonymous</span>
                )}
              </TableCell>
              <TableCell>
                {complaint.assignedTo ? (
                  <div>
                    <p className="font-medium">{complaint.assignedTo.name}</p>
                    <p className="text-sm text-gray-500">{complaint.assignedTo.email}</p>
                  </div>
                ) : (
                  <span className="text-gray-500">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(complaint.timestamp), 'PPp')}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/complaints/${complaint.id}`)}
                  >
                    View
                  </Button>
                  <Select
                    value={complaint.status}
                    onValueChange={(value) => handleStatusUpdate(complaint.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 