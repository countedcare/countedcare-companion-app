
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface GoogleMapsAPIConfigProps {
  onApiKeySaved: (apiKey: string) => void;
  currentApiKey?: string;
}

const GoogleMapsAPIConfig: React.FC<GoogleMapsAPIConfigProps> = ({
  onApiKeySaved,
  currentApiKey = ''
}) => {
  const defaultApiKey = 'AIzaSyBJB3wjcuzPWnBJS9J6vvTFQEc47agM_Ak';
  const [apiKey, setApiKey] = useState(currentApiKey || defaultApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isUsingDefault, setIsUsingDefault] = useState(currentApiKey === defaultApiKey || !currentApiKey);

  const handleSave = () => {
    if (apiKey.trim()) {
      onApiKeySaved(apiKey.trim());
      setIsUsingDefault(apiKey.trim() === defaultApiKey);
    }
  };

  const handleQuickSetup = () => {
    setApiKey(defaultApiKey);
    setIsUsingDefault(true);
    onApiKeySaved(defaultApiKey);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Google Maps API Configuration
          {isUsingDefault && <CheckCircle className="h-4 w-4 text-green-600" />}
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

        {isUsingDefault && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Using Default API Key</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Ready to use! Location autocomplete is now enabled for your expenses.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleQuickSetup} className="flex-1" variant={isUsingDefault ? "outline" : "default"}>
            {isUsingDefault ? "Using Default Key" : "Use Default API Key"}
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
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsUsingDefault(e.target.value === defaultApiKey);
              }}
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
          {showApiKey && apiKey && (
            <p className="text-xs text-muted-foreground">
              Current key: {apiKey.substring(0, 10)}...{apiKey.substring(apiKey.length - 4)}
            </p>
          )}
        </div>

        <Button onClick={handleSave} disabled={!apiKey.trim()} className="w-full">
          Save API Key
        </Button>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsAPIConfig;
