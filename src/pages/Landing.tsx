import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Megaphone, 
  Mic, 
  Globe, 
  Shield, 
  Users, 
  Zap, 
  ArrowRight,
  Star,
  ChevronDown,
  Heart
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Mic,
      title: "Voice-First Technology",
      description: "Simply speak your complaint - no typing required",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Automatic translation to your preferred language",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "Your data stays secure and private on your device",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Instant Processing",
      description: "Real-time categorization and priority assignment",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Complaints Processed" },
    { number: "25+", label: "Languages Supported" },
    { number: "99.9%", label: "Uptime Reliability" },
    { number: "4.9★", label: "User Rating" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2.5 rounded-xl">
                <Megaphone className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Civic Assist
                </h1>
                <p className="text-xs text-muted-foreground">Voice for everyone</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-6">
              <ThemeToggle />
              <Link to="#features" className="text-foreground/80 hover:text-foreground transition-colors hidden md:block">Features</Link>
              <Link to="#about" className="text-foreground/80 hover:text-foreground transition-colors hidden md:block">About</Link>
              <Link to="/app">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Voice Matters
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Empower your community by making your voice heard. Submit and track civic complaints easily using voice or text.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
              <Link to="#learn-more">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-xl shadow-lg border border-border">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Megaphone className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voice-Enabled</h3>
              <p className="text-muted-foreground">Submit complaints using your voice, making it accessible for everyone regardless of literacy level.</p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-lg border border-border">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">Connect with your community and track the status of complaints in your area.</p>
            </div>
            <div className="bg-background p-6 rounded-xl shadow-lg border border-border">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">Your data is encrypted and protected, ensuring your privacy and security.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Heart className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              We believe in the power of community voices. Our mission is to make civic engagement accessible to everyone, 
              regardless of their background or abilities. By providing an easy-to-use platform for submitting and tracking 
              civic complaints, we aim to bridge the gap between citizens and local authorities.
            </p>
            <Link to="/about">
              <Button variant="outline" size="lg">
                Learn More About Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Megaphone className="text-white" size={16} />
              </div>
              <span className="text-sm text-muted-foreground">© 2024 Civic Assist. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-blue-600" size={24} />
      </div>
    </div>
  );
};

export default Landing;
