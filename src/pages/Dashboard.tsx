import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Users,
  MapPin,
  Calendar,
  Filter,
  RefreshCcw,
  Brain,
  Target,
  Zap,
  Award
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [insights, setInsights] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    responseTime: 0,
    resolutionRate: 0,
    citizenSatisfaction: 0,
    impactScore: 0
  });

  // Simulated real-time data update with AI insights
  useEffect(() => {
    const fetchData = () => {
      const savedComplaints = localStorage.getItem('civicComplaints');
      if (savedComplaints) {
        const parsedComplaints = JSON.parse(savedComplaints);
        setComplaints(parsedComplaints);
        generateInsights(parsedComplaints);
        calculatePerformanceMetrics(parsedComplaints);
      }
      setLastUpdate(new Date());
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Generate AI-powered insights from complaint data
  const generateInsights = (complaintData: any[]) => {
    const totalComplaints = complaintData.length;
    if (totalComplaints === 0) return;

    // Calculate trends and patterns
    const categories: { [key: string]: number } = {};
    const priorities = { Urgent: 0, High: 0, Medium: 0, Low: 0 };
    const sentiments = { negative: 0, neutral: 0, positive: 0 };
    const locations: { [key: string]: number } = {};
    let totalImpact = 0;
    let totalUrgency = 0;

    complaintData.forEach(complaint => {
      // Category analysis
      categories[complaint.category] = (categories[complaint.category] || 0) + 1;
      
      // Priority distribution
      priorities[complaint.priority as keyof typeof priorities]++;
      
      // Sentiment tracking
      if (complaint.analysis) {
        sentiments[complaint.analysis.sentiment as keyof typeof sentiments]++;
        totalImpact += complaint.analysis.impact || 0;
        totalUrgency += complaint.analysis.urgency || 0;
      }
      
      // Location clustering
      if (complaint.location && complaint.location !== 'Not specified') {
        locations[complaint.location] = (locations[complaint.location] || 0) + 1;
      }
    });

    // Generate actionable insights
    const insights = {
      trends: {
        mostCommonCategory: Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0],
        highPriorityPercentage: ((priorities.Urgent + priorities.High) / totalComplaints * 100).toFixed(1),
        averageImpact: (totalImpact / totalComplaints).toFixed(1),
        sentimentRatio: (sentiments.positive / totalComplaints * 100).toFixed(1)
      },
      hotspots: Object.entries(locations)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([location, count]) => ({
          location,
          percentage: ((count as number) / totalComplaints * 100).toFixed(1)
        })),
      recommendations: [
        {
          title: "Resource Allocation",
          description: `Focus on ${Object.entries(categories).sort((a, b) => b[1] - a[1])[0][0]} issues as they represent the highest volume of complaints.`
        },
        {
          title: "Priority Areas",
          description: `${((priorities.Urgent / totalComplaints) * 100).toFixed(1)}% of complaints are urgent, requiring immediate attention.`
        },
        {
          title: "Community Impact",
          description: `Average complaint impact is ${(totalImpact / totalComplaints).toFixed(1)}/10, suggesting significant community concerns.`
        }
      ]
    };

    setInsights(insights);
  };

  // Calculate performance metrics
  const calculatePerformanceMetrics = (complaintData) => {
    const metrics = {
      responseTime: Math.random() * 24, // Simulated average response time in hours
      resolutionRate: Math.random() * 40 + 60, // Simulated resolution rate (60-100%)
      citizenSatisfaction: Math.random() * 30 + 70, // Simulated satisfaction score (70-100%)
      impactScore: Math.random() * 40 + 60 // Simulated impact score (60-100%)
    };
    setPerformanceMetrics(metrics);
  };

  // Filter complaints based on selected time period
  const getFilteredComplaints = () => {
    let filtered = [...complaints];
    
    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case 'day':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(c => new Date(c.timestamp) >= filterDate);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => c.category === categoryFilter);
    }

    return filtered;
  };

  const categories = ['Roads', 'Water', 'Electricity', 'Sanitation', 'Noise', 'Public Safety', 'Transportation'];
  
  // Generate trend data
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      complaints: Math.floor(Math.random() * 20) + 10,
      resolved: Math.floor(Math.random() * 15) + 5
    };
  });

  const stats = [
    {
      title: 'Total Complaints',
      value: getFilteredComplaints().length.toString(),
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
      description: 'Total number of complaints received'
    },
    {
      title: 'Pending Review',
      value: Math.floor(getFilteredComplaints().length * 0.4).toString(),
      icon: Clock,
      color: 'from-orange-500 to-red-500',
      change: '-5%',
      description: 'Complaints awaiting initial review'
    },
    {
      title: 'Resolved',
      value: Math.floor(getFilteredComplaints().length * 0.25).toString(),
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      change: '+18%',
      description: 'Successfully resolved complaints'
    },
    {
      title: 'High Priority',
      value: Math.floor(getFilteredComplaints().length * 0.15).toString(),
      icon: AlertTriangle,
      color: 'from-purple-500 to-pink-500',
      change: '+3%',
      description: 'Urgent complaints requiring immediate attention'
    }
  ];

  const categoryData = categories.map(category => ({
    name: category,
    total: Math.floor(Math.random() * 50) + 10,
    resolved: Math.floor(Math.random() * 30) + 5,
    color: '#3B82F6'
  }));

  const statusData = [
    { name: 'Pending', value: 40, color: '#F59E0B' },
    { name: 'In Progress', value: 35, color: '#3B82F6' },
    { name: 'Resolved', value: 25, color: '#10B981' },
  ];

  const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    complaints: Math.floor(Math.random() * 8) + 1,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Smart Civic Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
              <Button variant="ghost" size="sm" className="ml-2" onClick={() => setLastUpdate(new Date())}>
                <RefreshCcw size={14} />
              </Button>
            </p>
          </div>
          
          <div className="flex gap-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.keys(complaints.reduce((acc, complaint) => {
                  acc[complaint.category] = true;
                  return acc;
                }, {})).map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="text-blue-500" size={16} />
                Average Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {performanceMetrics.responseTime.toFixed(1)}h
              </div>
              <Progress value={Math.min(100, (24 - performanceMetrics.responseTime) * 4)} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="text-green-500" size={16} />
                Resolution Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {performanceMetrics.resolutionRate.toFixed(1)}%
              </div>
              <Progress value={performanceMetrics.resolutionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="text-purple-500" size={16} />
                Citizen Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {performanceMetrics.citizenSatisfaction.toFixed(1)}%
              </div>
              <Progress value={performanceMetrics.citizenSatisfaction} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="text-orange-500" size={16} />
                Community Impact Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {performanceMetrics.impactScore.toFixed(1)}%
              </div>
              <Progress value={performanceMetrics.impactScore} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        {insights && (
          <Card className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="text-purple-600" size={24} />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Real-time analysis and recommendations based on complaint patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Trend Analysis */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                    <TrendingUp className="w-[18px] h-[18px]" />
                    Key Trends
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      Most common category: <span className="font-medium">{insights.trends.mostCommonCategory}</span>
                    </p>
                    <p className="text-sm">
                      High priority issues: <span className="font-medium">{insights.trends.highPriorityPercentage}%</span>
                    </p>
                    <p className="text-sm">
                      Average community impact: <span className="font-medium">{insights.trends.averageImpact}/10</span>
                    </p>
                  </div>
                </div>

                {/* Hotspots */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-red-800 flex items-center gap-2">
                    <MapPin className="w-[18px] h-[18px]" />
                    Problem Hotspots
                  </h3>
                  <div className="space-y-2">
                    {insights.hotspots.map((hotspot, index) => (
                      <p key={index} className="text-sm">
                        {hotspot.location}: <span className="font-medium">{hotspot.percentage}%</span> of complaints
                      </p>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-green-800 flex items-center gap-2">
                    <Zap size={18} />
                    Action Items
                  </h3>
                  <div className="space-y-2">
                    {insights.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{rec.title}:</span>
                        <p className="text-gray-600">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <Icon size={16} className="text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last period
                  </p>
                  <CardDescription className="text-xs mt-2">{stat.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trend Analysis */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={20} />
                Complaint Trends
              </CardTitle>
              <CardDescription>Daily complaint submissions and resolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="complaints" stroke="#3B82F6" name="New Complaints" />
                  <Line type="monotone" dataKey="resolved" stroke="#10B981" name="Resolved" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="text-purple-600" size={20} />
                24-Hour Activity
              </CardTitle>
              <CardDescription>Complaint submissions by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="complaints" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Category and Status Distribution */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="text-blue-600" size={20} />
                Complaints by Category
              </CardTitle>
              <CardDescription>Distribution across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3B82F6" name="Total Complaints" />
                  <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="text-purple-600" size={20} />
                Status Distribution
              </CardTitle>
              <CardDescription>Current status of all complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-green-600" size={20} />
              Recent Community Activity
            </CardTitle>
            <CardDescription>Latest complaints and updates from the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getFilteredComplaints().slice(0, 5).map((complaint, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {complaint.category || 'General'} complaint submitted
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      {complaint.location && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin size={12} />
                          {complaint.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar size={12} />
                        {new Date(complaint.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
