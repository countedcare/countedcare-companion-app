
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, CAREGIVER_ROLES, EMPLOYMENT_STATUS_OPTIONS, TAX_FILING_STATUS_OPTIONS, 
         HEALTH_COVERAGE_OPTIONS, PRIMARY_CAREGIVING_EXPENSES, NOTIFICATION_PREFERENCES, US_STATES } from '@/types/User';
import { Info, DollarSign, MapPin, Users, Briefcase, FileText, Heart, Bell } from 'lucide-react';

interface ComprehensiveProfileFormProps {
  user: User;
  onSave: (updatedUser: User) => void;
}

const ComprehensiveProfileForm = ({ user, onSave }: ComprehensiveProfileFormProps) => {
  const [formData, setFormData] = useState<User>(user);
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { id: 'basic', title: 'Basic Information', icon: Info },
    { id: 'financial', title: 'Financial Information', icon: DollarSign },
    { id: 'location', title: 'Location & Resources', icon: MapPin },
    { id: 'caregiving', title: 'Caregiving Details', icon: Users },
    { id: 'employment', title: 'Employment & Benefits', icon: Briefcase },
    { id: 'tax', title: 'Tax Information', icon: FileText },
    { id: 'health', title: 'Health Coverage', icon: Heart },
    { id: 'preferences', title: 'Preferences', icon: Bell }
  ];

  const updateField = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: keyof User, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  const renderBasicSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Are you a caregiver? *</Label>
        <RadioGroup
          value={formData.isCaregiver ? "yes" : "no"}
          onValueChange={(value) => updateField('isCaregiver', value === "yes")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="caregiver-yes" />
            <Label htmlFor="caregiver-yes">Yes, I am a caregiver</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="caregiver-no" />
            <Label htmlFor="caregiver-no">No, I'm not currently a caregiver</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  const renderFinancialSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="householdAGI">Projected Annual Income (Optional)</Label>
        <Input
          id="householdAGI"
          type="number"
          value={formData.householdAGI || ''}
          onChange={(e) => updateField('householdAGI', parseFloat(e.target.value) || undefined)}
          placeholder="Enter your projected adjusted gross income"
        />
        <p className="text-sm text-muted-foreground">
          This helps us calculate your potential tax deduction threshold and find relevant financial assistance programs.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="numberOfDependents">Number of Dependents/Care Recipients</Label>
        <Input
          id="numberOfDependents"
          type="number"
          min="0"
          value={formData.numberOfDependents || ''}
          onChange={(e) => updateField('numberOfDependents', parseInt(e.target.value) || undefined)}
          placeholder="How many people do you care for?"
        />
      </div>
    </div>
  );

  const renderLocationSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Select value={formData.state || ''} onValueChange={(value) => updateField('state', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="county">County (Optional)</Label>
          <Input
            id="county"
            value={formData.county || ''}
            onChange={(e) => updateField('county', e.target.value)}
            placeholder="Your county"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="zipCode">ZIP Code</Label>
        <Input
          id="zipCode"
          value={formData.zipCode || ''}
          onChange={(e) => updateField('zipCode', e.target.value)}
          placeholder="Your ZIP code"
        />
        <p className="text-sm text-muted-foreground">
          We use this to find local caregiver resources, support groups, and assistance programs in your area.
        </p>
      </div>
    </div>
  );

  const renderCaregivingSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Your Caregiving Role (Select all that apply)</Label>
        <div className="grid grid-cols-1 gap-2">
          {CAREGIVER_ROLES.map(role => (
            <div key={role} className="flex items-center space-x-2">
              <Checkbox
                id={role}
                checked={(formData.caregiverRole || []).includes(role)}
                onCheckedChange={(checked) => updateArrayField('caregiverRole', role, checked as boolean)}
              />
              <Label htmlFor={role} className="text-sm">{role}</Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Primary Caregiving Expenses (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PRIMARY_CAREGIVING_EXPENSES.map(expense => (
            <div key={expense} className="flex items-center space-x-2">
              <Checkbox
                id={expense}
                checked={(formData.primaryCaregivingExpenses || []).includes(expense)}
                onCheckedChange={(checked) => updateArrayField('primaryCaregivingExpenses', expense, checked as boolean)}
              />
              <Label htmlFor={expense} className="text-sm">{expense}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEmploymentSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Employment Status</Label>
        <Select value={formData.employmentStatus || ''} onValueChange={(value) => updateField('employmentStatus', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your employment status" />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYMENT_STATUS_OPTIONS.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          This helps us identify potential employer benefits and assistance programs you may be eligible for.
        </p>
      </div>
    </div>
  );

  const renderTaxSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tax Filing Status</Label>
        <Select value={formData.taxFilingStatus || ''} onValueChange={(value) => updateField('taxFilingStatus', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your tax filing status" />
          </SelectTrigger>
          <SelectContent>
            {TAX_FILING_STATUS_OPTIONS.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          This helps us calculate your potential tax deductions and recommend appropriate tax strategies.
        </p>
      </div>
    </div>
  );

  const renderHealthSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Health Coverage Type (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {HEALTH_COVERAGE_OPTIONS.map(coverage => (
            <div key={coverage} className="flex items-center space-x-2">
              <Checkbox
                id={coverage}
                checked={(formData.healthCoverageType || []).includes(coverage)}
                onCheckedChange={(checked) => updateArrayField('healthCoverageType', coverage, checked as boolean)}
              />
              <Label htmlFor={coverage} className="text-sm">{coverage}</Label>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Understanding your coverage helps us identify potential out-of-pocket expenses and relevant assistance programs.
        </p>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Preferred Notification Methods (Select all that apply)</Label>
        <div className="grid grid-cols-1 gap-2">
          {NOTIFICATION_PREFERENCES.map(method => (
            <div key={method} className="flex items-center space-x-2">
              <Checkbox
                id={method}
                checked={(formData.preferredNotificationMethod || []).includes(method)}
                onCheckedChange={(checked) => updateArrayField('preferredNotificationMethod', method, checked as boolean)}
              />
              <Label htmlFor={method} className="text-sm">{method}</Label>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          We'll use these preferences to send you tax reminders, resource updates, and important caregiving information.
        </p>
      </div>
    </div>
  );

  const getCurrentSectionContent = () => {
    switch (activeSection) {
      case 0: return renderBasicSection();
      case 1: return renderFinancialSection();
      case 2: return renderLocationSection();
      case 3: return renderCaregivingSection();
      case 4: return renderEmploymentSection();
      case 5: return renderTaxSection();
      case 6: return renderHealthSection();
      case 7: return renderPreferencesSection();
      default: return renderBasicSection();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Help us personalize your experience and find the most relevant resources for your caregiving journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Section Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveSection(index)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{section.title}</span>
                </Button>
              );
            })}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Section {activeSection + 1} of {sections.length}: {sections[activeSection].title}
          </div>
        </div>

        {/* Current Section Content */}
        <div className="min-h-[400px]">
          {getCurrentSectionContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
            disabled={activeSection === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {activeSection < sections.length - 1 ? (
              <Button onClick={() => setActiveSection(activeSection + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSave} className="bg-primary">
                Save Profile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComprehensiveProfileForm;
