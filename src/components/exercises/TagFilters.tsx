import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import systemTags from '@/data/constants/systemTags.json';
import { Tag } from '@/components/ui/tag';

interface TagFiltersProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    categories?: string[];
}

// Group system tags by category
const groupedTags = systemTags.reduce((acc, tag) => {
    const category = tag.category || 'Other';
    if (!acc[category]) {
        acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
}, {} as Record<string, typeof systemTags>);

const CATEGORY_LABELS: Record<string, string> = {
    body_regions: 'Body Region',
    training_types: 'Training Type',
    position_specific: 'Position Specific',
    equipment: 'Equipment',
    baseball_specific: 'Baseball Specific',
    movement_patterns: 'Movement Pattern',
    training_phases: 'Training Phase',
    skill_focus: 'Skill Focus',
    intensity_level: 'Intensity Level',
};

export function TagFilters({ selectedTags, onTagsChange, categories }: TagFiltersProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const handleCategoryClick = (category: string) => {
        setActiveCategory(activeCategory === category ? null : category);
    };

    const handleTagClick = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            onTagsChange(selectedTags.filter((t) => t !== tagId));
        } else {
            onTagsChange([...selectedTags, tagId]);
        }
    };

    const handleClear = () => {
        onTagsChange([]);
        setActiveCategory(null);
    };

    // Filter categories to display
    const displayCategories = categories
        ? Object.keys(groupedTags).filter(cat => categories.includes(cat))
        : Object.keys(groupedTags);

    // Sort categories to match the order in the 'categories' prop if provided
    if (categories) {
        displayCategories.sort((a, b) => {
            return categories.indexOf(a) - categories.indexOf(b);
        });
    }

    return (
        <div className="space-y-4">
            {/* Category Buttons */}
            <div className="flex flex-wrap gap-2">
                {displayCategories.map((category) => {
                    const isActive = activeCategory === category;
                    const categoryTags = groupedTags[category] || [];
                    const selectedCount = categoryTags.filter(t => selectedTags.includes(t.id)).length;

                    return (
                        <Button
                            key={category}
                            variant={isActive ? "primary" : "outline"}
                            size="sm"
                            onClick={() => handleCategoryClick(category)}
                            className={cn(
                                "rounded-full transition-all",
                                isActive ? "bg-blue-600 hover:bg-blue-700 text-white" : "hover:bg-gray-100",
                                selectedCount > 0 && !isActive && "border-blue-200 bg-blue-50 text-blue-700"
                            )}
                        >
                            {CATEGORY_LABELS[category] || category.replace(/_/g, ' ')}
                            {selectedCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "ml-2 px-1.5 py-0 h-5 rounded-full text-xs",
                                        isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                                    )}
                                >
                                    {selectedCount}
                                </Badge>
                            )}
                            {isActive ? <ChevronUp className="ml-2 h-3 w-3" /> : <ChevronDown className="ml-2 h-3 w-3" />}
                        </Button>
                    );
                })}

                {selectedTags.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full px-3"
                    >
                        <X className="mr-1 h-3 w-3" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Active Category Tags Panel */}
            {activeCategory && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-wrap gap-2">
                        {groupedTags[activeCategory]?.map((tag) => {
                            const isSelected = selectedTags.includes(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => handleTagClick(tag.id)}
                                    className={cn(
                                        "group flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                                        isSelected
                                            ? "bg-white border-blue-200 shadow-sm ring-1 ring-blue-100"
                                            : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    <span className="text-lg">{tag.icon}</span>
                                    <span className={cn(isSelected ? "text-gray-900" : "text-gray-700")}>
                                        {tag.name}
                                    </span>
                                    {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-blue-600 ml-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
