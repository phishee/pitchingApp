'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useUser } from '@/providers/user.context';
import { useTeam } from '@/providers/team-context';
import { questionnaireApi } from '@/app/services-client/questionnaireApi';
import { questionnaireAssignmentApi } from '@/app/services-client/questionnaireAssignmentApi';
import { QuestionnaireTemplate, QuestionnaireResult, QuestionnaireAssignment } from '@/models/Questionaire';
import { Moon, ChevronRight, Check, X as XIcon, Loader2, MoonStar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isAfter, isBefore, addDays } from 'date-fns';

export function SleepDashboardModule() {
    const { user } = useUser();
    const { currentTeam } = useTeam();
    const [isLoading, setIsLoading] = useState(true);
    const [sleepTemplate, setSleepTemplate] = useState<QuestionnaireTemplate | null>(null);
    const [assignments, setAssignments] = useState<QuestionnaireAssignment[]>([]);
    const [results, setResults] = useState<QuestionnaireResult[]>([]);

    // Current Week (Sun - Sat)
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 0 }); // 0 = Sunday
    const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

    useEffect(() => {
        if (!user) return;
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user || !user.currentOrganizationId) return;
        try {
            setIsLoading(true);
            // 1. Find Sleep Template
            // We assume there's a template with 'sleep' tag or name.
            // Ideally we fetch one with tag 'sleep'. The API gets all.
            const templates = await questionnaireApi.getQuestionnaireTemplates(user.currentOrganizationId, currentTeam?._id);

            // Heuristic: Tag contains 'sleep' OR name contains 'Sleep'
            const found = templates.find(t =>
                t.tags?.some(tag => tag.toLowerCase() === 'sleep') ||
                t.name.toLowerCase().includes('sleep')
            );

            if (!found) {
                // If no sleep template, maybe hide module or show empty state.
                setIsLoading(false);
                return;
            }
            setSleepTemplate(found);

            // 2. Fetch Assignments (to know expectations)
            // Pending API usually fetches specifically for 'doing', but we want historical context too. 
            // Actually, we just need to know IF it was assigned on a day.
            // Let's use getPendingAssignments logic BUT specifically for the week? 
            // Or just check if there is an active assignment for this template.
            // The user's assignments usually cover a range. 
            // Fetching "all active assignments" for user might be needed.
            // Currently API client has `getPendingAssignments` and `assignQuestionnaire`. 
            // We might lack "getAllAssignmentsForUser" client method.
            // But we can infer expectation: if we have a template, and it's daily, we expect it.
            // Let's simplified assumption: If 'sleep' template is found, assume it is assigned Daily? 
            // Better: Let's rely on RESULTS for calculation, and visualization of misses? 
            // If we want to show 'X' for misses, we need assignment data.
            // For now, let's fetch pending to see if it shows up there? No, pending is only if NOT done.

            // Let's assume daily expectation for sleep if the template exists.

            // 3. Fetch Results for this week
            const weekResults = await questionnaireApi.getResults(
                user.userId || '',
                found._id,
                startOfCurrentWeek,
                endOfCurrentWeek
            );
            setResults(weekResults);

        } catch (error) {
            console.error("Failed to load sleep data", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate Average Hours
    // Find numeric question for "Hours"
    const averageSleep = useMemo(() => {
        if (!sleepTemplate || results.length === 0) return 0;

        let total = 0;
        let count = 0;

        results.forEach(r => {
            // Find numeric answer
            // Heuristic: finding answer where question text includes 'hour' or 'long' or just numeric?
            // Or checking config min/max? 1-12 range?
            r.answers.forEach(a => {
                const val = Number(a.value);
                if (!isNaN(val) && val > 0 && val < 24) { // Sanity check 0-24 hours
                    // Prefer 'Hours' question if multiple
                    if (a.questionText.toLowerCase().includes('how many hours') || a.questionText.toLowerCase().includes('duration')) {
                        total += val;
                        count++;
                    } else if (count === 0) {
                        // Fallback to first valid number found
                        total += val;
                        count++;
                    } else if (count === 1 && !a.questionText.toLowerCase().includes('hours')) {
                        // If we already have a fallback but found a better match, swap? logic gets complex.
                        // Assuming simplest template: 1 numeric question for hours.
                    }
                }
            });
        });

        return count > 0 ? (total / count).toFixed(2) : 0;
    }, [results, sleepTemplate]);

    // Determine sleep status label based on average
    const sleepLabel = useMemo(() => {
        const avg = Number(averageSleep);
        if (avg >= 8) return "Well Rested";
        if (avg >= 7) return "Good";
        if (avg >= 6) return "Moderate";
        if (avg > 0) return "Insomniac"; // User's screenshot example
        return "No Data";
    }, [averageSleep]);

    if (!sleepTemplate && !isLoading) return null;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-blue-500">
                        <MoonStar className="w-5 h-5 fill-current" />
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">Sleep</h3>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                    Today <ChevronRight className="w-4 h-4 ml-1" />
                </div>
            </div>

            <div className="flex justify-between items-end">
                {/* Score */}
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">{averageSleep}</span>
                        <span className="text-lg text-gray-500 font-medium">hr</span>
                    </div>
                    <p className="text-gray-500 font-medium mt-1">Avg Time</p>
                </div>

                {/* Tracking Dots */}
                <div className="flex gap-1.5">
                    {weekDays.map((day, i) => {
                        const dayLabel = format(day, 'EEEEE'); // M, T, W...
                        const isToday = isSameDay(day, today);
                        const isFuture = isAfter(day, today);

                        // Check if result exists
                        const result = results.find(r => isSameDay(new Date(r.scheduledDate), day));
                        // Or check submittedAt if scheduledDate missing? No, backend guarantees scheduledDate.

                        const submitted = !!result;

                        return (
                            <div key={i} className="flex flex-col items-center gap-1">
                                {/* Indicator */}
                                {submitted && (
                                    <Check className="w-2.5 h-2.5 text-green-400" strokeWidth={3} />
                                )}
                                {!submitted && !isFuture && (
                                    <XIcon className="w-2.5 h-2.5 text-gray-200" strokeWidth={3} />
                                )}
                                {!submitted && isFuture && (
                                    <div className="w-2.5 h-2.5" /> // Spacer
                                )}

                                {/* Circle */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all
                                    ${submitted
                                        ? 'border-green-500 text-transparent'
                                        : isToday
                                            ? 'border-gray-200 bg-gray-50'
                                            : 'border-gray-100'
                                    }
                                `}>
                                    {/* Donut Chart logic for partial? Screenshot shows rings. 
                                        If 'submitted', show ring.
                                        Actually screenshot shows ring segments.
                                        For MVP, let's use solid ring for done, empty for not.
                                    */}
                                    {submitted && (
                                        <div className="w-full h-full rounded-full border-2 border-green-500" />
                                    )}
                                </div>

                                <span className="text-xs font-semibold text-gray-400">{dayLabel}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Background gradient hint */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -z-10 opacity-50 pointer-events-none" />
        </div>
    );
}
