'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Clock, X, CheckCircle } from 'lucide-react';
import { teamApi } from '@/app/services-client/teamApi';
import { useUser } from '@/providers/user.context';

function PendingRequest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { pendingJoinRequest, setPendingJoinRequest } = useUser();

  const handleCancelRequest = async () => {
    try {
      if(pendingJoinRequest) {
        setIsLoading(true);
        await teamApi.deleteJoinRequest(pendingJoinRequest?._id, pendingJoinRequest?.teamId);
        setPendingJoinRequest(null);
        setIsLoading(false);
        setShowConfirmDialog(false);
      }
    } catch (error) {
      setError('Failed to cancel request');
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-yellow-600" />
        </div>
        <CardTitle className="text-xl font-semibold">
          Request Pending
        </CardTitle>
        <CardContent className="pt-4">
          <p className="text-gray-600 text-center mb-4">
            Your join request is waiting for approval from the team coach or admin
          </p>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 mr-2" />
              Request sent on {new Date(pendingJoinRequest?.requestedAt || new Date()).toLocaleDateString()}
            </div>
          </div>

          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center mb-4">
            <p className="text-sm text-gray-500">
              You'll be notified once the coach responds to your request
            </p>
          </div>

          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Cancel Request
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Join Request?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel your request to join this team? 
                  You'll need to submit a new request if you want to join later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Request</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleCancelRequest}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? 'Cancelling...' : 'Yes, Cancel Request'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </CardHeader>
    </Card>
  )
}

export default PendingRequest