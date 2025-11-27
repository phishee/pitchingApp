'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import systemTags from '@/data/constants/systemTags.json';

interface TagPickerProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    className?: string;
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

export function TagPicker({ selectedTags, onTagsChange, className }: TagPickerProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');

    const handleSelect = (tagName: string) => {
        if (selectedTags.includes(tagName)) {
            onTagsChange(selectedTags.filter((t) => t !== tagName));
        } else {
            onTagsChange([...selectedTags, tagName]);
        }
    };

    const handleRemove = (tagName: string) => {
        onTagsChange(selectedTags.filter((t) => t !== tagName));
    };

    // Helper to get tag details (color, icon)
    const getTagDetails = (tagName: string) => {
        return systemTags.find((t) => t.name === tagName);
    };

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagName) => {
                    const details = getTagDetails(tagName);
                    return (
                        <Badge
                            key={tagName}
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-1"
                            style={
                                details?.color
                                    ? {
                                        backgroundColor: `${details.color}20`, // 20% opacity
                                        color: details.color,
                                        borderColor: `${details.color}40`,
                                    }
                                    : undefined
                            }
                        >
                            {details?.icon && <span className="mr-1">{details.icon}</span>}
                            {tagName.replace(/_/g, ' ')}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(tagName);
                                }}
                                className="ml-1 rounded-full hover:bg-black/10 p-0.5"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove {tagName} tag</span>
                            </button>
                        </Badge>
                    );
                })}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 border-dashed"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Tag
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                            <CommandInput
                                placeholder="Search tags..."
                                value={inputValue}
                                onValueChange={setInputValue}
                            />
                            <CommandList>
                                <CommandEmpty>No tags found.</CommandEmpty>
                                {Object.entries(groupedTags).map(([category, tags]) => (
                                    <React.Fragment key={category}>
                                        <CommandGroup heading={category.replace(/_/g, ' ').toUpperCase()}>
                                            {tags.map((tag) => {
                                                const isSelected = selectedTags.includes(tag.name);
                                                return (
                                                    <CommandItem
                                                        key={tag.name}
                                                        value={tag.name}
                                                        onSelect={() => handleSelect(tag.name)}
                                                    >
                                                        <div className="mr-2 flex h-4 w-4 items-center justify-center">
                                                            {isSelected && <Check className="h-4 w-4" />}
                                                        </div>
                                                        {tag.icon && <span className="mr-2">{tag.icon}</span>}
                                                        <span>{tag.name.replace(/_/g, ' ')}</span>
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                        <CommandSeparator />
                                    </React.Fragment>
                                ))}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
