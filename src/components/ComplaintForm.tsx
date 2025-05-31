import { useState } from 'react';
import { Camera, Upload, MapPin, AlertTriangle, Clock, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ComplaintFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export const ComplaintForm = ({ onSubmit, initialData }: ComplaintFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    priority: initialData?.priority || 'Medium',
    impactLevel: initialData?.impactLevel || 5,
    affectedPeople: initialData?.affectedPeople || '1-10',
    timeOfIncident: initialData?.timeOfIncident || '',
    duration: initialData?.duration || 'Just Started',
    isHazardous: initialData?.isHazardous || false,
    requiresImmediate: initialData?.requiresImmediate || false,
    previouslyReported: initialData?.previouslyReported || false,
    landmarks: initialData?.landmarks || '',
    contactPreference: initialData?.contactPreference || 'email',
    additionalNotes: initialData?.additionalNotes || '',
  });

  const categories = [
    { value: 'roads', label: 'Roads & Infrastructure', icon: '🛣️' },
    { value: 'water', label: 'Water Supply', icon: '💧' },
    { value: 'electricity', label: 'Electricity', icon: '⚡' },
    { value: 'sanitation', label: 'Sanitation', icon: '🗑️' },
    { value: 'noise', label: 'Noise Pollution', icon: '🔊' },
    { value: 'safety', label: 'Public Safety', icon: '🚨' },
    { value: 'other', label: 'Other', icon: '📝' }
  ];

  const priorities = [
    { value: 'Urgent', label: 'Urgent - Immediate action required', color: 'bg-red-500' },
    { value: 'High', label: 'High - Action required within 24 hours', color: 'bg-orange-500' },
    { value: 'Medium', label: 'Medium - Action required within a week', color: 'bg-yellow-500' },
    { value: 'Low', label: 'Low - Non-urgent issue', color: 'bg-green-500' }
  ];

  const durations = [
    'Just Started',
    'Few Hours',
    'Few Days',
    'More than a Week',
    'More than a Month',
    'Recurring Issue'
  ];

  const affectedPeopleRanges = [
    '1-10',
    '11-50',
    '51-100',
    '100-500',
    '500+',
    'Entire Community'
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images",
        variant: "destructive"
      });
      return;
    }

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Available",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      // Reverse geocoding using OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      
      const locationString = data.display_name;
      setLocation(locationString);
      setFormData(prev => ({ ...prev, location: locationString }));
      
      toast({
        title: "Location Added",
        description: "Your current location has been added to the complaint",
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Failed to get your current location",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create FormData for file upload
      const complaintData = new FormData();
      images.forEach((image, index) => {
        complaintData.append('images', image);
      });

      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        complaintData.append(key, value.toString());
      });

      // Add location if available
      if (location) {
        complaintData.append('location', location);
      }

      // Add timestamp
      complaintData.append('timestamp', new Date().toISOString());

      await onSubmit(complaintData);

      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been successfully registered",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your complaint",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide essential details about the civic issue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Brief title of the issue"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Detailed description of the issue..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center gap-2">
                        {category.icon} {category.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority Level</label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle>Location Details</CardTitle>
          <CardDescription>
            Help us locate the issue accurately
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Location details"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nearby Landmarks</label>
            <Input
              placeholder="Notable landmarks or reference points"
              value={formData.landmarks}
              onChange={(e) => setFormData(prev => ({ ...prev, landmarks: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Issue Details */}
      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
          <CardDescription>
            Provide more context about the problem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Impact Level</label>
            <div className="flex items-center gap-4">
              <Slider
                value={[formData.impactLevel]}
                onValueChange={([value]) => setFormData(prev => ({ ...prev, impactLevel: value }))}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8">{formData.impactLevel}/10</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">When did it start?</label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">People Affected</label>
              <Select
                value={formData.affectedPeople}
                onValueChange={(value) => setFormData(prev => ({ ...prev, affectedPeople: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {affectedPeopleRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Hazardous Condition</label>
                <p className="text-sm text-gray-500">Is this issue dangerous?</p>
              </div>
              <Switch
                checked={formData.isHazardous}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isHazardous: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Previously Reported</label>
                <p className="text-sm text-gray-500">Has this been reported before?</p>
              </div>
              <Switch
                checked={formData.previouslyReported}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, previouslyReported: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Evidence</CardTitle>
          <CardDescription>
            Upload photos or documents related to the issue (max 5 files)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
            {previewUrls.length < 5 && (
              <label className="border-2 border-dashed rounded-lg p-4 hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2">
                <Camera className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                />
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>
            Any other information that might be helpful
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Additional details, suggestions, or context..."
            value={formData.additionalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Submitting...
          </>
        ) : (
          'Submit Complaint'
        )}
      </Button>
    </form>
  );
};
