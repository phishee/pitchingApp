import * as React from 'react';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tag } from '@/components/ui/tag';
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
    categories?: string[];
}

export function TagPicker({ selectedTags, onTagsChange, className, categories }: TagPickerProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');

    // Filter system tags based on categories prop
    const filteredSystemTags = React.useMemo(() => {
        if (!categories || categories.length === 0) {
            return systemTags;
        }
        return systemTags.filter(tag => categories.includes(tag.category || ''));
    }, [categories]);

    // Group filtered tags by category
    const groupedTags = React.useMemo(() => {
        return filteredSystemTags.reduce((acc, tag) => {
            const category = tag.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(tag);
            return acc;
        }, {} as Record<string, typeof systemTags>);
    }, [filteredSystemTags]);

    const handleSelect = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            onTagsChange(selectedTags.filter((t) => t !== tagId));
        } else {
            onTagsChange([...selectedTags, tagId]);
        }
    };

    const handleRemove = (tagId: string) => {
        onTagsChange(selectedTags.filter((t) => t !== tagId));
    };

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagId) => (
                    <Tag
                        key={tagId}
                        value={tagId}
                        onRemove={() => handleRemove(tagId)}
                        className="rounded-full font-bold px-3 py-1"
                    />
                ))}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 border-dashed rounded-full font-bold"
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
                                                const isSelected = selectedTags.includes(tag.id);
                                                return (
                                                    <CommandItem
                                                        key={tag.id}
                                                        value={tag.name}
                                                        onSelect={() => handleSelect(tag.id)}
                                                    >
                                                        <div className="mr-2 flex h-4 w-4 items-center justify-center">
                                                            {isSelected && <Check className="h-4 w-4" />}
                                                        </div>
                                                        {tag.icon && <span className="mr-2">{tag.icon}</span>}
                                                        <span>{tag.name}</span>
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
