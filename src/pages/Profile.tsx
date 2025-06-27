
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, User, Download, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import useLocalStorage from '@/hooks/useLocalStorage';
import { User as UserType, CareRecipient, Expense } from '@/types/User';
import LinkedAccountsSection from '@/components/profile/LinkedAccountsSection';
import ComprehensiveProfileForm from '@/components/profile/ComprehensiveProfileForm';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [localUser, setLocalUser] = useLocalStorage<UserType>('countedcare-user', {
    id: '',
    name: '',
    email: '',
    isCaregiver: true,
    onboardingComplete: false
  });
  const [careRecipients, setCareRecipients] = useLocalStorage<CareRecipient[]>('countedcare-recipients', []);
  const [expenses] = useLocalStorage<Expense[]>('countedcare-expenses', []);
  
  // UI state
  const [showComprehensiveForm, setShowComprehensiveForm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const handleSaveProfile = (updatedUser: UserType) => {
    setLocalUser(updatedUser);
    setShowComprehensiveForm(false);
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully."
    });
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      // Clear local storage
      setLocalUser({
        id: '',
        name: '',
        email: '',
        isCaregiver: true,
        onboardingComplete: false
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCareRecipient = (id: string) => {
    // Check if there are any expenses linked to this care recipient
    const linkedExpenses = expenses.filter(expense => expense.careRecipientId === id);
    
    if (linkedExpenses.length > 0) {
      toast({
        title: "Cannot Delete",
        description: `This person has ${linkedExpenses.length} expense(s) linked to them. Please reassign or delete those expenses first.`,
        variant: "destructive"
      });
      return;
    }

    // If no linked expenses, proceed with deletion
    setCareRecipients(careRecipients.filter(recipient => recipient.id !== id));
    
    toast({
      title: "Person Removed",
      description: "The care recipient has been removed from your profile."
    });
  };
  
  const exportData = () => {
    // Create a data export object with user info and expenses
    const exportData = {
      userProfile: localUser,
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

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      localUser.name,
      localUser.email,
      localUser.state,
      localUser.zipCode,
      localUser.householdAGI,
      localUser.employmentStatus,
      localUser.taxFilingStatus,
      localUser.caregiverRole?.length,
      localUser.primaryCaregivingExpenses?.length,
      localUser.healthCoverageType?.length
    ];
    
    const filledFields = fields.filter(field => 
      field !== undefined && field !== null && field !== '' && 
      (Array.isArray(field) ? field.length > 0 : true)
    ).length;
    
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();
  
  if (showComprehensiveForm) {
    return (
      <Layout>
        <div className="container-padding py-3 sm:py-6 pb-20">
          <div className="mb-3 sm:mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowComprehensiveForm(false)}
              className="mb-3 sm:mb-4 mobile-button"
            >
              ← Back to Profile Overview
            </Button>
          </div>
          <ComprehensiveProfileForm user={localUser} onSave={handleSaveProfile} />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container-padding py-3 sm:py-6 pb-20">
        <h1 className="mobile-heading font-heading mb-4 sm:mb-6">Profile</h1>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Completion Card */}
          <Card>
            <CardHeader className="mobile-card-padding">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between space-y-1 sm:space-y-0">
                <span className="mobile-text font-medium">Profile Overview</span>
                <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                  {profileCompletion}% Complete
                </span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Complete your profile to unlock personalized tax insights and caregiver resources
              </CardDescription>
            </CardHeader>
            <CardContent className="mobile-card-padding pt-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="space-y-1 sm:space-y-2">
                    <p><strong>Name:</strong> {localUser.name || 'Not provided'}</p>
                    <p><strong>Email:</strong> {localUser.email || 'Not provided'}</p>
                    <p><strong>Location:</strong> {localUser.state && localUser.zipCode ? `${localUser.state}, ${localUser.zipCode}` : 'Not provided'}</p>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <p><strong>Caregiver Role:</strong> {localUser.caregiverRole?.length ? `${localUser.caregiverRole.length} role(s)` : 'Not specified'}</p>
                    <p><strong>Employment:</strong> {localUser.employmentStatus || 'Not specified'}</p>
                    <p><strong>Tax Status:</strong> {localUser.taxFilingStatus || 'Not specified'}</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowComprehensiveForm(true)}
                  className="w-full mobile-button"
                >
                  <User className="mr-2 h-4 w-4" />
                  {profileCompletion < 100 ? 'Complete Your Profile' : 'Update Profile Information'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Linked Financial Accounts Section */}
          <LinkedAccountsSection />

          {/* Care Recipients Management Section */}
          <Card>
            <CardHeader className="mobile-card-padding">
              <CardTitle className="mobile-text">People I Care For</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Manage profiles of people you are caring for</CardDescription>
            </CardHeader>
            <CardContent className="mobile-card-padding pt-0">
              {careRecipients.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {careRecipients.map((recipient) => (
                    <div 
                      key={recipient.id} 
                      className="flex items-center justify-between border rounded-md p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{recipient.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">{recipient.relationship}</p>
                      </div>
                      <div className="flex space-x-1 sm:space-x-2 ml-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => navigate(`/care-recipients/${recipient.id}`)}
                          className="h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleDeleteCareRecipient(recipient.id)}
                          className="h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <p className="text-xs sm:text-sm">You haven't added any care recipients yet.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="mobile-card-padding pt-0">
              <Button 
                onClick={() => navigate('/care-recipients/new')} 
                className="w-full mobile-button"
                variant="outline"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Someone
              </Button>
            </CardFooter>
          </Card>
          
          {/* Preferences Section */}
          <Card>
            <CardHeader className="mobile-card-padding">
              <CardTitle className="mobile-text">Preferences</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Manage your app settings</CardDescription>
            </CardHeader>
            <CardContent className="mobile-card-padding pt-0 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="notifications" className="block text-sm sm:text-base">Notifications</Label>
                  <p className="text-xs sm:text-sm text-gray-500">Receive reminders for tax deadlines</p>
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
            <CardHeader className="mobile-card-padding">
              <CardTitle className="mobile-text">Data & Privacy</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Manage your data</CardDescription>
            </CardHeader>
            <CardContent className="mobile-card-padding pt-0 space-y-3 sm:space-y-4">
              <div className="flex flex-col space-y-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  Export your data for tax filing or backup purposes
                </p>
                <Button 
                  variant="outline" 
                  onClick={exportData} 
                  className="flex items-center mobile-button"
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
            onClick={handleSignOut} 
            className="w-full flex items-center justify-center border-gray-300 mobile-button"
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
