import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export const ServerTime: React.FC = () => {
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServerTime = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('get-server-time');
      
      if (functionError) {
        throw functionError;
      }

      if (data && data.serverTime) {
        setServerTime(new Date(data.serverTime).toLocaleString());
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(errorMessage);
      setServerTime(null);
      console.error('Failed to fetch server time:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServerTime();
  }, [fetchServerTime]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Server Time</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <p>Loading server time...</p>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && serverTime && (
          <div className="text-center p-4">
            <p className="text-2xl font-semibold">{serverTime}</p>
          </div>
        )}
        <Button onClick={fetchServerTime} disabled={isLoading} className="w-full mt-4">
          Refresh Time
        </Button>
      </CardContent>
    </Card>
  );
};
