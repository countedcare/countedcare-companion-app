
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Eye, EyeOff } from 'lucide-react';

interface GoogleMapsAPIConfigProps {
  onApiKeySaved: (apiKey: string) => void;
  currentApiKey?: string;
}

const GoogleMapsAPIConfig: React.FC<GoogleMapsAPIConfigProps> = ({
  onApiKeySaved,
  currentApiKey = ''
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey || 'AIzaSyBJB3wjcuzPWnBJS9J6vvTFQEc47agM_Ak');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      onApiKeySaved(apiKey.trim());
    }
  };

  const handleQuickSetup = () => {
    const defaultApiKey = 'AIzaSyBJB3wjcuzPWnBJS9J6vvTFQEc47agM_Ak';
    setApiKey(defaultApiKey);
    onApiKeySaved(defaultApiKey);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Google Maps API Configuration
        </CardTitle>
        <CardDescription>
          Configure your Google Maps API key to enable location autocomplete for expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            You need a Google Maps API key with Places API enabled. 
            <a 
              href="https://console.cloud.google.com/apis/credentials" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 ml-2 text-primary hover:underline"
            >
              Get your API key here <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={handleQuickSetup} className="flex-1">
            Use Default API Key
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-key">Google Maps API Key</Label>
          <div className="relative">
            <Input
              id="api-key"
              type={showApiKey ? "text" : "password"}
              placeholder="Enter your Google Maps API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button onClick={handleSave} disabled={!apiKey.trim()} className="w-full">
          Save API Key
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsAPIConfig;
