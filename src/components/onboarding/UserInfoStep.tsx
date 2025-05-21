
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User } from '@/types/User';

interface UserInfoStepProps {
  user: User;
  setUser: (user: User) => void;
}

const UserInfoStep: React.FC<UserInfoStepProps> = ({ user, setUser }) => {
  return (
    <div>
      <h2 className="text-xl font-heading mb-4">Getting Started</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input 
            id="name" 
            placeholder="Enter your name" 
            value={user.name} 
            onChange={(e) => setUser({...user, name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email" 
            value={user.email} 
            onChange={(e) => setUser({...user, email: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code (for local resources)</Label>
          <Input 
            id="zipCode" 
            placeholder="Enter your ZIP code" 
            value={user.zipCode || ''} 
            onChange={(e) => setUser({...user, zipCode: e.target.value})}
          />
          <p className="text-xs text-muted-foreground">
            We'll use this to connect you with relevant federal, state, county and local resources
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserInfoStep;
