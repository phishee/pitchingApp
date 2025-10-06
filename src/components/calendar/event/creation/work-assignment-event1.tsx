'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch, SwitchWrapper } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Calendar, 
  Clock, 
  Settings, 
  Target, 
  Plus, 
  X, 
  Check,
  ChevronDown,
  ChevronRight,
  User,
  Activity,
  Dumbbell,
  Search
} from 'lucide-react';
import { TeamMemberWithUser, Workout, WorkoutExercise, Exercise, Event } from '@/models';
import { workoutApi } from '@/app/services-client/workoutApi';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface WorkoutAssignmentData {
  selectedMembers: TeamMemberWithUser[];
  selectedWorkout: Workout | null;
  scheduleConfig: {
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
    numberOfWeeks: number;
    startDate: Date;
    defaultStartTime: string; // "14:00"
    defaultEndTime: string; // "16:00"
  };
  exercisePrescriptions: {
    [exerciseId: string]: {
      isPrescribed: boolean;
      prescribedMetrics: { [metricId: string]: any };
    };
  };
  sessionType: 'individual' | 'group' | 'team';
  notes: string;
}

export interface WorkoutAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMembers: TeamMemberWithUser[];
  availableMembers?: TeamMemberWithUser[]; // Make this optional
  onAddEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  organizationId?: string;
  teamId?: string;
  currentUserId?: string;
}

interface ExerciseMetricPrescription {
  exerciseId: string;
  exerciseName: string;
  isPrescribed: boolean;
  defaultMetrics: { [key: string]: any };
  prescribedMetrics: { [key: string]: any };
  exercise: Exercise;
}

// ===== MAIN COMPONENT =====

