
import { Calendar, MapPin, AlertTriangle, Mic, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ComplaintList = ({ complaints }) => {
  const { toast } = useToast();

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const deleteComplaint = (id) => {
    const updatedComplaints = complaints.filter(complaint => complaint.id !== id);
    localStorage.setItem('civicComplaints', JSON.stringify(updatedComplaints));
    toast({
      title: "Complaint Deleted",
      description: "The complaint has been removed from your list"
    });
    // Note: In a real app, you'd update the parent state here
    window.location.reload(); // Simple refresh for now
  };

  if (complaints.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Complaints Yet</h3>
        <p className="text-gray-600 mb-6">You haven't submitted any civic complaints yet.</p>
        <p className="text-sm text-gray-500">Use the "Record Complaint" or "Type Complaint" tabs to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Complaints</h2>
        <p className="text-gray-600">Track all your submitted civic complaints</p>
      </div>

      <div className="space-y-4">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="bg-gray-50 border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  {complaint.method === 'voice' ? (
                    <Mic size={20} className="text-blue-600" />
                  ) : (
                    <FileText size={20} className="text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{complaint.category || 'General Complaint'}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    {formatDate(complaint.timestamp)}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => deleteComplaint(complaint.id)}
                className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                aria-label="Delete complaint"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-gray-900 leading-relaxed">{complaint.originalText}</p>
              </div>

              {complaint.translatedText && (
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p className="text-sm font-medium text-blue-700 mb-1">Translation:</p>
                  <p className="text-blue-900">{complaint.translatedText}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                {complaint.location && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin size={16} />
                    {complaint.location}
                  </div>
                )}
                
                {complaint.priority && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded border ${getPriorityColor(complaint.priority)}`}>
                    <AlertTriangle size={16} />
                    {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
