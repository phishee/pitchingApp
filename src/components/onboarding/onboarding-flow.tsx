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
        { id: 'team', title: 'Join Team', description: 'Join your team', icon: Users }, // This is 'team', not 'join-team'
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
  const [steps, setSteps] = useState<Step[]>(getStepsForRole('', false));
  const [teamAction, setTeamAction] = useState(''); // 'create' or 'join'
  const [currentStepValid, setCurrentStepValid] = useState(false);

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
    
    // Reset current step if we're now on an invalid step
    if (currentStepIndex >= newSteps.length) {
      setCurrentStepIndex(newSteps.length - 1);
    }
  }, [userData?.role, userData?.isAdmin, teamAction, currentStepIndex]);

  // Reset validation when step changes
  useEffect(() => {
    setCurrentStepValid(false);
  }, [currentStepIndex]);

  const CurrentStepComponent = steps[currentStepIndex]?.component;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const showWelcomeSidebar = currentStepIndex === 0; // Show welcome on role selection

  const handleNext = () => {
    if (!isLastStep && currentStepValid) {
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
    } else if (currentStepValid) {
      handleNext();
    }
  };

  // Function to validate current step
  const validateCurrentStep = () => {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return false;

    let isValid = false;
    switch (currentStep.id) {
      case 'role':
        isValid = !!(userData?.role);
        break;
      case 'profile':
        if (userData?.role === 'athlete') {
          isValid = !!(userData?.position && userData?.dateOfBirth && userData?.throwHand);
        } else if (userData?.role === 'coach') {
          isValid = !!(userData?.phoneNumber); // ✅ Remove coachingExperience if it doesn't exist
        }
        break;
      case 'team-choice':
        isValid = !!teamAction;
        break;
      case 'create-team':
        isValid = !!(teamData?.name && teamData?.teamCode);
        break;
      case 'team':
        // This handles both join-team and team-choice scenarios
        if (userData?.role === 'athlete') {
          // For athletes, join step is optional - always valid
          isValid = true; // ✅ Make join step always valid for athletes
        } else if (userData?.role === 'coach') {
          // For coaches, check if team action is selected
          isValid = !!teamAction;
        }
        break;
      case 'join-team':
        // Join step is optional - always valid
        isValid = true; // ✅ Make join step always valid
        break;
      case 'organization':
        isValid = true;
        break;
      case 'review':
        isValid = true;
        break;
      default:
        isValid = false;
    }

    return isValid;
  };

  // Update validation when relevant data changes
  useEffect(() => {
    const isValid = validateCurrentStep();
    setCurrentStepValid(isValid);
  }, [userData, teamAction, currentStepIndex, joinRequestData, teamData]);

  // Force validation check when joinRequestData changes
  useEffect(() => {
    if (steps[currentStepIndex]?.id === 'team' && userData?.role === 'athlete') {
      const timer = setTimeout(() => {
        const isValid = validateCurrentStep();
        setCurrentStepValid(isValid);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [joinRequestData]);

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
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Progress Bar - Visible only on mobile */}
        <div className="lg:hidden p-4 bg-white border-b">
          <MobileProgressBar steps={steps} currentStepIndex={currentStepIndex} />
        </div>

        {/* Content Area with fixed height */}
        <div className="flex-1 p-4 lg:p-8 overflow-hidden">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Step Content - This will scroll if content is too tall */}
            <div className="flex-1 bg-white rounded-lg shadow-lg overflow-y-auto">
              <div className="p-6 lg:p-8 min-h-full flex flex-col justify-center">
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
            </div>

            {/* Navigation Buttons - Always visible at bottom */}
            <div className="flex justify-between pt-6 flex-shrink-0">
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
                disabled={!currentStepValid}
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