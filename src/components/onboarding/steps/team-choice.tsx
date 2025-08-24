// /components/onboarding/steps/team-choice.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, User } from 'lucide-react';

interface TeamChoiceProps {
  setTeamAction: (action: 'create' | 'join') => void; 
  onNext: () => void;
}

export function TeamChoice({ setTeamAction, onNext }: TeamChoiceProps) {
  const handleChoice = (choice: 'create' | 'join') => {
    setTeamAction(choice);
    onNext();
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Team Setup</h2>
          <p className="text-gray-600">Would you like to create a new team or join an existing one?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card
            className="cursor-pointer transition-all hover:shadow-md border-2 border-gray-200 hover:border-primary"
            onClick={() => handleChoice('create')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create a Team</h3>
              <p className="text-gray-600 text-sm">Start a new team and invite players</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-all hover:shadow-md border-2 border-gray-200 hover:border-primary"
            onClick={() => handleChoice('join')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Join a Team</h3>
              <p className="text-gray-600 text-sm">Enter a team code to join</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}