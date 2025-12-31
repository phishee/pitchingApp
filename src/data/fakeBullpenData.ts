import { BullpenSession } from '@/models/Bullpen';

export const FAKE_BULLPEN_SESSION: BullpenSession = {
    id: "6952f0514c51f85e8ac08b83",
    workoutAssignmentId: "assignment_123",
    organizationId: "68f459244c934ee094241fc4",
    teamId: "68f459254c934ee094241fc5",
    athleteInfo: {
        userId: "50cxkPmc35g79OSzeXYiheBo2x82",
        memberId: "6931cc316d79e95fbc29b0a3",
        name: "Max Scherzer",
        profileImageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200"
    },
    coachInfo: {
        userId: "5NlI0p6DoXQDnuOV0ddYTNcEb7M2",
        memberId: "coach_1"
    },
    startedAt: new Date(),
    status: "in_progress",
    summary: {
        totalPitchPrescribed: 30,
        totalPitchCompleted: 14,
        compliance: 0,
        avgVelocity: 94.2,
        topVelocity: 96.5,
        strikePct: 68
    },
    script: Array.from({ length: 30 }, (_, i) => ({
        id: `script_${i}`,
        pitchType: i % 3 === 0 ? "4-Seam" : i % 3 === 1 ? "Slider" : "Changeup",
        targetZone: ((i % 9) + 1).toString()
    })),
    pitches: [
        {
            id: "p_14",
            number: 14,
            pitchType: { id: "fastball_4seam", label: "4-Seam Fastball", value: "4-Seam" },
            velocity: 95.2,
            targetZone: "2",
            actualZone: "2",
            compliance: true,
            strike: true,
            intensity: "game_intensity",
            timestamp: new Date()
        },
        {
            id: "p_13",
            number: 13,
            pitchType: { id: "fastball_4seam", label: "4-Seam Fastball", value: "4-Seam" },
            velocity: 94.8,
            targetZone: "5",
            actualZone: "5",
            compliance: true,
            strike: true,
            intensity: "game_intensity",
            timestamp: new Date()
        },
        {
            id: "p_12",
            number: 12,
            pitchType: { id: "slider", label: "Slider", value: "SL" },
            velocity: 86.4,
            targetZone: "9",
            actualZone: "14",
            compliance: false,
            strike: false,
            intensity: "game_intensity",
            timestamp: new Date()
        },
        {
            id: "p_11",
            number: 11,
            pitchType: { id: "fastball_4seam", label: "4-Seam Fastball", value: "4-Seam" },
            velocity: 96.1,
            targetZone: "1",
            actualZone: "1",
            compliance: true,
            strike: false,
            note: "Foul",
            intensity: "game_intensity",
            timestamp: new Date()
        },
        {
            id: "p_10",
            number: 10,
            pitchType: { id: "changeup", label: "Changeup", value: "CH" },
            velocity: 88.2,
            targetZone: "8",
            actualZone: "8",
            compliance: true,
            strike: true,
            intensity: "game_intensity",
            timestamp: new Date()
        },
        {
            id: "p_9",
            number: 9,
            pitchType: { id: "fastball_4seam", label: "4-Seam Fastball", value: "4-Seam" },
            velocity: 95.0,
            targetZone: "5",
            actualZone: "5",
            compliance: true,
            strike: true,
            intensity: "game_intensity",
            timestamp: new Date()
        }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
};
