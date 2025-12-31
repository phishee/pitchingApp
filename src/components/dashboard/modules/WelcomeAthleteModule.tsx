import React from 'react';
import { useUser } from '@/providers/user.context';
import { Card, CardContent } from '@/components/ui/card';

export function WelcomeAthleteModule() {
    const { user } = useUser();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const firstName = user?.name?.split(' ')[0] || 'Athlete';

    return (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none shadow-md rounded-4xl">
            <CardContent className="p-6">
                <h2 className="text-2xl font-bold">
                    {getGreeting()}, {firstName}!
                </h2>
                <p className="text-blue-100 mt-1">
                    Ready to crush your training goals today?
                </p>
            </CardContent>
        </Card>
    );
}
