
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { LogOut, User, Download, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Expense } from '@/types/User';
import LinkedAccountsSection from '@/components/profile/LinkedAccountsSection';
import ComprehensiveProfileForm from '@/components/profile/ComprehensiveProfileForm';
import { useSupabaseProfile } from '@/hooks/useSupabaseProfile';
import { useSupabaseCareRecipients } from '@/hooks/useSupabaseCareRecipients';
import { useSupabasePreferences } from '@/hooks/useSupabasePreferences';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, loading: profileLoading } = useSupabaseProfile();
  const { recipients, deleteRecipient } = useSupabaseCareRecipients();
  const { preferences, setPreference } = useSupabasePreferences();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  
  // UI state
  const [showComprehensiveForm, setShowComprehensiveForm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(preferences.preferences?.notifications ?? true);

  // Load expenses from Supabase
  const loadExpenses = async () => {
    if (!user) {
      setExpensesLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          synced_transactions!synced_transactions_expense_id_fkey(
            description,
            merchant_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform database format to local format
      const transformedExpenses: Expense[] = (data || []).map(expense => {
        // Use synced transaction description if available, otherwise fall back to expense description
        let description = expense.description || expense.notes || '';
        
        if (expense.synced_transaction_id && expense.synced_transactions) {
          const syncedTransaction = Array.isArray(expense.synced_transactions) 
            ? expense.synced_transactions[0] 
            : expense.synced_transactions;
          
          if (syncedTransaction) {
            description = syncedTransaction.merchant_name || syncedTransaction.description || description;
          }
        }
        
        return {
          ...expense,
          careRecipientId: expense.care_recipient_id || '',
          receiptUrl: expense.receipt_url,
          description,
          triage_status: (expense.triage_status as 'pending' | 'kept' | 'skipped') || 'pending',
        };
      });
      
      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setExpensesLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [user]);

  useEffect(() => {
    setNotificationsEnabled(preferences.preferences?.notifications ?? true);
  }, [preferences]);
  
  const handleSaveProfile = async (updatedProfile: any) => {
    try {
      await updateProfile(updatedProfile);
      setShowComprehensiveForm(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCareRecipient = async (id: string) => {
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

    try {
      await deleteRecipient(id);
      
      toast({
        title: "Person Removed",
        description: "The care recipient has been removed from your profile."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete care recipient. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const exportData = () => {
    // Create a data export object with user info and expenses
    const exportData = {
      userProfile: profile,
      expenses,
      careRecipients: recipients
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
    if (!profile) return 0;
    
    const fields = [
      profile.name,
      profile.email,
      profile.zip_code,
      profile.household_agi,
      profile.caregiving_for?.length
    ];
    
    const filledFields = fields.filter(field => 
      field !== undefined && field !== null && field !== '' && 
      (Array.isArray(field) ? field.length > 0 : true)
    ).length;
    
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    try {
      await setPreference('notifications', enabled);
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  };
  
  if (profileLoading || expensesLoading) {
    return (
      <Layout>
        <div className="container-padding py-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
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
          <ComprehensiveProfileForm user={profile ? { ...profile, isCaregiver: profile.is_caregiver || false } : null} onSave={handleSaveProfile} />
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
          <div data-tour="profile-overview">
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
                      <p><strong>Name:</strong> {profile?.name || 'Not provided'}</p>
                      <p><strong>Email:</strong> {profile?.email || 'Not provided'}</p>
                      <p><strong>ZIP Code:</strong> {profile?.zip_code || 'Not provided'}</p>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                      <p><strong>Caregiver:</strong> {profile?.is_caregiver ? 'Yes' : 'No'}</p>
                      <p><strong>Care Recipients:</strong> {recipients.length} person(s)</p>
                      <p><strong>Projected AGI:</strong> {profile?.household_agi ? `$${profile.household_agi.toLocaleString()}` : 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowComprehensiveForm(true)}
                    className="w-full mobile-button"
                    data-tour="profile-form"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {profileCompletion < 100 ? 'Complete Your Profile' : 'Update Profile Information'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Linked Financial Accounts Section */}
          <LinkedAccountsSection />

          {/* Care Recipients Management Section */}
          <Card data-tour="care-recipients">
            <CardHeader className="mobile-card-padding">
              <CardTitle className="mobile-text">People I Care For</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Manage profiles of people you are caring for</CardDescription>
            </CardHeader>
            <CardContent className="mobile-card-padding pt-0">
              {recipients.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recipients.map((recipient) => (
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
                data-tour="add-care-recipient"
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
                  onCheckedChange={handleNotificationToggle}
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
