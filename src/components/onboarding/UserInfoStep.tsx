
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, US_STATES } from '@/types/User';
import { Info } from 'lucide-react';

interface UserInfoStepProps {
  user: User;
  setUser: (user: User) => void;
}

const UserInfoStep: React.FC<UserInfoStepProps> = ({ user, setUser }) => {
  return (
    <div>
      <h2 className="text-xl font-heading mb-2">Let's get to know you</h2>
      <p className="text-gray-600 mb-6 text-sm">
        We'll use this information to personalize your experience and help you find relevant resources.
      </p>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Your Name <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="name" 
            placeholder="Enter your full name" 
            value={user.name} 
            onChange={(e) => setUser({...user, name: e.target.value})}
            className={!user.name ? "border-red-200 focus:border-red-300" : ""}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="your@email.com" 
            value={user.email} 
            onChange={(e) => setUser({...user, email: e.target.value})}
            className={!user.email ? "border-red-200 focus:border-red-300" : ""}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium">State (Optional)</Label>
            <Select value={user.state || ''} onValueChange={(value) => setUser({...user, state: value})}>
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
            <Label htmlFor="zipCode" className="text-sm font-medium">ZIP Code (Optional)</Label>
            <Input 
              id="zipCode" 
              placeholder="12345" 
              value={user.zipCode || ''} 
              onChange={(e) => setUser({...user, zipCode: e.target.value})}
            />
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">
            Your location helps us connect you with local resources, support groups, and assistance programs in your area.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserInfoStep;
