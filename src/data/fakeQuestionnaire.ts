import { QuestionnaireAssignment, QuestionnaireTemplate } from "@/models";

export const sleepQualityQuestionnaire: QuestionnaireTemplate = {
    _id: "questionnaire_sleep_quality_v1",

    // System-level template (no organization)
    organizationId: null,

    // Metadata
    name: "Sleep Quality Check",
    description: "Daily sleep tracking to monitor rest and recovery",
    category: "wellness",
    tags: ["sleep", "recovery", "daily", "wellness"],
    
    // UI
    icon: "MoonStar",
    colorTheme: "indigo",

    // Who should complete this
    targetRoles: ["athlete"],

    // Questions
    questions: [
        {
            id: "sleep_quality_rating",
            text: "How would you rate your sleep quality last night?",
            description: "Consider how rested you feel and if you woke up during the night",
            type: "numeric_scale",
            required: true,
            configs: {
                min: 1,
                max: 5,
                step: 1,
                minLabel: "Very Poor",
                maxLabel: "Excellent"
            },
            metricKey: "sleep_quality"
        },
        {
            id: "sleep_hours",
            text: "How many hours did you sleep last night?",
            description: "Estimate your total sleep time, not time in bed",
            type: "numeric_scale",
            required: true,
            configs: {
                min: 0,
                max: 12,
                step: 0.5,
                minLabel: "0 hrs",
                maxLabel: "12 hrs"
            },
            metricKey: "sleep_hours"
        }
    ],

    // Estimated 30 seconds to complete
    estimatedDuration: 30,

    // Status
    isActive: true,

    // Audit (null for system templates)
    createdBy: null,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-01T00:00:00Z")
};

const dailySleepAssignment: QuestionnaireAssignment = {
  _id: "assignment_sleep_daily_team789",
  
  // What & Where
  questionnaireTemplateId: "questionnaire_sleep_quality_v1",
  organizationId: "org_456",
  teamId: "team_789",
  
  // Who should complete
  targetRoles: ["athlete"],
  
  // Schedule - DAILY
  recurrence: {
    pattern: "daily",
    startDate: new Date("2025-01-01"),
    endDate: null  // Ongoing
  },
  
  // Time window - complete anytime before midnight
  expiresAtTime: "23:59",
  
  // Backfill settings
  backfillAllowedDays: 7,
  
  // Status
  isActive: true,
  
  // Audit
  assignedBy: {
    userId: "coach_001",
    memberId: "member_coach_001"
  },
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z")
};




// const exampleResult: QuestionnaireResult = {
//   _id: "result_sleep_2025_01_15_athlete123",
  
//   questionnaireTemplateId: "questionnaire_sleep_quality_v1",
//   organizationId: "org_456",
//   teamId: "team_789",
  
//   athleteInfo: {
//     userId: "user_123",
//     memberId: "member_123"
//   },
  
//   scheduledDate: new Date("2025-01-15"),
  
//   context: {
//     type: "standalone",
//     assignmentId: "assignment_sleep_daily_team789"
//   },
  
//   answers: [
//     {
//       questionId: "sleep_quality_rating",
//       questionText: "How would you rate your sleep quality last night?",
//       questionType: "numeric_scale",
//       value: 4
//     },
//     {
//       questionId: "sleep_hours",
//       questionText: "How many hours did you sleep last night?",
//       questionType: "numeric_scale",
//       value: 7.5
//     }
//   ],
  
//   submittedAt: new Date("2025-01-15T07:32:00Z"),
//   isLateSubmission: false,
  
//   createdAt: new Date("2025-01-15T07:32:00Z"),
//   updatedAt: new Date("2025-01-15T07:32:00Z")
// };