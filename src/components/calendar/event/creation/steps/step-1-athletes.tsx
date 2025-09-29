import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Search, AlertCircle, Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AthletesStepProps } from '../work-assignment-types';

export function Step1SelectAthletes({
  assignmentData,
  onAssignmentDataChange,
  availableMembers,
  searchQuery,
  onSearchChange
}: AthletesStepProps) {
  const filteredMembers = useMemo(() => {
    return availableMembers.filter(member => {
      const matchesSearch = searchQuery === '' || 
        (('user' in member && member.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
         ('user' in member && member.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesSearch;
    }).sort((a, b) => {
      const nameA = ('user' in a && a.user?.name) || '';
      const nameB = ('user' in b && b.user?.name) || '';
      return nameA.localeCompare(nameB);
    });
  }, [availableMembers, searchQuery]);

  const handleToggleMember = (member: any) => {
    const isSelected = assignmentData.selectedMembers.some(m => m._id === member._id);
    const newMembers = isSelected
      ? assignmentData.selectedMembers.filter(m => m._id !== member._id)
      : [...assignmentData.selectedMembers, member];
    
    onAssignmentDataChange({ selectedMembers: newMembers });
  };

  const handleSelectAll = () => {
    onAssignmentDataChange({ selectedMembers: [...availableMembers] });
  };

  const handleClearAll = () => {
    onAssignmentDataChange({ selectedMembers: [] });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select Athletes ({assignmentData.selectedMembers.length} selected)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredMembers.length === 0}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={assignmentData.selectedMembers.length === 0}
              >
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search athletes by name or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Athletes List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? (
                  <>
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No athletes found matching "{searchQuery}"</p>
                  </>
                ) : (
                  <>
                    <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                    <p>No athletes available to assign</p>
                  </>
                )}
              </div>
            ) : (
              filteredMembers.map((member) => {
                const userName = ('user' in member && member.user?.name) || 'Unknown User';
                const userEmail = ('user' in member && member.user?.email) || '';
                const isSelected = assignmentData.selectedMembers.some(m => m._id === member._id);
                
                return (
                  <div
                    key={member._id}
                    onClick={() => handleToggleMember(member)}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                      isSelected 
                        ? "bg-primary/5 border-primary hover:bg-primary/10" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => handleToggleMember(member)}
                      className="pointer-events-none"
                    />
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{userName}</div>
                      <div className="text-sm text-muted-foreground truncate">{userEmail}</div>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Message */}
      {assignmentData.selectedMembers.length === 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-900 dark:text-amber-200 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>Please select at least one athlete to continue</p>
        </div>
      )}
    </div>
  );
}
