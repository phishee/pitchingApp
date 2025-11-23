import { ExerciseSession } from '@/components/workout-session/exercise-session';

interface PageProps {
    params: Promise<{
        sessionId: string;
        exerciseId: string;
    }>;
}

export default async function ExercisePage({ params }: PageProps) {
    const { exerciseId } = await params;
    return <ExerciseSession exerciseId={exerciseId} />;
}
