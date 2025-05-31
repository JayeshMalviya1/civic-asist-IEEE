
import { useState, useEffect } from 'react';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { ComplaintForm } from '@/components/ComplaintForm';
import { ComplaintList } from '@/components/ComplaintList';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Mic, FileText, List } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('record');
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const savedComplaints = localStorage.getItem('civicComplaints');
    if (savedComplaints) {
      setComplaints(JSON.parse(savedComplaints));
    }
  }, []);

  const addComplaint = (complaint) => {
    const newComplaints = [...complaints, { ...complaint, id: Date.now(), timestamp: new Date().toISOString() }];
    setComplaints(newComplaints);
    localStorage.setItem('civicComplaints', JSON.stringify(newComplaints));
  };

  const tabs = [
    { id: 'record', label: 'Record', icon: Mic },
    { id: 'form', label: 'Type', icon: FileText },
    { id: 'list', label: `History (${complaints.length})`, icon: List }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Enhanced Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/70 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-white/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline font-medium">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 md:p-12">
          {activeTab === 'record' && (
            <VoiceRecorder onComplaintSubmit={addComplaint} />
          )}
          
          {activeTab === 'form' && (
            <ComplaintForm onComplaintSubmit={addComplaint} />
          )}
          
          {activeTab === 'list' && (
            <ComplaintList complaints={complaints} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
