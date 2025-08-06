import React, { useState } from 'react';
import { Database, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';

interface SupabaseConnectButtonProps {
  onConnect?: () => void;
  className?: string;
}

export const SupabaseConnectButton: React.FC<SupabaseConnectButtonProps> = ({
  onConnect,
  className = ''
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      toast.success('Successfully connected to Supabase');
      onConnect?.();
    } catch (error) {
      toast.error('Failed to connect to Supabase');
      console.error('Supabase connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast.info('Disconnected from Supabase');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <CardTitle className="text-lg">Supabase Connection</CardTitle>
          </div>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        <CardDescription>
          Connect to Supabase backend services for real-time data synchronization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isConnected ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Link className="h-4 w-4" />
                <span>Connection established</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                className="w-full"
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Connect to Supabase
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectButton;