export function WorkoutAssignmentDialog({
  isOpen,
  onClose,
  selectedMembers,
  availableMembers = [], // Add default empty array
  onAddEvent,
  organizationId = 'org-123',
  teamId = 'team-456',
  currentUserId = 'current-user'
}: WorkoutAssignmentDialogProps) {
  const [assignmentData, setAssignmentData] = useState<WorkoutAssignmentData>({
    selectedMembers,
    selectedWorkout: null,
    scheduleConfig: {
      daysOfWeek: [],
      numberOfWeeks: 1,
      startDate: new Date(),
      defaultStartTime: '14:00',
      defaultEndTime: '16:00'
    },
    exercisePrescriptions: {},
    sessionType: 'individual',
    notes: ''
  });

  const [availableWorkouts, setAvailableWorkouts] = useState<Workout[]>([]);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [exercisePrescriptions, setExercisePrescriptions] = useState<ExerciseMetricPrescription[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Load workouts when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadWorkouts();
    }
  }, [isOpen]);

  // Update selected members when prop changes
  useEffect(() => {
    setAssignmentData(prev => ({
      ...prev,
      selectedMembers
    }));
  }, [selectedMembers]);

  // Load exercise prescriptions when workout is selected
  useEffect(() => {
    if (assignmentData.selectedWorkout) {
      loadExercisePrescriptions(assignmentData.selectedWorkout);
    }
  }, [assignmentData.selectedWorkout]);

  // Filter available members based on search and exclude already selected
  const filteredAvailableMembers = useMemo(() => {
    // Add null/undefined check
    if (!availableMembers || !Array.isArray(availableMembers)) {
      return [];
    }
    
    const selectedMemberIds = new Set(assignmentData.selectedMembers.map(member => member._id));
    
    return availableMembers
      .filter(member => {
        const isNotSelected = !selectedMemberIds.has(member._id);
        const matchesSearch = memberSearchQuery === '' || 
          (('user' in member && member.user?.name?.toLowerCase().includes(memberSearchQuery.toLowerCase())) ||
           ('user' in member && member.user?.email?.toLowerCase().includes(memberSearchQuery.toLowerCase())));
        return isNotSelected && matchesSearch;
      })
      .sort((a, b) => {
        const nameA = ('user' in a && a.user?.name) || '';
        const nameB = ('user' in b && b.user?.name) || '';
        return nameA.localeCompare(nameB);
      });
  }, [availableMembers, assignmentData.selectedMembers, memberSearchQuery]);

  const loadWorkouts = async () => {
    setIsLoadingWorkouts(true);
    try {
      const response = await workoutApi.getWorkouts({}, organizationId);
      setAvailableWorkouts(response.data);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setIsLoadingWorkouts(false);
    }
  };

  const loadExercisePrescriptions = async (workout: Workout) => {
    setIsLoadingExercises(true);
    try {
      const exerciseIds = workout.flow.exercises.map(ex => ex.exercise_id);
      const exercises = await Promise.all(
        exerciseIds.map(id => exerciseApi.getExerciseById(id))
      );

      const prescriptions: ExerciseMetricPrescription[] = exercises.map((exercise, index) => {
        const workoutExercise = workout.flow.exercises[index];
        return {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          isPrescribed: false,
          defaultMetrics: workoutExercise.default_Metrics,
          prescribedMetrics: { ...workoutExercise.default_Metrics },
          exercise
        };
      });

      setExercisePrescriptions(prescriptions);
      
      // Update assignment data with initial prescriptions
      const initialPrescriptions: WorkoutAssignmentData['exercisePrescriptions'] = {};
      prescriptions.forEach(prescription => {
        initialPrescriptions[prescription.exerciseId] = {
          isPrescribed: false,
          prescribedMetrics: { ...prescription.defaultMetrics }
        };
      });
      
      setAssignmentData(prev => ({
        ...prev,
        exercisePrescriptions: initialPrescriptions
      }));
    } catch (error) {
      console.error('Failed to load exercise prescriptions:', error);
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const handleWorkoutSelect = (workout: Workout) => {
    setAssignmentData(prev => ({
      ...prev,
      selectedWorkout: workout
    }));
  };

  const handleDayToggle = (dayIndex: number) => {
    setAssignmentData(prev => {
      const newDays = prev.scheduleConfig.daysOfWeek.includes(dayIndex)
        ? prev.scheduleConfig.daysOfWeek.filter(d => d !== dayIndex)
        : [...prev.scheduleConfig.daysOfWeek, dayIndex];
      
      return {
        ...prev,
        scheduleConfig: {
          ...prev.scheduleConfig,
          daysOfWeek: newDays
        }
      };
    });
  };

  const handlePrescriptionToggle = (exerciseId: string) => {
    setAssignmentData(prev => ({
      ...prev,
      exercisePrescriptions: {
        ...prev.exercisePrescriptions,
        [exerciseId]: {
          ...prev.exercisePrescriptions[exerciseId],
          isPrescribed: !prev.exercisePrescriptions[exerciseId]?.isPrescribed
        }
      }
    }));

    setExercisePrescriptions(prev => 
      prev.map(prescription => 
        prescription.exerciseId === exerciseId 
          ? { ...prescription, isPrescribed: !prescription.isPrescribed }
          : prescription
      )
    );
  };

  const handleMetricChange = (exerciseId: string, metricId: string, value: any) => {
    setAssignmentData(prev => ({
      ...prev,
      exercisePrescriptions: {
        ...prev.exercisePrescriptions,
        [exerciseId]: {
          ...prev.exercisePrescriptions[exerciseId],
          prescribedMetrics: {
            ...prev.exercisePrescriptions[exerciseId]?.prescribedMetrics,
            [metricId]: value
          }
        }
      }
    }));

    setExercisePrescriptions(prev => 
      prev.map(prescription => 
        prescription.exerciseId === exerciseId 
          ? {
              ...prescription,
              prescribedMetrics: {
                ...prescription.prescribedMetrics,
                [metricId]: value
              }
            }
          : prescription
      )
    );
  };

  const handleAddMember = (member: TeamMemberWithUser) => {
    setAssignmentData(prev => ({
      ...prev,
      selectedMembers: [...prev.selectedMembers, member]
    }));
  };

  const handleRemoveMember = (memberId: string) => {
    setAssignmentData(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.filter(member => member._id !== memberId)
    }));
  };

  const generateEvents = useCallback(() => {
    if (!assignmentData.selectedWorkout || assignmentData.scheduleConfig.daysOfWeek.length === 0) {
      return [];
    }

    const events: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const { daysOfWeek, numberOfWeeks, startDate, defaultStartTime, defaultEndTime } = assignmentData.scheduleConfig;
    
    const startDateObj = new Date(startDate);
    const groupId = `workout-assignment-${Date.now()}`;

    for (let week = 0; week < numberOfWeeks; week++) {
      daysOfWeek.forEach((dayIndex, sequenceIndex) => {
        const eventDate = new Date(startDateObj);
        eventDate.setDate(startDateObj.getDate() + (week * 7) + (dayIndex - startDateObj.getDay()));

        const [startHour, startMinute] = defaultStartTime.split(':').map(Number);
        const [endHour, endMinute] = defaultEndTime.split(':').map(Number);

        const eventStartTime = new Date(eventDate);
        eventStartTime.setHours(startHour, startMinute, 0, 0);

        const eventEndTime = new Date(eventDate);
        eventEndTime.setHours(endHour, endMinute, 0, 0);

        const event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
          groupId,
          type: 'workout',
          organizationId,
          teamId,
          title: `${assignmentData.selectedWorkout!.name} - Week ${week + 1}`,
          description: assignmentData.selectedWorkout!.description,
          startTime: eventStartTime,
          endTime: eventEndTime,
          participants: {
            athletes: assignmentData.selectedMembers.map(member => ({
              userId: ('user' in member && member.user?.userId) || member.userId,
              memberId: member._id
            })),
            coaches: [],
            required: assignmentData.selectedMembers.map(member => 
              ('user' in member && member.user?.userId) || member.userId
            ),
            optional: []
          },
          recurrence: {
            pattern: 'none',
            interval: 1
          },
          sourceAssignmentId: `workout-${assignmentData.selectedWorkout!.id}`,
          sequenceNumber: week * daysOfWeek.length + sequenceIndex + 1,
          totalInSequence: numberOfWeeks * daysOfWeek.length,
          status: 'scheduled',
          visibility: 'team_only',
          createdBy: { userId: currentUserId, memberId: 'creator-member-id' },
          details: {
            type: 'workout',
            workoutId: assignmentData.selectedWorkout!.id,
            sessionType: assignmentData.sessionType,
            bookingInfo: {
              isBookingRequested: false,
              requestStatus: 'none'
            },
            estimatedDuration: 120,
            equipment: [],
            notes: assignmentData.notes,
            // Add exercise prescriptions if any are prescribed
            ...(Object.entries(assignmentData.exercisePrescriptions).some(([_, p]) => p.isPrescribed) && {
              exercisePrescriptions: Object.entries(assignmentData.exercisePrescriptions)
                .filter(([_, p]) => p.isPrescribed)
                .reduce((acc, [exerciseId, p]) => ({
                  ...acc,
                  [exerciseId]: {
                    prescribedMetrics: p.prescribedMetrics,
                    isModified: true
                  }
                }), {})
            })
          }
        };

        events.push(event);
      });
    }

    return events;
  }, [assignmentData, organizationId, teamId, currentUserId]);

  const handleAssignWorkouts = async () => {
    try {
      const events = generateEvents();
      
      // Create all events
      await Promise.all(events.map(event => onAddEvent(event)));
      
      onClose();
    } catch (error) {
      console.error('Failed to assign workouts:', error);
    }
  };

  const canAssign = assignmentData.selectedWorkout && 
                   assignmentData.scheduleConfig.daysOfWeek.length > 0 && 
                   assignmentData.selectedMembers.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Assign Workout to Athletes
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Selected Members Section - Updated */}
          <SelectedMembersSection 
            selectedMembers={assignmentData.selectedMembers}
            onRemoveMember={handleRemoveMember}
            onAddMembers={() => setIsAddingMembers(true)}
          />

          {/* Add Members Dialog */}
          <AddMembersDialog
            isOpen={isAddingMembers}
            onClose={() => {
              setIsAddingMembers(false);
              setMemberSearchQuery('');
            }}
            availableMembers={filteredAvailableMembers}
            searchQuery={memberSearchQuery}
            onSearchChange={setMemberSearchQuery}
            onAddMember={handleAddMember}
          />

          {/* Workout Selection */}
          <WorkoutSelectionSection
            selectedWorkout={assignmentData.selectedWorkout}
            availableWorkouts={availableWorkouts}
            isLoadingWorkouts={isLoadingWorkouts}
            onWorkoutSelect={handleWorkoutSelect}
          />

          {/* Schedule Configuration */}
          <ScheduleConfigurationSection
            scheduleConfig={assignmentData.scheduleConfig}
            onScheduleConfigChange={(config) => 
              setAssignmentData(prev => ({ ...prev, scheduleConfig: config }))
            }
          />

          {/* Exercise Prescriptions */}
          {assignmentData.selectedWorkout && (
            <ExercisePrescriptionsSection
              exercisePrescriptions={exercisePrescriptions}
              isLoadingExercises={isLoadingExercises}
              onPrescriptionToggle={handlePrescriptionToggle}
              onMetricChange={handleMetricChange}
            />
          )}

          {/* Session Configuration */}
          <SessionConfigurationSection
            sessionType={assignmentData.sessionType}
            notes={assignmentData.notes}
            onSessionTypeChange={(sessionType) => 
              setAssignmentData(prev => ({ ...prev, sessionType }))
            }
            onNotesChange={(notes) => 
              setAssignmentData(prev => ({ ...prev, notes }))
            }
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignWorkouts} 
            disabled={!canAssign}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Assign Workouts ({generateEvents().length} events)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== UPDATED SUB-COMPONENTS =====

