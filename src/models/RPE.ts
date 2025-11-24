// RPE.ts - Rate of Perceived Exertion Model

// ===== TYPES =====

export type RPEMode = 'emoji' | 'numeric';

export type RPEEmojiCategory = 'easy' | 'medium' | 'hard' | 'extreme';

export interface RPEEmojiOption {
    category: RPEEmojiCategory;
    emoji: string;
    label: string;
    range: [number, number];
    midpoint: number;
    description: string;
}

export interface RPEConfig {
    mode: RPEMode;
    granularity?: 'session' | 'exercise'; // Default to 'session'
    allowModeToggle: boolean;
    emojiOptions?: RPEEmojiOption[];
}

export interface RPEValue {
    numeric: number;
    emojiCategory?: RPEEmojiCategory;
}

export interface RPEResult {
    config: RPEConfig;
    overall?: RPEValue;
}

// ===== CONSTANTS =====

export const RPE_EMOJI_OPTIONS: RPEEmojiOption[] = [
    {
        category: 'easy',
        emoji: '😴',
        label: 'Easy',
        range: [1, 3],
        midpoint: 2,
        description: 'Could do many more reps'
    },
    {
        category: 'medium',
        emoji: '💪',
        label: 'Medium',
        range: [4, 6],
        midpoint: 5,
        description: 'Moderate effort, 3-4 reps left'
    },
    {
        category: 'hard',
        emoji: '😤',
        label: 'Hard',
        range: [7, 8],
        midpoint: 7.5,
        description: 'Very challenging, 1-2 reps left'
    },
    {
        category: 'extreme',
        emoji: '💀',
        label: 'Extreme',
        range: [9, 10],
        midpoint: 9.5,
        description: 'Maximal effort, 0 reps left'
    }
];

export const DEFAULT_RPE_CONFIG: RPEConfig = {
    mode: 'emoji',
    granularity: 'session',
    allowModeToggle: true,
    emojiOptions: RPE_EMOJI_OPTIONS
};

// ===== UTILITY FUNCTIONS =====

/**
 * Convert numeric RPE (1-10) to emoji category
 */
export function numericToEmojiCategory(rpe: number): RPEEmojiCategory {
    if (rpe <= 3) return 'easy';
    if (rpe <= 6) return 'medium';
    if (rpe <= 8) return 'hard';
    return 'extreme';
}

/**
 * Convert emoji category to default numeric RPE
 */
export function emojiCategoryToNumeric(category: RPEEmojiCategory): number {
    const option = RPE_EMOJI_OPTIONS.find(opt => opt.category === category);
    return option?.midpoint ?? 5;
}

/**
 * Get emoji option details by category
 */
export function getEmojiOption(category: RPEEmojiCategory): RPEEmojiOption | undefined {
    return RPE_EMOJI_OPTIONS.find(opt => opt.category === category);
}

/**
 * Validate RPE numeric value is within valid range
 */
export function isValidRPE(value: number): boolean {
    return value >= 1 && value <= 10;
}

/**
 * Determine which mode was used based on RPE value
 */
export function getRPEMode(rpeValue: RPEValue): RPEMode {
    return rpeValue.emojiCategory ? 'emoji' : 'numeric';
}

/**
 * Validate RPE value object is consistent
 */
export function isValidRPEValue(value: RPEValue): boolean {
    if (!isValidRPE(value.numeric)) return false;

    if (value.emojiCategory) {
        const option = getEmojiOption(value.emojiCategory);
        if (!option) return false;
        if (value.numeric < option.range[0] || value.numeric > option.range[1]) {
            return false;
        }
    }

    return true;
}

/**
 * Calculate average RPE from exercise RPEs
 * Used to compute overall workout RPE
 */
export function calculateAverageRPE(exerciseRPEs: RPEValue[]): RPEValue | null {
    if (exerciseRPEs.length === 0) return null;

    const sum = exerciseRPEs.reduce((acc, rpe) => acc + rpe.numeric, 0);
    const average = sum / exerciseRPEs.length;
    const rounded = Math.round(average * 2) / 2; // Round to nearest 0.5

    const allUsedEmoji = exerciseRPEs.every(rpe => rpe.emojiCategory !== undefined);

    return {
        numeric: rounded,
        emojiCategory: allUsedEmoji ? numericToEmojiCategory(rounded) : undefined
    };
}

/**
 * Check if RPE was logged using emoji mode
 */
export function isEmojiRPE(rpe: RPEValue): rpe is RPEValue & { emojiCategory: RPEEmojiCategory } {
    return rpe.emojiCategory !== undefined;
}

/**
 * Check if RPE was logged using numeric mode
 */
export function isNumericRPE(rpe: RPEValue): boolean {
    return rpe.emojiCategory === undefined;
}

/**
 * Format RPE for display
 */
export function formatRPEForDisplay(rpeValue: RPEValue): string {
    if (rpeValue.emojiCategory) {
        const option = getEmojiOption(rpeValue.emojiCategory);
        return `${option?.emoji} ${option?.label} (${rpeValue.numeric}/10)`;
    }
    return `${rpeValue.numeric}/10`;
}
