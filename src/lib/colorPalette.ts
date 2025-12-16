export interface ColorTheme {
    name: string;
    primary: string;   // Text and Border
    secondary: string; // Hover/Active states
    light: string;     // Backgrounds
    id: string;        // Unique identifier for the theme
}

export const COLOR_PALETTE: ColorTheme[] = [
    {
        id: 'purple',
        name: 'Purple',
        primary: 'text-purple-600 border-purple-600',
        secondary: 'text-purple-700 hover:bg-purple-100',
        light: 'bg-purple-50',
    },
    {
        id: 'blue',
        name: 'Blue',
        primary: 'text-blue-600 border-blue-600',
        secondary: 'text-blue-700 hover:bg-blue-100',
        light: 'bg-blue-50',
    },
    {
        id: 'emerald',
        name: 'Emerald',
        primary: 'text-emerald-600 border-emerald-600',
        secondary: 'text-emerald-700 hover:bg-emerald-100',
        light: 'bg-emerald-50',
    },
    {
        id: 'amber',
        name: 'Amber',
        primary: 'text-amber-600 border-amber-600',
        secondary: 'text-amber-700 hover:bg-amber-100',
        light: 'bg-amber-50',
    },
    {
        id: 'rose',
        name: 'Rose',
        primary: 'text-rose-600 border-rose-600',
        secondary: 'text-rose-700 hover:bg-rose-100',
        light: 'bg-rose-50',
    },
    {
        id: 'cyan',
        name: 'Cyan',
        primary: 'text-cyan-600 border-cyan-600',
        secondary: 'text-cyan-700 hover:bg-cyan-100',
        light: 'bg-cyan-50',
    },
    {
        id: 'indigo',
        name: 'Indigo',
        primary: 'text-indigo-600 border-indigo-600',
        secondary: 'text-indigo-700 hover:bg-indigo-100',
        light: 'bg-indigo-50',
    },
    {
        id: 'orange',
        name: 'Orange',
        primary: 'text-orange-600 border-orange-600',
        secondary: 'text-orange-700 hover:bg-orange-100',
        light: 'bg-orange-50',
    },
    {
        id: 'teal',
        name: 'Teal',
        primary: 'text-teal-600 border-teal-600',
        secondary: 'text-teal-700 hover:bg-teal-100',
        light: 'bg-teal-50',
    },
    {
        id: 'fuchsia',
        name: 'Fuchsia',
        primary: 'text-fuchsia-600 border-fuchsia-600',
        secondary: 'text-fuchsia-700 hover:bg-fuchsia-100',
        light: 'bg-fuchsia-50',
    },
    {
        id: 'lime',
        name: 'Lime',
        primary: 'text-lime-600 border-lime-600',
        secondary: 'text-lime-700 hover:bg-lime-100',
        light: 'bg-lime-50',
    },
    {
        id: 'sky',
        name: 'Sky',
        primary: 'text-sky-600 border-sky-600',
        secondary: 'text-sky-700 hover:bg-sky-100',
        light: 'bg-sky-50',
    },
    {
        id: 'violet',
        name: 'Violet',
        primary: 'text-violet-600 border-violet-600',
        secondary: 'text-violet-700 hover:bg-violet-100',
        light: 'bg-violet-50',
    },
    {
        id: 'pink',
        name: 'Pink',
        primary: 'text-pink-600 border-pink-600',
        secondary: 'text-pink-700 hover:bg-pink-100',
        light: 'bg-pink-50',
    },
    {
        id: 'slate',
        name: 'Slate',
        primary: 'text-slate-600 border-slate-600',
        secondary: 'text-slate-700 hover:bg-slate-100',
        light: 'bg-slate-50',
    },
];

export function getNextAvailableColor(usedColorIds: string[]): ColorTheme {
    // Find the first color in the palette that isn't in the used list
    const availableColor = COLOR_PALETTE.find(c => !usedColorIds.includes(c.id));

    if (availableColor) {
        return availableColor;
    }

    // If all colors are used, cycle back using modulo
    const index = usedColorIds.length % COLOR_PALETTE.length;
    return COLOR_PALETTE[index];
}

export function getColorTheme(colorId?: string): ColorTheme {
    if (!colorId) return COLOR_PALETTE[0]; // Default to first if undefined
    return COLOR_PALETTE.find(c => c.id === colorId) || COLOR_PALETTE[0];
}
