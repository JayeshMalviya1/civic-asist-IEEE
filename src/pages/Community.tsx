
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MapPin, 
  ThumbsUp, 
  MessageCircle, 
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';

const Community = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const savedComplaints = localStorage.getItem('civicComplaints');
    if (savedComplaints) {
      setComplaints(JSON.parse(savedComplaints));
    }
  }, []);

  const mockCommunityPosts = [
    {
      id: 1,
      title: "Road maintenance needed on Main Street",
      category: "Roads",
      location: "Downtown Area",
      priority: "High",
      likes: 45,
      comments: 12,
      status: "In Progress",
      author: "Anonymous Citizen",
      timestamp: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      title: "Street lights not working in residential area",
      category: "Electricity",
      location: "Residential Zone B",
      priority: "Medium",
      likes: 23,
      comments: 8,
      status: "Pending",
      author: "Community Member",
      timestamp: "2024-01-14T15:45:00Z"
    },
    {
      id: 3,
      title: "Water supply issues in apartment complex",
      category: "Water",
      location: "Central District",
      priority: "High",
      likes: 67,
      comments: 19,
      status: "Resolved",
      author: "Local Resident",
      timestamp: "2024-01-13T09:15:00Z"
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Community Hub
          </h1>
          <p className="text-gray-600">Connect with your community and track local issues</p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardContent className="p-6 text-center">
              <Users className="mx-auto text-blue-600 mb-4" size={32} />
              <h3 className="text-2xl font-bold text-gray-900">1,247</h3>
              <p className="text-gray-600">Active Citizens</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="mx-auto text-green-600 mb-4" size={32} />
              <h3 className="text-2xl font-bold text-gray-900">89%</h3>
              <p className="text-gray-600">Resolution Rate</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border-0">
            <CardContent className="p-6 text-center">
              <MessageCircle className="mx-auto text-purple-600 mb-4" size={32} />
              <h3 className="text-2xl font-bold text-gray-900">342</h3>
              <p className="text-gray-600">Community Discussions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Filter by:</span>
          </div>
          {['all', 'pending', 'in-progress', 'resolved'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className={filter === filterType ? "bg-gradient-to-r from-blue-600 to-purple-600" : ""}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1).replace('-', ' ')}
            </Button>
          ))}
        </div>

        {/* Community Posts */}
        <div className="space-y-6">
          {mockCommunityPosts.map((post) => (
            <Card key={post.id} className="bg-white/70 backdrop-blur-sm border-0 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(post.priority)}`}></div>
                      <Badge variant="secondary" className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {post.location}
                      </span>
                      <span>by {post.author}</span>
                      <span>{new Date(post.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <ThumbsUp size={16} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <MessageCircle size={16} />
                      <span>{post.comments}</span>
                    </button>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Community;
