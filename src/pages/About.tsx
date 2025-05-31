
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart, Mic, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">About Civic Assist</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Heart className="text-red-500" size={24} />
                <CardTitle>Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Civic Assist democratizes civic engagement by making complaint submission accessible to everyone, 
                regardless of literacy level, technical skills, or physical abilities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mic className="text-blue-500" size={24} />
                <CardTitle>Voice-First Design</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Our voice-first approach ensures that citizens can submit complaints naturally, 
                using just their voice without complex forms or technical barriers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="text-green-500" size={24} />
                <CardTitle>Inclusive Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Designed for elderly citizens, visually impaired users, and those with limited 
                digital literacy to participate in civic processes effortlessly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="text-purple-500" size={24} />
                <CardTitle>Privacy & Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Your complaints are stored locally on your device. We prioritize your privacy 
                and ensure your data remains secure and under your control.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Simple steps to submit your civic complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Speak Your Complaint</h3>
                <p className="text-sm text-gray-600">Use the voice recorder to describe your civic issue</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Auto-Categorization</h3>
                <p className="text-sm text-gray-600">We automatically categorize and prioritize your complaint</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Track Progress</h3>
                <p className="text-sm text-gray-600">View and manage all your submitted complaints</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;
