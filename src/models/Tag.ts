// System tag (from JSON file)
export interface SystemTag {
    id: string;
    name: string;
    color?: string;
    icon?: string;
    category?: string; // Optional: for grouping in UI
}

// User-created tag (from database)
export interface UserTag {
    name: string;
    color?: string;
    icon?: string;
    organizationId: string;
    teamId?: string;
    createdBy: {
        userId: string;
        memberId: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Unified tag type for UI consumption
export type Tag = SystemTag | UserTag;

// Type guard to differentiate
export function isUserTag(tag: Tag): tag is UserTag {
    return 'organizationId' in tag;
}

export function isSystemTag(tag: Tag): tag is SystemTag {
    return !('organizationId' in tag);
}