function SelectedMembersSection({ 
  selectedMembers, 
  onRemoveMember, 
  onAddMembers 
}: { 
  selectedMembers: TeamMemberWithUser[];
  onRemoveMember: (memberId: string) => void;
  onAddMembers: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Selected Athletes ({selectedMembers.length})
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddMembers}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Members
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map((member) => {
            const userName = ('user' in member && member.user?.name) || 'Unknown User';
            const userEmail = ('user' in member && member.user?.email) || '';
            
            return (
              <Badge 
                key={member._id} 
                variant="secondary" 
                className="flex items-center gap-1 pr-1"
              >
                <User className="h-3 w-3" />
                {userName}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onRemoveMember(member._id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function AddMembersDialog({
  isOpen,
  onClose,
  availableMembers,
  searchQuery,
  onSearchChange,
  onAddMember
}: {
  isOpen: boolean;
  onClose: () => void;
  availableMembers: TeamMemberWithUser[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddMember: (member: TeamMemberWithUser) => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Team Members
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Members List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {availableMembers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {searchQuery ? 'No members found matching your search.' : 'No available members to add.'}
              </div>
            ) : (
              availableMembers.map((member) => {
                const userName = ('user' in member && member.user?.name) || 'Unknown User';
                const userEmail = ('user' in member && member.user?.email) || '';
                
                return (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => onAddMember(member)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{userName}</div>
                        <div className="text-sm text-muted-foreground">{userEmail}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WorkoutSelectionSection({
  selectedWorkout,
  availableWorkouts,
  isLoadingWorkouts,
  onWorkoutSelect
}: {
  selectedWorkout: Workout | null;
  availableWorkouts: Workout[];
  isLoadingWorkouts: boolean;
  onWorkoutSelect: (workout: Workout) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Dumbbell className="h-4 w-4" />
          Select Workout
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingWorkouts ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">Loading workouts...</div>
          </div>
        ) : (
          <Select
            value={selectedWorkout?.id || ''}
            onValueChange={(workoutId) => {
              const workout = availableWorkouts.find(w => w.id === workoutId);
              if (workout) onWorkoutSelect(workout);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a workout to assign" />
            </SelectTrigger>
            <SelectContent>
              {availableWorkouts.map((workout) => (
                <SelectItem key={workout.id} value={workout.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{workout.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {workout.flow.exercises.length} exercises
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {selectedWorkout && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{selectedWorkout.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedWorkout.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" size="sm">
                    {selectedWorkout.flow.exercises.length} exercises
                  </Badge>
                  {selectedWorkout.tags.map(tag => (
                    <Badge key={tag} variant="secondary" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ScheduleConfigurationSection({
  scheduleConfig,
  onScheduleConfigChange
}: {
  scheduleConfig: WorkoutAssignmentData['scheduleConfig'];
  onScheduleConfigChange: (config: WorkoutAssignmentData['scheduleConfig']) => void;
}) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          Schedule Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Days of Week Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Days of Week</label>
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map((day, index) => (
              <Button
                key={index}
                variant={scheduleConfig.daysOfWeek.includes(index) ? "primary" : "outline"}
                size="sm"
                onClick={() => {
                  const newDays = scheduleConfig.daysOfWeek.includes(index)
                    ? scheduleConfig.daysOfWeek.filter(d => d !== index)
                    : [...scheduleConfig.daysOfWeek, index];
                  
                  onScheduleConfigChange({
                    ...scheduleConfig,
                    daysOfWeek: newDays
                  });
                }}
                className="text-xs"
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>

        {/* Number of Weeks */}
        <div>
          <label className="text-sm font-medium mb-2 block">Number of Weeks</label>
          <Input
            type="number"
            min="1"
            max="52"
            value={scheduleConfig.numberOfWeeks}
            onChange={(e) => 
              onScheduleConfigChange({
                ...scheduleConfig,
                numberOfWeeks: Math.max(1, parseInt(e.target.value) || 1)
              })
            }
            className="w-24"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="text-sm font-medium mb-2 block">Start Date</label>
          <Input
            type="date"
            value={scheduleConfig.startDate.toISOString().split('T')[0]}
            onChange={(e) => 
              onScheduleConfigChange({
                ...scheduleConfig,
                startDate: new Date(e.target.value)
              })
            }
            className="w-40"
          />
        </div>

        {/* Time Configuration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Start Time</label>
            <Input
              type="time"
              value={scheduleConfig.defaultStartTime}
              onChange={(e) => 
                onScheduleConfigChange({
                  ...scheduleConfig,
                  defaultStartTime: e.target.value
                })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">End Time</label>
            <Input
              type="time"
              value={scheduleConfig.defaultEndTime}
              onChange={(e) => 
                onScheduleConfigChange({
                  ...scheduleConfig,
                  defaultEndTime: e.target.value
                })
              }
            />
          </div>
        </div>

        {/* Schedule Summary */}
        {scheduleConfig.daysOfWeek.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>Schedule Summary:</strong> {scheduleConfig.numberOfWeeks} week(s), 
              {scheduleConfig.daysOfWeek.length} day(s) per week = {scheduleConfig.numberOfWeeks * scheduleConfig.daysOfWeek.length} total sessions
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExercisePrescriptionsSection({
  exercisePrescriptions,
  isLoadingExercises,
  onPrescriptionToggle,
  onMetricChange
}: {
  exercisePrescriptions: ExerciseMetricPrescription[];
  isLoadingExercises: boolean;
  onPrescriptionToggle: (exerciseId: string) => void;
  onMetricChange: (exerciseId: string, metricId: string, value: any) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4" />
          Exercise Prescriptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingExercises ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">Loading exercises...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {exercisePrescriptions.map((prescription) => (
              <ExercisePrescriptionCard
                key={prescription.exerciseId}
                prescription={prescription}
                onPrescriptionToggle={onPrescriptionToggle}
                onMetricChange={onMetricChange}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExercisePrescriptionCard({
  prescription,
  onPrescriptionToggle,
  onMetricChange
}: {
  prescription: ExerciseMetricPrescription;
  onPrescriptionToggle: (exerciseId: string) => void;
  onMetricChange: (exerciseId: string, metricId: string, value: any) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SwitchWrapper>
            <Switch
              checked={prescription.isPrescribed}
              onCheckedChange={() => onPrescriptionToggle(prescription.exerciseId)}
            />
          </SwitchWrapper>
          <div className="flex-1">
            <h4 className="font-medium">{prescription.exerciseName}</h4>
            <p className="text-sm text-muted-foreground">
              {prescription.isPrescribed ? 'Prescribe metrics' : 'Use default metrics'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && prescription.isPrescribed && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(prescription.prescribedMetrics).map(([metricId, value]) => {
              const metric = prescription.exercise.metrics.find(m => m.id === metricId);
              if (!metric) return null;

              return (
                <div key={metricId}>
                  <label className="text-sm font-medium mb-1 block">
                    {metricId.replace('_', ' ').toUpperCase()}
                    {metric.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Input
                    type={metric.input === 'number' ? 'number' : 'text'}
                    value={value || ''}
                    onChange={(e) => {
                      const newValue = metric.input === 'number' 
                        ? parseFloat(e.target.value) || 0
                        : e.target.value;
                      onMetricChange(prescription.exerciseId, metricId, newValue);
                    }}
                    placeholder={`Default: ${prescription.defaultMetrics[metricId]}`}
                  />
                  {metric.unit && (
                    <span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionConfigurationSection({
  sessionType,
  notes,
  onSessionTypeChange,
  onNotesChange
}: {
  sessionType: 'individual' | 'group' | 'team';
  notes: string;
  onSessionTypeChange: (sessionType: 'individual' | 'group' | 'team') => void;
  onNotesChange: (notes: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Session Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Session Type</label>
          <Select value={sessionType} onValueChange={onSessionTypeChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="group">Group</SelectItem>
              <SelectItem value="team">Team</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
          <Input
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add any additional notes for the workout sessions..."
          />
        </div>
      </CardContent>
    </Card>
  );
}