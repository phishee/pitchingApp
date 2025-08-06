// /components/onboarding/onboarding-flow.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Users, User, Shield, Check } from 'lucide-react';
import { useOnboarding } from '@/providers/onboarding-context';

// Import all step components
import { RoleSelection } from './steps/role-selection';
import { AthleteProfile } from './steps/athlete-profile';
import { CoachProfile } from './steps/coach-profile';
import { TeamChoice } from './steps/team-choice';
import { CreateTeam } from './steps/create-team';
import { JoinTeam } from './steps/join-team';
import { OrganizationSetup } from './steps/organization-setup';
import { ReviewStep } from './steps/review-step';

// Import layout components
import { OnboardingSidebar } from './onboarding-sidebar';
import { MobileProgressBar } from './mobile-progress-bar';

// Step type definition
type Step = {
  id: string;
  title: string;
  description: string;
  icon: any;
  component?: any;
};

// Get steps for role function
const getStepsForRole = (role: string, isAdmin: boolean): Step[] => {
  if (isAdmin) {
    return [
      { id: 'role', title: 'Role Selection', description: 'Choose your role', icon: Shield },
      { id: 'organization', title: 'Create Organization', description: 'Set up your organization', icon: Shield },
      { id: 'review', title: 'Review & Finish', description: 'You\'re all set!', icon: Check },
    ];
  }
  
  switch (role) {
    case 'athlete':
      return [
        { id: 'role', title: 'Role Selection', description: 'Choose your role', icon: User },
        { id: 'profile', title: 'Athlete Profile', description: 'Complete your profile', icon: User },
        { id: 'team', title: 'Join Team', description: 'Join your team', icon: Users },
        { id: 'review', title: 'Review & Finish', description: 'You\'re all set!', icon: Check },
      ];
    case 'coach':
      return [
        { id: 'role', title: 'Role Selection', description: 'Choose your role', icon: Users },
        { id: 'profile', title: 'Coach Profile', description: 'Your coaching info', icon: Users },
        { id: 'team-choice', title: 'Team Setup', description: 'Set up your team', icon: Users },
        { id: 'review', title: 'Review & Finish', description: 'You\'re all set!', icon: Check },
      ];
    default:
      return [
        { id: 'role', title: 'Role Selection', description: 'Choose your role', icon: User },
      ];
  }
};

// Main Onboarding Component
export default function OnboardingFlow() {
  const {
    userData,
    setUserData,
    organizationData,
    setOrganizationData,
    teamData,
    setTeamData,
    teamMemberData,
    setTeamMemberData,
    joinRequestData,
    setJoinRequestData,
    handleFinish,
  } = useOnboarding();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>(getStepsForRole('', false).map(step => ({
    ...step,
    component: step.id === 'role' ? RoleSelection : undefined
  })));
  const [teamAction, setTeamAction] = useState(''); // 'create' or 'join'

  // Update steps when role changes
  useEffect(() => {
    const newSteps = getStepsForRole(userData?.role, userData?.isAdmin);
    
    // Add dynamic steps based on team action for coaches
    if (userData?.role === 'coach' && teamAction) {
      const reviewIndex = newSteps.findIndex(step => step.id === 'review');
      const teamStep = teamAction === 'create' 
        ? { id: 'create-team', title: 'Create Team', description: 'Set up your team', icon: Users, component: CreateTeam }
        : { id: 'join-team', title: 'Join Team', description: 'Join existing team', icon: Users, component: JoinTeam };
      
      newSteps.splice(reviewIndex, 0, teamStep);
    }
    
    // Attach components to steps
    newSteps.forEach(step => {
      switch(step.id) {
        case 'role':
          step.component = RoleSelection;
          break;
        case 'profile':
          step.component = userData?.role === 'athlete' ? AthleteProfile : CoachProfile;
          break;
        case 'team':
          step.component = JoinTeam;
          break;
        case 'team-choice':
          step.component = TeamChoice;
          break;
        case 'organization':
          step.component = OrganizationSetup;
          break;
        case 'review':
          step.component = ReviewStep;
          break;
      }
    });
    
    setSteps(newSteps);
  }, [userData?.role, userData?.isAdmin, teamAction]);

  const CurrentStepComponent = steps[currentStepIndex]?.component;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const showWelcomeSidebar = currentStepIndex === 0; // Show welcome on role selection

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleStepComplete = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      handleNext();
    }
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block h-full">
        <OnboardingSidebar 
          steps={steps} 
          currentStepIndex={currentStepIndex} 
          userData={userData}
          showWelcome={showWelcomeSidebar}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Mobile Progress Bar - Visible only on mobile */}
            <div className="lg:hidden mb-6">
              <MobileProgressBar steps={steps} currentStepIndex={currentStepIndex} />
            </div>

            {/* Step Content */}
            <div className="flex-1 bg-white rounded-lg shadow-lg p-6 lg:p-8 overflow-hidden">
              {CurrentStepComponent && (
                <CurrentStepComponent
                  userData={userData}
                  setUserData={setUserData}
                  organizationData={organizationData}
                  setOrganizationData={setOrganizationData}
                  teamData={teamData}
                  setTeamData={setTeamData}
                  teamMemberData={teamMemberData}
                  setTeamMemberData={setTeamMemberData}
                  joinRequestData={joinRequestData}
                  setJoinRequestData={setJoinRequestData}
                  teamAction={teamAction}
                  setTeamAction={setTeamAction}
                  onNext={handleNext}
                />
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isFirstStep}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              
              <Button
                onClick={handleStepComplete}
                className="flex items-center gap-2"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}