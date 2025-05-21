
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, User, Download } from 'lucide-react';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User as UserType, Expense } from '@/types/User';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useLocalStorage<UserType>('countedcare-user', {
    name: '',
    email: '',
    isCaregiver: true,
    onboardingComplete: false
  });
  const [expenses] = useLocalStorage<Expense[]>('countedcare-expenses', []);
  
  // Form state
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [isCaregiver, setIsCaregiver] = useState(user.isCaregiver);
  const [caregivingFor, setCaregivingFor] = useState(user.caregivingFor?.join(', ') || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const handleSaveProfile = () => {
    // Update user info in localStorage
    setUser({
      ...user,
      name,
      email,
      isCaregiver,
      caregivingFor: caregivingFor.split(',').map(item => item.trim()).filter(Boolean)
    });
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved."
    });
  };
  
  const handleLogout = () => {
    // Clear user data and navigate to onboarding
    setUser({
      name: '',
      email: '',
      isCaregiver: true,
      onboardingComplete: false
    });
    
    navigate('/');
  };
  
  const exportData = () => {
    // Create a data export object with user info and expenses
    const exportData = {
      userProfile: user,
      expenses
    };
    
    // Create downloadable JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileName = `countedcare-export-${new Date().toISOString().substring(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully."
    });
  };
  
  return (
    <Layout>
      <div className="container-padding py-6 pb-20">
        <h1 className="text-2xl font-heading mb-6">Profile</h1>
        
        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Caregiver Status</Label>
                <RadioGroup
                  value={isCaregiver ? "yes" : "no"}
                  onValueChange={(value) => setIsCaregiver(value === "yes")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="caregiver-yes" />
                    <Label htmlFor="caregiver-yes">I am a caregiver</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="caregiver-no" />
                    <Label htmlFor="caregiver-no">I am not a caregiver</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {isCaregiver && (
                <div className="space-y-2">
                  <Label htmlFor="caregivingFor">Who are you caring for?</Label>
                  <Input
                    id="caregivingFor"
                    value={caregivingFor}
                    onChange={(e) => setCaregivingFor(e.target.value)}
                    placeholder="e.g., Parent, Child, Spouse"
                  />
                  <p className="text-sm text-gray-500">Separate multiple relationships with commas</p>
                </div>
              )}
              
              <Button onClick={handleSaveProfile} className="w-full">
                Save Changes
              </Button>
            </CardContent>
          </Card>
          
          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your app settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="block">Notifications</Label>
                  <p className="text-sm text-gray-500">Receive reminders for tax deadlines</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Data & Privacy Section */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Manage your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-gray-600">
                  Export your data for tax filing or backup purposes
                </p>
                <Button 
                  variant="outline" 
                  onClick={exportData} 
                  className="flex items-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Sign Out */}
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center border-gray-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
