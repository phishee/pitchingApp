
// 'use client';

// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//     Calendar,
//     AlertCircle,
//     Plus,
//     X,
//     ChevronDown,
//     ChevronRight,
//     Info
// } from 'lucide-react';
// import { cn } from '@/lib/utils';

// // ==================== CONSTANTS ====================

// const GRID_COLS_MAP: Record<number, string> = {
//     1: 'grid-cols-1',
//     2: 'grid-cols-2',
//     3: 'grid-cols-3',
//     4: 'grid-cols-4'
// };

// // ==================== TYPES ====================

// interface RecurrenceConfig {
//     pattern: 'daily' | 'weekly' | 'monthly' | 'none';
//     interval: number;
//     startDate?: Date;
//     daysOfWeek?: number[];
//     weekOfMonth?: number[];
//     dayOfMonth?: number;
//     endDate?: Date;
//     occurrences?: number;
//     exceptions?: Date[];
// }

// interface RecurrenceSchedulerProps {
//     initialConfig?: RecurrenceConfig;
//     onChange: (config: RecurrenceConfig) => void;
//     minStartDate?: Date;
//     defaultStartDate?: Date;
//     maxEvents?: number;
//     enabledPatterns?: ('daily' | 'weekly' | 'monthly' | 'none')[];
//     compact?: boolean;
//     showPreview?: boolean;
// }

// // ==================== UTILITIES ====================

// const calculateOccurrences = (
//     config: RecurrenceConfig,
//     startDate: Date = new Date()
// ): Date[] => {
//     if (config.pattern === 'none') return [startDate];

//     const occurrences: Date[] = [];
//     const maxCount = config.occurrences || 100;
//     const endDate = config.endDate;
//     let currentDate = new Date(startDate);
//     currentDate.setHours(0, 0, 0, 0);

//     const addOccurrence = (date: Date) => {
//         const dateToAdd = new Date(date);
//         const isException = config.exceptions?.some(
//             ex => ex.toISOString().split('T')[0] === dateToAdd.toISOString().split('T')[0]
//         );
//         if (!isException) {
//             occurrences.push(new Date(dateToAdd));
//         }
//     };

//     if (config.pattern === 'daily') {
//         while (occurrences.length < maxCount) {
//             if (endDate && currentDate > endDate) break;
//             addOccurrence(currentDate);
//             currentDate = new Date(currentDate.setDate(currentDate.getDate() + config.interval));
//         }
//     }

//     if (config.pattern === 'weekly' && config.daysOfWeek?.length) {
//         let weekCount = 0;
//         while (occurrences.length < maxCount) {
//             if (endDate && currentDate > endDate) break;

//             const weekStart = new Date(startDate);
//             weekStart.setDate(startDate.getDate() + (weekCount * 7 * config.interval));

//             config.daysOfWeek.forEach(dayIndex => {
//                 const date = new Date(weekStart);
//                 const dayDiff = (dayIndex - weekStart.getDay() + 7) % 7;
//                 date.setDate(weekStart.getDate() + dayDiff);

//                 if (date >= startDate && (!endDate || date <= endDate)) {
//                     if (occurrences.length < maxCount) {
//                         addOccurrence(date);
//                     }
//                 }
//             });

//             weekCount++;
//             if (weekCount > 500) break; // Safety limit
//         }
//     }

//     if (config.pattern === 'monthly') {
//         let monthCount = 0;

//         while (occurrences.length < maxCount) {
//             const targetDate = new Date(startDate);
//             targetDate.setMonth(startDate.getMonth() + (monthCount * config.interval));

//             if (endDate && targetDate > endDate) break;

//             if (config.weekOfMonth && config.daysOfWeek?.length) {
//                 // Week-based
//                 config.weekOfMonth.forEach(weekNum => {
//                     const date = getNthWeekdayOfMonth(
//                         targetDate.getFullYear(),
//                         targetDate.getMonth(),
//                         config.daysOfWeek![0],
//                         weekNum
//                     );

//                     if (date && date >= startDate && (!endDate || date <= endDate)) {
//                         if (occurrences.length < maxCount) {
//                             addOccurrence(date);
//                         }
//                     }
//                 });
//             } else if (config.dayOfMonth !== undefined) {
//                 // Date-based
//                 const date = new Date(
//                     targetDate.getFullYear(),
//                     targetDate.getMonth(),
//                     config.dayOfMonth === -1
//                         ? new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate()
//                         : Math.min(config.dayOfMonth, new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate())
//                 );

//                 if (date >= startDate && (!endDate || date <= endDate)) {
//                     addOccurrence(date);
//                 }
//             }

//             monthCount++;
//             if (monthCount > 120) break; // Safety limit
//         }
//     }

//     return occurrences.sort((a, b) => a.getTime() - b.getTime()).slice(0, maxCount);
// };

// const getNthWeekdayOfMonth = (
//     year: number,
//     month: number,
//     dayOfWeek: number,
//     weekNumber: number
// ): Date | null => {
//     if (weekNumber === -1) {
//         const lastDay = new Date(year, month + 1, 0);
//         const lastDayOfWeek = lastDay.getDay();
//         const daysBack = (lastDayOfWeek - dayOfWeek + 7) % 7;
//         return new Date(year, month, lastDay.getDate() - daysBack);
//     }

//     const firstDay = new Date(year, month, 1);
//     const firstDayOfWeek = firstDay.getDay();
//     const daysUntilTarget = (dayOfWeek - firstDayOfWeek + 7) % 7;
//     const targetDate = new Date(year, month, 1 + daysUntilTarget + (weekNumber - 1) * 7);

//     if (targetDate.getMonth() !== month) return null;
//     return targetDate;
// };

// // ==================== SUB-COMPONENTS ====================
// const IntervalSlider: React.FC<{
//     value: number;
//     min: number;
//     max: number;
//     unit: string;
//     unitPlural: string;
//     onChange: (value: number) => void;
//     presets?: { value: number; label: string }[];
// }> = ({ value, min, max, unit, unitPlural, onChange, presets }) => {
//     const [isEditing, setIsEditing] = useState(false);
//     const [editValue, setEditValue] = useState(value.toString());
//     const inputRef = useRef<HTMLInputElement>(null);

//     useEffect(() => {
//         if (isEditing && inputRef.current) {
//             inputRef.current.focus();
//             inputRef.current.select();
//         }
//     }, [isEditing]);

//     const handleNumberClick = () => {
//         setEditValue(value.toString());
//         setIsEditing(true);
//     };

//     const handleBlur = () => {
//         const numValue = parseInt(editValue);
//         if (!isNaN(numValue) && numValue >= min && numValue <= max) {
//             onChange(numValue);
//         } else {
//             setEditValue(value.toString());
//         }
//         setIsEditing(false);
//     };

//     const handleKeyDown = (e: React.KeyboardEvent) => {
//         if (e.key === 'Enter') {
//             handleBlur();
//         } else if (e.key === 'Escape') {
//             setEditValue(value.toString());
//             setIsEditing(false);
//         }
//     };

//     return (
//         <div className="space-y-4">
//             <div className="flex items-center gap-4">
//                 <Label className="text-sm font-medium whitespace-nowrap">Repeat every</Label>

//                 {isEditing ? (
//                     <div className="flex items-center gap-2">
//                         <Input
//                             ref={inputRef}
//                             type="number"
//                             min={min}
//                             max={max}
//                             value={editValue}
//                             onChange={(e) => setEditValue(e.target.value)}
//                             onBlur={handleBlur}
//                             onKeyDown={handleKeyDown}
//                             className="w-20"
//                         />
//                         <span className="text-sm text-muted-foreground">
//                             {value === 1 ? unit : unitPlural}
//                         </span>
//                     </div>
//                 ) : (
//                     <div className="flex items-center gap-2">
//                         <button
//                             onClick={handleNumberClick}
//                             className="min-w-[3rem] px-3 py-1.5 text-2xl font-bold text-primary hover:bg-primary/10 rounded transition-colors"
//                             title="Click to edit"
//                         >
//                             {value}
//                         </button>
//                         <span className="text-sm text-muted-foreground">
//                             {value === 1 ? unit : unitPlural}
//                         </span>
//                     </div>
//                 )}
//             </div>

//             {/* Slider */}
//             <div className="space-y-2">
//                 <input
//                     type="range"
//                     min={min}
//                     max={max}
//                     value={value}
//                     onChange={(e) => onChange(Number(e.target.value))}
//                     className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer 
//               [&::-webkit-slider-thumb]:appearance-none 
//               [&::-webkit-slider-thumb]:w-4 
//               [&::-webkit-slider-thumb]:h-4 
//               [&::-webkit-slider-thumb]:rounded-full 
//               [&::-webkit-slider-thumb]:bg-primary 
//               [&::-webkit-slider-thumb]:cursor-pointer
//               [&::-webkit-slider-thumb]:transition-all
//               [&::-webkit-slider-thumb]:hover:scale-110
//               [&::-moz-range-thumb]:w-4 
//               [&::-moz-range-thumb]:h-4 
//               [&::-moz-range-thumb]:rounded-full 
//               [&::-moz-range-thumb]:bg-primary 
//               [&::-moz-range-thumb]:border-0
//               [&::-moz-range-thumb]:cursor-pointer"
//                 />

//                 {/* Min/Max labels */}
//                 <div className="flex justify-between text-xs text-muted-foreground">
//                     <span>{min}</span>
//                     <span>{max}</span>
//                 </div>
//             </div>

//             {/* Presets */}
//             {presets && presets.length > 0 && (
//                 <div className="flex flex-wrap gap-2">
//                     {presets.map((preset) => (
//                         <Button
//                             key={preset.value}
//                             variant="outline"
//                             size="sm"
//                             onClick={() => onChange(preset.value)}
//                             className={cn(value === preset.value && "border-primary bg-primary/5")}
//                         >
//                             {preset.label}
//                         </Button>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// // const DailyPatternConfig: React.FC<{
// //   interval: number;
// //   onChange: (interval: number) => void;
// // }> = ({ interval, onChange }) => {
// //   return (
// //     <div className="space-y-4 pt-4">
// //       <div>
// //         <Label className="text-sm font-medium mb-2 block">Repeat every</Label>
// //         <div className="flex items-center gap-2">
// //           <Input
// //             type="number"
// //             min={1}
// //             max={365}
// //             value={interval}
// //             onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
// //             className="w-24"
// //           />
// //           <span className="text-sm text-muted-foreground">day(s)</span>
// //         </div>
// //       </div>

// //       <div className="flex flex-wrap gap-2">
// //         <Button
// //           variant="outline"
// //           size="sm"
// //           onClick={() => onChange(1)}
// //           className={cn(interval === 1 && "border-primary")}
// //         >
// //           Every Day
// //         </Button>
// //         <Button
// //           variant="outline"
// //           size="sm"
// //           onClick={() => onChange(2)}
// //           className={cn(interval === 2 && "border-primary")}
// //         >
// //           Every Other Day
// //         </Button>
// //         <Button
// //           variant="outline"
// //           size="sm"
// //           onClick={() => onChange(3)}
// //           className={cn(interval === 3 && "border-primary")}
// //         >
// //           Every 3 Days
// //         </Button>
// //         <Button
// //           variant="outline"
// //           size="sm"
// //           onClick={() => onChange(4)}
// //           className={cn(interval === 4 && "border-primary")}
// //         >
// //           Every 4 Days
// //         </Button>
// //       </div>
// //     </div>
// //   );
// // };

// const DailyPatternConfig: React.FC<{
//     interval: number;
//     startDate: Date;
//     minStartDate: Date;
//     onChange: (interval: number) => void;
//     onStartDateChange: (date: Date) => void;
// }> = ({ interval, startDate, minStartDate, onChange, onStartDateChange }) => {
//     return (
//         <div className="space-y-4 pt-4">
//             <div>
//                 <Label className="text-sm font-medium mb-2 block">Start Date</Label>
//                 <Input
//                     type="date"
//                     value={startDate.toISOString().split('T')[0]}
//                     onChange={(e) => {
//                         const newDate = new Date(e.target.value);
//                         onStartDateChange(newDate);
//                     }}
//                     min={minStartDate.toISOString().split('T')[0]}
//                     className="w-full"
//                 />
//                 <p className="text-xs text-muted-foreground mt-2">
//                     Select the start date for the recurring events
//                 </p>
//             </div>
            
//             <IntervalSlider
//                 value={interval}
//                 min={1}
//                 max={30}
//                 unit="day"
//                 unitPlural="days"
//                 onChange={onChange}
//                 presets={[
//                     { value: 1, label: 'Every Day' },
//                     { value: 2, label: 'Every Other Day' },
//                     { value: 3, label: 'Every 3 Days' },
//                     { value: 7, label: 'Weekly' }
//                 ]}
//             />
//         </div>
//     );
// };

// // const WeeklyPatternConfig: React.FC<{
// //   interval: number;
// //   daysOfWeek: number[];
// //   onChange: (interval: number, daysOfWeek: number[]) => void;
// // }> = ({ interval, daysOfWeek, onChange }) => {
// //   const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
// //   const fullDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// //   const toggleDay = (dayIndex: number) => {
// //     const newDays = daysOfWeek.includes(dayIndex)
// //       ? daysOfWeek.filter(d => d !== dayIndex)
// //       : [...daysOfWeek, dayIndex].sort((a, b) => a - b);
// //     onChange(interval, newDays);
// //   };

// //   const setDays = (days: number[]) => {
// //     onChange(interval, days);
// //   };

// //   return (
// //     <div className="space-y-4 pt-4">
// //       <div>
// //         <Label className="text-sm font-medium mb-2 block">Repeat every</Label>
// //         <div className="flex items-center gap-2">
// //           <Input
// //             type="number"
// //             min={1}
// //             max={52}
// //             value={interval}
// //             onChange={(e) => onChange(Math.max(1, Number(e.target.value)), daysOfWeek)}
// //             className="w-24"
// //           />
// //           <span className="text-sm text-muted-foreground">week(s)</span>
// //         </div>
// //       </div>

// //       <div>
// //         <div className="flex items-center justify-between mb-2">
// //           <Label className="text-sm font-medium">On these days</Label>
// //           <div className="flex gap-2">
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => setDays([1, 2, 3, 4, 5])}
// //               className="text-xs h-7"
// //             >
// //               Weekdays
// //             </Button>
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => setDays([0, 6])}
// //               className="text-xs h-7"
// //             >
// //               Weekend
// //             </Button>
// //             <Button
// //               variant="ghost"
// //               size="sm"
// //               onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}
// //               className="text-xs h-7"
// //             >
// //               All Days
// //             </Button>
// //           </div>
// //         </div>

// //         <div className="grid grid-cols-7 gap-2">
// //           {dayLabels.map((day, index) => {
// //             const isSelected = daysOfWeek.includes(index);
// //             return (
// //               <Button
// //                 key={index}
// //                 variant={isSelected ? "primary" : "outline"}
// //                 size="lg"
// //                 onClick={() => toggleDay(index)}
// //                 className={cn(
// //                   "h-12 flex flex-col items-center justify-center",
// //                   isSelected && "ring-2 ring-primary ring-offset-2"
// //                 )}
// //               >
// //                 <span className="text-xs font-medium">{day}</span>
// //               </Button>
// //             );
// //           })}
// //         </div>

// //         {daysOfWeek.length > 0 && (
// //           <p className="text-xs text-muted-foreground mt-2">
// //             Selected: {daysOfWeek.map(i => fullDayLabels[i]).join(', ')}
// //           </p>
// //         )}
// //         {daysOfWeek.length === 0 && (
// //           <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
// //             Please select at least one day
// //           </p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// const WeeklyPatternConfig: React.FC<{
//     interval: number;
//     daysOfWeek: number[];
//     startDate: Date;
//     minStartDate: Date;
//     onChange: (interval: number, daysOfWeek: number[]) => void;
//     onStartDateChange: (date: Date) => void;
// }> = ({ interval, daysOfWeek, startDate, minStartDate, onChange, onStartDateChange }) => {
//     const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
//     const fullDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//     const toggleDay = (dayIndex: number) => {
//         const newDays = daysOfWeek.includes(dayIndex)
//             ? daysOfWeek.filter(d => d !== dayIndex)
//             : [...daysOfWeek, dayIndex].sort((a, b) => a - b);
//         onChange(interval, newDays);
//     };

//     const setDays = (days: number[]) => {
//         onChange(interval, days);
//     };

//     return (
//         <div className="space-y-4 pt-4">
//             <div>
//                 <Label className="text-sm font-medium mb-2 block">Start Date</Label>
//                 <Input
//                     type="date"
//                     value={startDate.toISOString().split('T')[0]}
//                     onChange={(e) => {
//                         const newDate = new Date(e.target.value);
//                         onStartDateChange(newDate);
//                     }}
//                     min={minStartDate.toISOString().split('T')[0]}
//                     className="w-full"
//                 />
//                 <p className="text-xs text-muted-foreground mt-2">
//                     Select the start date for the recurring events
//                 </p>
//             </div>
            
//             <IntervalSlider
//                 value={interval}
//                 min={1}
//                 max={12}
//                 unit="week"
//                 unitPlural="weeks"
//                 onChange={(newInterval) => onChange(newInterval, daysOfWeek)}
//                 presets={[
//                     { value: 1, label: 'Every Week' },
//                     { value: 2, label: 'Every 2 Weeks' },
//                     { value: 4, label: 'Monthly' }
//                 ]}
//             />

//             <div>
//                 <div className="flex items-center justify-between mb-2">
//                     <Label className="text-sm font-medium">On these days</Label>
//                     <div className="flex gap-2">
//                         <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => setDays([1, 2, 3, 4, 5])}
//                             className="text-xs h-7"
//                         >
//                             Weekdays
//                         </Button>
//                         <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => setDays([0, 6])}
//                             className="text-xs h-7"
//                         >
//                             Weekend
//                         </Button>
//                         <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}
//                             className="text-xs h-7"
//                         >
//                             All Days
//                         </Button>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-7 gap-2">
//                     {dayLabels.map((day, index) => {
//                         const isSelected = daysOfWeek.includes(index);
//                         return (
//                             <Button
//                                 key={index}
//                                 variant={isSelected ? "primary" : "outline"}
//                                 size="lg"
//                                 onClick={() => toggleDay(index)}
//                                 className={cn(
//                                     "h-12 flex flex-col items-center justify-center",
//                                     isSelected && "ring-2 ring-primary ring-offset-2"
//                                 )}
//                             >
//                                 <span className="text-xs font-medium">{day}</span>
//                             </Button>
//                         );
//                     })}
//                 </div>

//                 {daysOfWeek.length > 0 && (
//                     <p className="text-xs text-muted-foreground mt-2">
//                         Selected: {daysOfWeek.map(i => fullDayLabels[i]).join(', ')}
//                     </p>
//                 )}
//                 {daysOfWeek.length === 0 && (
//                     <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
//                         Please select at least one day
//                     </p>
//                 )}
//             </div>
//         </div>
//     );
// };


// // const MonthlyPatternConfig: React.FC<{
// //   interval: number;
// //   monthlyType: 'week-based' | 'date-based';
// //   daysOfWeek: number[];
// //   weekOfMonth: number[];
// //   dayOfMonth: number | undefined;
// //   onChange: (
// //     interval: number,
// //     monthlyType: 'week-based' | 'date-based',
// //     daysOfWeek: number[],
// //     weekOfMonth: number[],
// //     dayOfMonth: number | undefined
// //   ) => void;
// // }> = ({ interval, monthlyType, daysOfWeek, weekOfMonth, dayOfMonth, onChange }) => {
// //   const fullDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
// //   const weekLabels = [
// //     { value: 1, label: '1st' },
// //     { value: 2, label: '2nd' },
// //     { value: 3, label: '3rd' },
// //     { value: 4, label: '4th' },
// //     { value: -1, label: 'Last' }
// //   ];

// //   const toggleWeek = (week: number) => {
// //     const newWeeks = weekOfMonth.includes(week)
// //       ? weekOfMonth.filter(w => w !== week)
// //       : [...weekOfMonth, week].sort((a, b) => (a === -1 ? 1 : b === -1 ? -1 : a - b));
// //     onChange(interval, monthlyType, daysOfWeek, newWeeks, dayOfMonth);
// //   };

// //   return (
// //     <div className="space-y-4 pt-4">
// //       <div>
// //         <Label className="text-sm font-medium mb-2 block">Repeat every</Label>
// //         <div className="flex items-center gap-2">
// //           <Input
// //             type="number"
// //             min={1}
// //             max={12}
// //             value={interval}
// //             onChange={(e) => onChange(Math.max(1, Number(e.target.value)), monthlyType, daysOfWeek, weekOfMonth, dayOfMonth)}
// //             className="w-24"
// //           />
// //           <span className="text-sm text-muted-foreground">month(s)</span>
// //         </div>
// //       </div>

// //       <Tabs 
// //         value={monthlyType} 
// //         onValueChange={(value) => onChange(interval, value as 'week-based' | 'date-based', daysOfWeek, weekOfMonth, dayOfMonth)}
// //       >
// //         <TabsList className="grid w-full grid-cols-2">
// //           <TabsTrigger value="week-based">By Week</TabsTrigger>
// //           <TabsTrigger value="date-based">By Date</TabsTrigger>
// //         </TabsList>

// //         <TabsContent value="week-based" className="space-y-4 mt-4">
// //           <div>
// //             <Label className="text-sm font-medium mb-2 block">On</Label>
// //             <Select
// //               value={daysOfWeek[0]?.toString() || '1'}
// //               onValueChange={(value) => onChange(interval, monthlyType, [Number(value)], weekOfMonth, undefined)}
// //             >
// //               <SelectTrigger>
// //                 <SelectValue placeholder="Select day" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {fullDayLabels.map((day, index) => (
// //                   <SelectItem key={index} value={index.toString()}>
// //                     {day}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //           </div>

// //           <div>
// //             <Label className="text-sm font-medium mb-2 block">Which week(s)?</Label>
// //             <div className="grid grid-cols-5 gap-2">
// //               {weekLabels.map(week => {
// //                 const isSelected = weekOfMonth.includes(week.value);
// //                 return (
// //                   <Button
// //                     key={week.value}
// //                     variant={isSelected ? "primary" : "outline"}
// //                     size="lg"
// //                     onClick={() => toggleWeek(week.value)}
// //                     className={cn(
// //                       "h-12",
// //                       isSelected && "ring-2 ring-primary ring-offset-2"
// //                     )}
// //                   >
// //                     {week.label}
// //                   </Button>
// //                 );
// //               })}
// //             </div>
// //             {weekOfMonth.length === 0 && (
// //               <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
// //                 Please select at least one week
// //               </p>
// //             )}
// //           </div>
// //         </TabsContent>

// //         <TabsContent value="date-based" className="mt-4">
// //           <div>
// //             <Label className="text-sm font-medium mb-2 block">On day</Label>
// //             <Select
// //               value={dayOfMonth?.toString() || '1'}
// //               onValueChange={(value) => onChange(interval, monthlyType, [], [], Number(value))}
// //             >
// //               <SelectTrigger>
// //                 <SelectValue placeholder="Select day" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
// //                   <SelectItem key={day} value={day.toString()}>
// //                     Day {day}
// //                   </SelectItem>
// //                 ))}
// //                 <SelectItem value="-1">Last day of month</SelectItem>
// //               </SelectContent>
// //             </Select>
// //             <p className="text-xs text-muted-foreground mt-2">
// //               If day doesn't exist in month, uses last day of that month
// //             </p>
// //           </div>
// //         </TabsContent>
// //       </Tabs>
// //     </div>
// //   );
// // };


// const MonthlyPatternConfig: React.FC<{
//     interval: number;
//     monthlyType: 'week-based' | 'date-based';
//     daysOfWeek: number[];
//     weekOfMonth: number[];
//     dayOfMonth: number | undefined;
//     startDate: Date;
//     minStartDate: Date;
//     onChange: (
//         interval: number,
//         monthlyType: 'week-based' | 'date-based',
//         daysOfWeek: number[],
//         weekOfMonth: number[],
//         dayOfMonth: number | undefined
//     ) => void;
//     onStartDateChange: (date: Date) => void;
// }> = ({ interval, monthlyType, daysOfWeek, weekOfMonth, dayOfMonth, startDate, minStartDate, onChange, onStartDateChange }) => {
//     const fullDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//     const weekLabels = [
//         { value: 1, label: '1st' },
//         { value: 2, label: '2nd' },
//         { value: 3, label: '3rd' },
//         { value: 4, label: '4th' },
//         { value: -1, label: 'Last' }
//     ];

//     const toggleWeek = (week: number) => {
//         const newWeeks = weekOfMonth.includes(week)
//             ? weekOfMonth.filter(w => w !== week)
//             : [...weekOfMonth, week].sort((a, b) => (a === -1 ? 1 : b === -1 ? -1 : a - b));
//         onChange(interval, monthlyType, daysOfWeek, newWeeks, dayOfMonth);
//     };

//     return (
//         <div className="space-y-4 pt-4">
//             <div>
//                 <Label className="text-sm font-medium mb-2 block">Start Date</Label>
//                 <Input
//                     type="date"
//                     value={startDate.toISOString().split('T')[0]}
//                     onChange={(e) => {
//                         const newDate = new Date(e.target.value);
//                         onStartDateChange(newDate);
//                     }}
//                     min={minStartDate.toISOString().split('T')[0]}
//                     className="w-full"
//                 />
//                 <p className="text-xs text-muted-foreground mt-2">
//                     Select the start date for the recurring events
//                 </p>
//             </div>
            
//             <IntervalSlider
//                 value={interval}
//                 min={1}
//                 max={12}
//                 unit="month"
//                 unitPlural="months"
//                 onChange={(newInterval) => onChange(newInterval, monthlyType, daysOfWeek, weekOfMonth, dayOfMonth)}
//                 presets={[
//                     { value: 1, label: 'Every Month' },
//                     { value: 2, label: 'Every 2 Months' },
//                     { value: 3, label: 'Quarterly' },
//                     { value: 6, label: 'Bi-Annual' }
//                 ]}
//             />

//             <Tabs
//                 value={monthlyType}
//                 onValueChange={(value) => onChange(interval, value as 'week-based' | 'date-based', daysOfWeek, weekOfMonth, dayOfMonth)}
//             >
//                 <TabsList className="grid w-full grid-cols-2">
//                     <TabsTrigger value="week-based">By Week</TabsTrigger>
//                     <TabsTrigger value="date-based">By Date</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="week-based" className="space-y-4 mt-4">
//                     <div>
//                         <Label className="text-sm font-medium mb-2 block">On</Label>
//                         <Select
//                             value={daysOfWeek[0]?.toString() || '1'}
//                             onValueChange={(value) => onChange(interval, monthlyType, [Number(value)], weekOfMonth, undefined)}
//                         >
//                             <SelectTrigger>
//                                 <SelectValue placeholder="Select day" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {fullDayLabels.map((day, index) => (
//                                     <SelectItem key={index} value={index.toString()}>
//                                         {day}
//                                     </SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>

//                     <div>
//                         <Label className="text-sm font-medium mb-2 block">Which week(s)?</Label>
//                         <div className="grid grid-cols-5 gap-2">
//                             {weekLabels.map(week => {
//                                 const isSelected = weekOfMonth.includes(week.value);
//                                 return (
//                                     <Button
//                                         key={week.value}
//                                         variant={isSelected ? "primary" : "outline"}
//                                         size="lg"
//                                         onClick={() => toggleWeek(week.value)}
//                                         className={cn(
//                                             "h-12",
//                                             isSelected && "ring-2 ring-primary ring-offset-2"
//                                         )}
//                                     >
//                                         {week.label}
//                                     </Button>
//                                 );
//                             })}
//                         </div>
//                         {weekOfMonth.length === 0 && (
//                             <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
//                                 Please select at least one week
//                             </p>
//                         )}
//                     </div>
//                 </TabsContent>

//                 <TabsContent value="date-based" className="mt-4">
//                     <div>
//                         <Label className="text-sm font-medium mb-2 block">On day</Label>
//                         <Select
//                             value={dayOfMonth?.toString() || '1'}
//                             onValueChange={(value) => onChange(interval, monthlyType, [], [], Number(value))}
//                         >
//                             <SelectTrigger>
//                                 <SelectValue placeholder="Select day" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
//                                     <SelectItem key={day} value={day.toString()}>
//                                         Day {day}
//                                     </SelectItem>
//                                 ))}
//                                 <SelectItem value="-1">Last day of month</SelectItem>
//                             </SelectContent>
//                         </Select>
//                         <p className="text-xs text-muted-foreground mt-2">
//                             If day doesn't exist in month, uses last day of that month
//                         </p>
//                     </div>
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// };

// const TerminationConfig: React.FC<{
//     terminationType: 'endDate' | 'occurrences';
//     endDate: Date | undefined;
//     occurrences: number | undefined;
//     maxEvents: number;
//     minStartDate: Date;
//     onChange: (type: 'endDate' | 'occurrences', endDate?: Date, occurrences?: number) => void;
// }> = ({ terminationType, endDate, occurrences, maxEvents, minStartDate, onChange }) => {
//     return (
//         <div className="space-y-4 pt-4 border-t mt-4">
//             <Label className="text-sm font-medium">Ends</Label>

//             <RadioGroup
//                 value={terminationType}
//                 onValueChange={(value) => onChange(value as 'endDate' | 'occurrences', endDate, occurrences)}
//             >
//                 <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="endDate" id="end-date" />
//                     <Label htmlFor="end-date" className="font-normal flex-1 cursor-pointer">
//                         On date
//                     </Label>
//                     <Input
//                         type="date"
//                         disabled={terminationType !== 'endDate'}
//                         value={endDate ? endDate.toISOString().split('T')[0] : ''}
//                         onChange={(e) => onChange('endDate', new Date(e.target.value), undefined)}
//                         min={minStartDate.toISOString().split('T')[0]}
//                         className="w-40"
//                     />
//                 </div>

//                 <div className="flex items-center space-x-2">
//                     <RadioGroupItem value="occurrences" id="occurrences" />
//                     <Label htmlFor="occurrences" className="font-normal flex-1 cursor-pointer">
//                         After
//                     </Label>
//                     <Input
//                         type="number"
//                         min={1}
//                         max={maxEvents}
//                         disabled={terminationType !== 'occurrences'}
//                         value={occurrences || ''}
//                         onChange={(e) => onChange('occurrences', undefined, Number(e.target.value))}
//                         className="w-24"
//                     />
//                     <span className="text-sm text-muted-foreground">event(s)</span>
//                 </div>
//             </RadioGroup>

//             {terminationType === 'occurrences' && occurrences && occurrences > maxEvents && (
//                 <Alert variant="destructive">
//                     <AlertCircle className="h-4 w-4" />
//                     <AlertDescription>
//                         Maximum {maxEvents} events allowed. Please reduce the number of occurrences.
//                     </AlertDescription>
//                 </Alert>
//             )}
//         </div>
//     );
// };

// const ExceptionDates: React.FC<{
//     exceptions: Date[];
//     minStartDate: Date;
//     onChange: (exceptions: Date[]) => void;
// }> = ({ exceptions, minStartDate, onChange }) => {
//     const [isExpanded, setIsExpanded] = useState(false);

//     const addException = () => {
//         onChange([...exceptions, new Date()]);
//     };

//     const removeException = (index: number) => {
//         onChange(exceptions.filter((_, i) => i !== index));
//     };

//     const updateException = (index: number, date: Date) => {
//         const newExceptions = [...exceptions];
//         newExceptions[index] = date;
//         onChange(newExceptions);
//     };

//     return (
//         <div className="pt-4 border-t">
//             <button
//                 onClick={() => setIsExpanded(!isExpanded)}
//                 className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
//             >
//                 {isExpanded ? (
//                     <ChevronDown className="h-4 w-4" />
//                 ) : (
//                     <ChevronRight className="h-4 w-4" />
//                 )}
//                 <span>Skip specific dates (optional)</span>
//                 {exceptions.length > 0 && (
//                     <Badge variant="secondary" className="ml-2">
//                         {exceptions.length}
//                     </Badge>
//                 )}
//             </button>

//             {isExpanded && (
//                 <div className="mt-4 space-y-2">
//                     {exceptions.map((date, index) => (
//                         <div key={index} className="flex items-center gap-2">
//                             <Input
//                                 type="date"
//                                 value={date.toISOString().split('T')[0]}
//                                 onChange={(e) => updateException(index, new Date(e.target.value))}
//                                 min={minStartDate.toISOString().split('T')[0]}
//                                 className="flex-1"
//                             />
//                             <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 onClick={() => removeException(index)}
//                             >
//                                 <X className="h-4 w-4" />
//                             </Button>
//                         </div>
//                     ))}

//                     <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={addException}
//                         className="w-full"
//                     >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Add Exception Date
//                     </Button>

//                     <p className="text-xs text-muted-foreground">
//                         Events will not be created on these dates
//                     </p>
//                 </div>
//             )}
//         </div>
//     );
// };

// const RecurrencePreview: React.FC<{
//     occurrences: Date[];
//     maxEvents: number;
// }> = ({ occurrences, maxEvents }) => {
//     return (
//         <div className="space-y-3 pt-4 border-t mt-4">
//             <div className="flex items-center justify-between">
//                 <Label className="text-sm font-medium">Preview</Label>
//                 <Badge variant={occurrences.length > maxEvents ? "destructive" : "secondary"}>
//                     {occurrences.length} event{occurrences.length !== 1 ? 's' : ''}
//                 </Badge>
//             </div>

//             {occurrences.length > 0 ? (
//                 <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2">
//                     {occurrences.slice(0, 10).map((date, index) => (
//                         <div
//                             key={index}
//                             className="flex items-center gap-2 text-sm p-2 bg-muted rounded"
//                         >
//                             <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
//                             <span>
//                                 {date.toLocaleDateString('en-US', {
//                                     weekday: 'short',
//                                     month: 'short',
//                                     day: 'numeric',
//                                     year: 'numeric'
//                                 })}
//                             </span>
//                         </div>
//                     ))}

//                     {occurrences.length > 10 && (
//                         <div className="text-xs text-muted-foreground text-center pt-2 border-t">
//                             ... and {occurrences.length - 10} more event{occurrences.length - 10 !== 1 ? 's' : ''}
//                         </div>
//                     )}
//                 </div>
//             ) : (
//                 <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
//                     <Info className="h-8 w-8 mb-2 opacity-50" />
//                     <p className="text-sm">Configure recurrence to see preview</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// // ==================== MAIN COMPONENT ====================

// // ==================== MAIN COMPONENT ====================

// export function RecurrenceScheduler({
//     initialConfig,
//     onChange,
//     minStartDate = new Date(),
//     defaultStartDate = new Date(),
//     maxEvents = 100,
//     enabledPatterns = ['daily', 'weekly', 'monthly', 'none'],
//     compact = false,
//     showPreview = true
// }: RecurrenceSchedulerProps) {
//     const [pattern, setPattern] = useState<RecurrenceConfig['pattern']>(
//         initialConfig?.pattern || 'weekly'
//     );
//     const [interval, setInterval] = useState(initialConfig?.interval || 1);
//     const [startDate, setStartDate] = useState<Date>(initialConfig?.startDate || new Date());
//     const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialConfig?.daysOfWeek || []);
//     const [weekOfMonth, setWeekOfMonth] = useState<number[]>(initialConfig?.weekOfMonth || []);
//     const [dayOfMonth, setDayOfMonth] = useState<number | undefined>(initialConfig?.dayOfMonth);
//     const [monthlyType, setMonthlyType] = useState<'week-based' | 'date-based'>(
//         initialConfig?.weekOfMonth ? 'week-based' : 'date-based'
//     );
//     const [terminationType, setTerminationType] = useState<'endDate' | 'occurrences'>(
//         initialConfig?.endDate ? 'endDate' : 'occurrences'
//     );
//     const [endDate, setEndDate] = useState<Date | undefined>(initialConfig?.endDate);
//     const [occurrences, setOccurrences] = useState<number | undefined>(
//         initialConfig?.occurrences || 12
//     );
//     const [exceptions, setExceptions] = useState<Date[]>(initialConfig?.exceptions || []);

//     const currentConfig: RecurrenceConfig = useMemo(() => {
//         const config: RecurrenceConfig = {
//             pattern,
//             interval,
//             startDate,
//             exceptions: exceptions.length > 0 ? exceptions : undefined
//         };

//         if (pattern === 'weekly') {
//             config.daysOfWeek = daysOfWeek;
//         }

//         if (pattern === 'monthly') {
//             if (monthlyType === 'week-based') {
//                 config.daysOfWeek = daysOfWeek;
//                 config.weekOfMonth = weekOfMonth;
//             } else {
//                 config.dayOfMonth = dayOfMonth;
//             }
//         }

//         if (pattern !== 'none') {
//             if (terminationType === 'endDate' && endDate) {
//                 config.endDate = endDate;
//             } else if (terminationType === 'occurrences' && occurrences) {
//                 config.occurrences = occurrences;
//             }
//         }

//         return config;
//     }, [pattern, interval, startDate, daysOfWeek, weekOfMonth, dayOfMonth, monthlyType, terminationType, endDate, occurrences, exceptions]);

//     const calculatedOccurrences = useMemo(() => {
//         if (pattern === 'none') return [startDate];

//         if (pattern === 'weekly' && daysOfWeek.length === 0) return [];
//         if (pattern === 'monthly' && monthlyType === 'week-based' && (weekOfMonth.length === 0 || daysOfWeek.length === 0)) return [];
//         if (pattern === 'monthly' && monthlyType === 'date-based' && dayOfMonth === undefined) return [];
//         if (terminationType === 'occurrences' && !occurrences) return [];
//         if (terminationType === 'endDate' && !endDate) return [];

//         return calculateOccurrences(currentConfig, startDate);
//     }, [currentConfig, startDate, pattern, daysOfWeek, weekOfMonth, monthlyType, dayOfMonth, terminationType, occurrences, endDate]);

//     useEffect(() => {
//         onChange(currentConfig);
//     }, [currentConfig, onChange]);

//     const isValid = useMemo(() => {
//         if (pattern === 'none') return true;
//         if (pattern === 'weekly' && daysOfWeek.length === 0) return false;
//         if (pattern === 'monthly' && monthlyType === 'week-based' && (weekOfMonth.length === 0 || daysOfWeek.length === 0)) return false;
//         if (pattern === 'monthly' && monthlyType === 'date-based' && dayOfMonth === undefined) return false;
//         if (terminationType === 'occurrences' && (!occurrences || occurrences > maxEvents)) return false;
//         if (terminationType === 'endDate' && !endDate) return false;
//         return true;
//     }, [pattern, daysOfWeek, weekOfMonth, monthlyType, dayOfMonth, terminationType, occurrences, endDate, maxEvents]);

//     const gridColsClass = useMemo(() => {
//         const count = enabledPatterns.length;
//         return GRID_COLS_MAP[count] || 'grid-cols-4';
//     }, [enabledPatterns]);

//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle className="flex items-center gap-2 text-base">
//                     <Calendar className="h-4 w-4" />
//                     Schedule Recurrence
//                 </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//                 <Tabs value={pattern} onValueChange={(value) => setPattern(value as RecurrenceConfig['pattern'])}>
//                     <TabsList className={cn("grid w-full", gridColsClass)}>
//                         {enabledPatterns.includes('none') && <TabsTrigger value="none">One-Time</TabsTrigger>}
//                         {enabledPatterns.includes('daily') && <TabsTrigger value="daily">Daily</TabsTrigger>}
//                         {enabledPatterns.includes('weekly') && <TabsTrigger value="weekly">Weekly</TabsTrigger>}
//                         {enabledPatterns.includes('monthly') && <TabsTrigger value="monthly">Monthly</TabsTrigger>}
//                     </TabsList>

//                     <TabsContent value="none" className="space-y-4">
//                         <div className="pt-4 space-y-4">
//                             <div className="text-center py-4">
//                                 <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50 text-muted-foreground" />
//                                 <p className="text-sm text-muted-foreground">Single event - no recurrence</p>
//                             </div>

//                             <div>
//                                 <Label className="text-sm font-medium mb-2 block">Event Date</Label>
//                                 <Input
//                                     type="date"
//                                     value={startDate.toISOString().split('T')[0]}
//                                     onChange={(e) => {
//                                         const newDate = new Date(e.target.value);
//                                         setStartDate(newDate);
//                                     }}
//                                     min={minStartDate.toISOString().split('T')[0]}
//                                     className="w-full"
//                                 />
//                                 <p className="text-xs text-muted-foreground mt-2">
//                                     Select the date for this event
//                                 </p>
//                             </div>
//                         </div>
//                     </TabsContent>

//                     <TabsContent value="daily">
//                         <DailyPatternConfig
//                             interval={interval}
//                             startDate={startDate}
//                             minStartDate={minStartDate}
//                             onChange={setInterval}
//                             onStartDateChange={setStartDate}
//                         />
//                     </TabsContent>

//                     <TabsContent value="weekly">
//                         <WeeklyPatternConfig
//                             interval={interval}
//                             daysOfWeek={daysOfWeek}
//                             startDate={startDate}
//                             minStartDate={minStartDate}
//                             onChange={(newInterval, newDaysOfWeek) => {
//                                 setInterval(newInterval);
//                                 setDaysOfWeek(newDaysOfWeek);
//                             }}
//                             onStartDateChange={setStartDate}
//                         />
//                     </TabsContent>

//                     <TabsContent value="monthly">
//                         <MonthlyPatternConfig
//                             interval={interval}
//                             monthlyType={monthlyType}
//                             daysOfWeek={daysOfWeek}
//                             weekOfMonth={weekOfMonth}
//                             dayOfMonth={dayOfMonth}
//                             startDate={startDate}
//                             minStartDate={minStartDate}
//                             onChange={(newInterval, newMonthlyType, newDaysOfWeek, newWeekOfMonth, newDayOfMonth) => {
//                                 setInterval(newInterval);
//                                 setMonthlyType(newMonthlyType);
//                                 setDaysOfWeek(newDaysOfWeek);
//                                 setWeekOfMonth(newWeekOfMonth);
//                                 setDayOfMonth(newDayOfMonth);
//                             }}
//                             onStartDateChange={setStartDate}
//                         />
//                     </TabsContent>
//                 </Tabs>

//                 {pattern !== 'none' && (
//                     <TerminationConfig
//                         terminationType={terminationType}
//                         endDate={endDate}
//                         occurrences={occurrences}
//                         maxEvents={maxEvents}
//                         minStartDate={minStartDate}
//                         onChange={(type, newEndDate, newOccurrences) => {
//                             setTerminationType(type);
//                             if (type === 'endDate') {
//                                 setEndDate(newEndDate);
//                                 setOccurrences(undefined);
//                             } else {
//                                 setOccurrences(newOccurrences);
//                                 setEndDate(undefined);
//                             }
//                         }}
//                     />
//                 )}

//                 {pattern !== 'none' && !compact && (
//                     <ExceptionDates
//                         exceptions={exceptions}
//                         minStartDate={minStartDate}
//                         onChange={setExceptions}
//                     />
//                 )}

//                 {showPreview && pattern !== 'none' && (
//                     <RecurrencePreview
//                         occurrences={calculatedOccurrences}
//                         maxEvents={maxEvents}
//                     />
//                 )}

//                 {!isValid && pattern !== 'none' && (
//                     <Alert variant="destructive">
//                         <AlertCircle className="h-4 w-4" />
//                         <AlertDescription>
//                             {pattern === 'weekly' && daysOfWeek.length === 0 && 'Please select at least one day of the week'}
//                             {pattern === 'monthly' && monthlyType === 'week-based' && weekOfMonth.length === 0 && 'Please select at least one week'}
//                             {pattern === 'monthly' && monthlyType === 'week-based' && daysOfWeek.length === 0 && 'Please select a day of the week'}
//                             {pattern === 'monthly' && monthlyType === 'date-based' && dayOfMonth === undefined && 'Please select a day of the month'}
//                             {terminationType === 'occurrences' && !occurrences && 'Please specify number of occurrences'}
//                             {terminationType === 'occurrences' && occurrences && occurrences > maxEvents && `Maximum ${maxEvents} occurrences allowed`}
//                             {terminationType === 'endDate' && !endDate && 'Please select an end date'}
//                         </AlertDescription>
//                     </Alert>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }



// reccurence-scheduler.tsx (IMPROVED UX VERSION)

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar,
    AlertCircle,
    Plus,
    X,
    ChevronDown,
    ChevronRight,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== CONSTANTS ====================

const GRID_COLS_MAP: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
};

// ==================== TYPES ====================

interface RecurrenceConfig {
    pattern: 'daily' | 'weekly' | 'monthly' | 'none';
    interval: number;
    startDate?: Date;
    daysOfWeek?: number[];
    weekOfMonth?: number[];
    dayOfMonth?: number;
    endDate?: Date;
    occurrences?: number;
    exceptions?: Date[];
}

interface RecurrenceSchedulerProps {
    initialConfig?: RecurrenceConfig;
    onChange: (config: RecurrenceConfig) => void;
    minStartDate?: Date;
    defaultStartDate?: Date;
    maxEvents?: number;
    enabledPatterns?: ('daily' | 'weekly' | 'monthly' | 'none')[];
    compact?: boolean;
    showPreview?: boolean;
}

// ==================== UTILITIES ====================

const calculateOccurrences = (
    config: RecurrenceConfig,
    startDate: Date = new Date()
): Date[] => {
    if (config.pattern === 'none') return [startDate];

    const occurrences: Date[] = [];
    const maxCount = config.occurrences || 100;
    const endDate = config.endDate;
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    const addOccurrence = (date: Date) => {
        const dateToAdd = new Date(date);
        const isException = config.exceptions?.some(
            ex => ex.toISOString().split('T')[0] === dateToAdd.toISOString().split('T')[0]
        );
        if (!isException) {
            occurrences.push(new Date(dateToAdd));
        }
    };

    if (config.pattern === 'daily') {
        while (occurrences.length < maxCount) {
            if (endDate && currentDate > endDate) break;
            addOccurrence(currentDate);
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + config.interval));
        }
    }

    if (config.pattern === 'weekly' && config.daysOfWeek?.length) {
        let weekCount = 0;
        while (occurrences.length < maxCount) {
            if (endDate && currentDate > endDate) break;

            const weekStart = new Date(startDate);
            weekStart.setDate(startDate.getDate() + (weekCount * 7 * config.interval));

            config.daysOfWeek.forEach(dayIndex => {
                const date = new Date(weekStart);
                const dayDiff = (dayIndex - weekStart.getDay() + 7) % 7;
                date.setDate(weekStart.getDate() + dayDiff);

                if (date >= startDate && (!endDate || date <= endDate)) {
                    if (occurrences.length < maxCount) {
                        addOccurrence(date);
                    }
                }
            });

            weekCount++;
            if (weekCount > 500) break;
        }
    }

    if (config.pattern === 'monthly') {
        let monthCount = 0;

        while (occurrences.length < maxCount) {
            const targetDate = new Date(startDate);
            targetDate.setMonth(startDate.getMonth() + (monthCount * config.interval));

            if (endDate && targetDate > endDate) break;

            if (config.weekOfMonth && config.daysOfWeek?.length) {
                config.weekOfMonth.forEach(weekNum => {
                    const date = getNthWeekdayOfMonth(
                        targetDate.getFullYear(),
                        targetDate.getMonth(),
                        config.daysOfWeek![0],
                        weekNum
                    );

                    if (date && date >= startDate && (!endDate || date <= endDate)) {
                        if (occurrences.length < maxCount) {
                            addOccurrence(date);
                        }
                    }
                });
            } else if (config.dayOfMonth !== undefined) {
                const date = new Date(
                    targetDate.getFullYear(),
                    targetDate.getMonth(),
                    config.dayOfMonth === -1
                        ? new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate()
                        : Math.min(config.dayOfMonth, new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate())
                );

                if (date >= startDate && (!endDate || date <= endDate)) {
                    addOccurrence(date);
                }
            }

            monthCount++;
            if (monthCount > 120) break;
        }
    }

    return occurrences.sort((a, b) => a.getTime() - b.getTime()).slice(0, maxCount);
};

const getNthWeekdayOfMonth = (
    year: number,
    month: number,
    dayOfWeek: number,
    weekNumber: number
): Date | null => {
    if (weekNumber === -1) {
        const lastDay = new Date(year, month + 1, 0);
        const lastDayOfWeek = lastDay.getDay();
        const daysBack = (lastDayOfWeek - dayOfWeek + 7) % 7;
        return new Date(year, month, lastDay.getDate() - daysBack);
    }

    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    const daysUntilTarget = (dayOfWeek - firstDayOfWeek + 7) % 7;
    const targetDate = new Date(year, month, 1 + daysUntilTarget + (weekNumber - 1) * 7);

    if (targetDate.getMonth() !== month) return null;
    return targetDate;
};

// ==================== SUB-COMPONENTS ====================

const IntervalSlider: React.FC<{
    value: number;
    min: number;
    max: number;
    unit: string;
    unitPlural: string;
    onChange: (value: number) => void;
    presets?: { value: number; label: string }[];
}> = ({ value, min, max, unit, unitPlural, onChange, presets }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleNumberClick = () => {
        setEditValue(value.toString());
        setIsEditing(true);
    };

    const handleBlur = () => {
        const numValue = parseInt(editValue);
        if (!isNaN(numValue) && numValue >= min && numValue <= max) {
            onChange(numValue);
        } else {
            setEditValue(value.toString());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setEditValue(value.toString());
            setIsEditing(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-4">
                <Label className="text-sm font-medium whitespace-nowrap">Repeat every</Label>

                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Input
                            ref={inputRef}
                            type="number"
                            min={min}
                            max={max}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                            {value === 1 ? unit : unitPlural}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleNumberClick}
                            className="min-w-[3rem] px-3 py-1.5 text-2xl font-bold text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Click to edit"
                        >
                            {value}
                        </button>
                        <span className="text-sm text-muted-foreground">
                            {value === 1 ? unit : unitPlural}
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer 
                        [&::-webkit-slider-thumb]:appearance-none 
                        [&::-webkit-slider-thumb]:w-4 
                        [&::-webkit-slider-thumb]:h-4 
                        [&::-webkit-slider-thumb]:rounded-full 
                        [&::-webkit-slider-thumb]:bg-primary 
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-moz-range-thumb]:w-4 
                        [&::-moz-range-thumb]:h-4 
                        [&::-moz-range-thumb]:rounded-full 
                        [&::-moz-range-thumb]:bg-primary 
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:cursor-pointer"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{min}</span>
                    <span>{max}</span>
                </div>
            </div>

            {presets && presets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                        <Button
                            key={preset.value}
                            variant="outline"
                            size="sm"
                            onClick={() => onChange(preset.value)}
                            className={cn(value === preset.value && "border-primary bg-primary/5")}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
};

const DailyPatternConfig: React.FC<{
    interval: number;
    onChange: (interval: number) => void;
}> = ({ interval, onChange }) => {
    return (
        <div className="space-y-4">
            <IntervalSlider
                value={interval}
                min={1}
                max={30}
                unit="day"
                unitPlural="days"
                onChange={onChange}
                presets={[
                    { value: 1, label: 'Every Day' },
                    { value: 2, label: 'Every Other Day' },
                    { value: 3, label: 'Every 3 Days' },
                    { value: 7, label: 'Weekly' }
                ]}
            />
        </div>
    );
};

const WeeklyPatternConfig: React.FC<{
    interval: number;
    daysOfWeek: number[];
    onChange: (interval: number, daysOfWeek: number[]) => void;
}> = ({ interval, daysOfWeek, onChange }) => {
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const fullDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const toggleDay = (dayIndex: number) => {
        const newDays = daysOfWeek.includes(dayIndex)
            ? daysOfWeek.filter(d => d !== dayIndex)
            : [...daysOfWeek, dayIndex].sort((a, b) => a - b);
        onChange(interval, newDays);
    };

    const setDays = (days: number[]) => {
        onChange(interval, days);
    };

    return (
        <div className="space-y-4">
            <IntervalSlider
                value={interval}
                min={1}
                max={12}
                unit="week"
                unitPlural="weeks"
                onChange={(newInterval) => onChange(newInterval, daysOfWeek)}
                presets={[
                    { value: 1, label: 'Every Week' },
                    { value: 2, label: 'Every 2 Weeks' },
                    { value: 4, label: 'Monthly' }
                ]}
            />

            <div>
                <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">On these days</Label>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDays([1, 2, 3, 4, 5])}
                            className="text-xs h-7"
                        >
                            Weekdays
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDays([0, 6])}
                            className="text-xs h-7"
                        >
                            Weekend
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDays([0, 1, 2, 3, 4, 5, 6])}
                            className="text-xs h-7"
                        >
                            All Days
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {dayLabels.map((day, index) => {
                        const isSelected = daysOfWeek.includes(index);
                        return (
                            <Button
                                key={index}
                                variant={isSelected ? "primary" : "outline"}
                                size="lg"
                                onClick={() => toggleDay(index)}
                                className={cn(
                                    "h-12 flex items-center justify-center transition-all",
                                    isSelected && "ring-2 ring-primary ring-offset-1"
                                )}
                            >
                                <span className="text-xs font-medium">{day}</span>
                            </Button>
                        );
                    })}
                </div>

                {daysOfWeek.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Selected: {daysOfWeek.map(i => fullDayLabels[i]).join(', ')}
                    </p>
                )}
                {daysOfWeek.length === 0 && (
                    <div className="flex items-center gap-2 mt-2 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="h-3 w-3" />
                        <p className="text-xs">Please select at least one day</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const MonthlyPatternConfig: React.FC<{
    interval: number;
    monthlyType: 'week-based' | 'date-based';
    daysOfWeek: number[];
    weekOfMonth: number[];
    dayOfMonth: number | undefined;
    onChange: (
        interval: number,
        monthlyType: 'week-based' | 'date-based',
        daysOfWeek: number[],
        weekOfMonth: number[],
        dayOfMonth: number | undefined
    ) => void;
}> = ({ interval, monthlyType, daysOfWeek, weekOfMonth, dayOfMonth, onChange }) => {
    const fullDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekLabels = [
        { value: 1, label: '1st' },
        { value: 2, label: '2nd' },
        { value: 3, label: '3rd' },
        { value: 4, label: '4th' },
        { value: -1, label: 'Last' }
    ];

    const toggleWeek = (week: number) => {
        const newWeeks = weekOfMonth.includes(week)
            ? weekOfMonth.filter(w => w !== week)
            : [...weekOfMonth, week].sort((a, b) => (a === -1 ? 1 : b === -1 ? -1 : a - b));
        onChange(interval, monthlyType, daysOfWeek, newWeeks, dayOfMonth);
    };

    return (
        <div className="space-y-4">
            <IntervalSlider
                value={interval}
                min={1}
                max={12}
                unit="month"
                unitPlural="months"
                onChange={(newInterval) => onChange(newInterval, monthlyType, daysOfWeek, weekOfMonth, dayOfMonth)}
                presets={[
                    { value: 1, label: 'Every Month' },
                    { value: 2, label: 'Every 2 Months' },
                    { value: 3, label: 'Quarterly' },
                    { value: 6, label: 'Bi-Annual' }
                ]}
            />

            <Tabs
                value={monthlyType}
                onValueChange={(value) => onChange(interval, value as 'week-based' | 'date-based', daysOfWeek, weekOfMonth, dayOfMonth)}
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="week-based">By Week</TabsTrigger>
                    <TabsTrigger value="date-based">By Date</TabsTrigger>
                </TabsList>

                <TabsContent value="week-based" className="space-y-4 mt-4">
                    <div>
                        <Label className="text-sm font-medium mb-2 block">On</Label>
                        <Select
                            value={daysOfWeek[0]?.toString() || '1'}
                            onValueChange={(value) => onChange(interval, monthlyType, [Number(value)], weekOfMonth, undefined)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                                {fullDayLabels.map((day, index) => (
                                    <SelectItem key={index} value={index.toString()}>
                                        {day}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-sm font-medium mb-2 block">Which week(s)?</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {weekLabels.map(week => {
                                const isSelected = weekOfMonth.includes(week.value);
                                return (
                                    <Button
                                        key={week.value}
                                        variant={isSelected ? "primary" : "outline"}
                                        size="lg"
                                        onClick={() => toggleWeek(week.value)}
                                        className={cn(
                                            "h-12 transition-all",
                                            isSelected && "ring-2 ring-primary ring-offset-1"
                                        )}
                                    >
                                        {week.label}
                                    </Button>
                                );
                            })}
                        </div>
                        {weekOfMonth.length === 0 && (
                            <div className="flex items-center gap-2 mt-2 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="h-3 w-3" />
                                <p className="text-xs">Please select at least one week</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="date-based" className="mt-4">
                    <div>
                        <Label className="text-sm font-medium mb-2 block">On day</Label>
                        <Select
                            value={dayOfMonth?.toString() || '1'}
                            onValueChange={(value) => onChange(interval, monthlyType, [], [], Number(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                    <SelectItem key={day} value={day.toString()}>
                                        Day {day}
                                    </SelectItem>
                                ))}
                                <SelectItem value="-1">Last day of month</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2">
                            If day doesn't exist in month, uses last day of that month
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

const TerminationConfig: React.FC<{
    terminationType: 'endDate' | 'occurrences';
    endDate: Date | undefined;
    occurrences: number | undefined;
    maxEvents: number;
    minStartDate: Date;
    onChange: (type: 'endDate' | 'occurrences', endDate?: Date, occurrences?: number) => void;
}> = ({ terminationType, endDate, occurrences, maxEvents, minStartDate, onChange }) => {
    return (
        <div className="space-y-4 pt-4 border-t mt-6">
            <Label className="text-sm font-medium">Ends</Label>

            <RadioGroup
                value={terminationType}
                onValueChange={(value) => onChange(value as 'endDate' | 'occurrences', endDate, occurrences)}
                className="space-y-3"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="endDate" id="end-date" />
                    <Label htmlFor="end-date" className="font-normal flex-1 cursor-pointer">
                        On date
                    </Label>
                    <Input
                        type="date"
                        disabled={terminationType !== 'endDate'}
                        value={endDate ? endDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => onChange('endDate', new Date(e.target.value), undefined)}
                        min={minStartDate.toISOString().split('T')[0]}
                        className="w-40"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="occurrences" id="occurrences" />
                    <Label htmlFor="occurrences" className="font-normal flex-1 cursor-pointer">
                        After
                    </Label>
                    <Input
                        type="number"
                        min={1}
                        max={maxEvents}
                        disabled={terminationType !== 'occurrences'}
                        value={occurrences || ''}
                        onChange={(e) => onChange('occurrences', undefined, Number(e.target.value))}
                        className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">event(s)</span>
                </div>
            </RadioGroup>

            {terminationType === 'occurrences' && occurrences && occurrences > maxEvents && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Maximum {maxEvents} events allowed. Please reduce the number of occurrences.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

const ExceptionDates: React.FC<{
    exceptions: Date[];
    minStartDate: Date;
    onChange: (exceptions: Date[]) => void;
}> = ({ exceptions, minStartDate, onChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const addException = () => {
        onChange([...exceptions, new Date()]);
    };

    const removeException = (index: number) => {
        onChange(exceptions.filter((_, i) => i !== index));
    };

    const updateException = (index: number, date: Date) => {
        const newExceptions = [...exceptions];
        newExceptions[index] = date;
        onChange(newExceptions);
    };

    return (
        <div className="pt-4 border-t">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
            >
                {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
                <span>Skip specific dates (optional)</span>
                {exceptions.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                        {exceptions.length}
                    </Badge>
                )}
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-2">
                    {exceptions.map((date, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={date.toISOString().split('T')[0]}
                                onChange={(e) => updateException(index, new Date(e.target.value))}
                                min={minStartDate.toISOString().split('T')[0]}
                                className="flex-1"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeException(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={addException}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exception Date
                    </Button>

                    <p className="text-xs text-muted-foreground">
                        Events will not be created on these dates
                    </p>
                </div>
            )}
        </div>
    );
};

const RecurrencePreview: React.FC<{
    occurrences: Date[];
    maxEvents: number;
}> = ({ occurrences, maxEvents }) => {
    return (
        <div className="space-y-3 pt-4 border-t mt-6">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Preview</Label>
                <Badge variant={occurrences.length > maxEvents ? "destructive" : "secondary"}>
                    {occurrences.length} event{occurrences.length !== 1 ? 's' : ''}
                </Badge>
            </div>

            {occurrences.length > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                    {occurrences.slice(0, 10).map((date, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-sm p-2 bg-background rounded transition-colors hover:bg-muted"
                        >
                            <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span>
                                {date.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </span>
                        </div>
                    ))}

                    {occurrences.length > 10 && (
                        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                            ... and {occurrences.length - 10} more event{occurrences.length - 10 !== 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border rounded-lg bg-muted/30">
                    <Info className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Configure recurrence to see preview</p>
                </div>
            )}
        </div>
    );
};

// ==================== MAIN COMPONENT (CONTINUED) ====================

export function RecurrenceScheduler({
    initialConfig,
    onChange,
    minStartDate = new Date(),
    defaultStartDate = new Date(),
    maxEvents = 100,
    enabledPatterns = ['daily', 'weekly', 'monthly', 'none'],
    compact = false,
    showPreview = true
}: RecurrenceSchedulerProps) {
    const [pattern, setPattern] = useState<RecurrenceConfig['pattern']>(
        initialConfig?.pattern || 'weekly'
    );
    const [interval, setInterval] = useState(initialConfig?.interval || 1);
    const [startDate, setStartDate] = useState<Date>(initialConfig?.startDate || defaultStartDate);
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialConfig?.daysOfWeek || []);
    const [weekOfMonth, setWeekOfMonth] = useState<number[]>(initialConfig?.weekOfMonth || []);
    const [dayOfMonth, setDayOfMonth] = useState<number | undefined>(initialConfig?.dayOfMonth);
    const [monthlyType, setMonthlyType] = useState<'week-based' | 'date-based'>(
        initialConfig?.weekOfMonth ? 'week-based' : 'date-based'
    );
    const [terminationType, setTerminationType] = useState<'endDate' | 'occurrences'>(
        initialConfig?.endDate ? 'endDate' : 'occurrences'
    );
    const [endDate, setEndDate] = useState<Date | undefined>(initialConfig?.endDate);
    const [occurrences, setOccurrences] = useState<number | undefined>(
        initialConfig?.occurrences || 12
    );
    const [exceptions, setExceptions] = useState<Date[]>(initialConfig?.exceptions || []);

    const currentConfig: RecurrenceConfig = useMemo(() => {
        const config: RecurrenceConfig = {
            pattern,
            interval,
            startDate,
            exceptions: exceptions.length > 0 ? exceptions : undefined
        };

        if (pattern === 'weekly') {
            config.daysOfWeek = daysOfWeek;
        }

        if (pattern === 'monthly') {
            if (monthlyType === 'week-based') {
                config.daysOfWeek = daysOfWeek;
                config.weekOfMonth = weekOfMonth;
            } else {
                config.dayOfMonth = dayOfMonth;
            }
        }

        if (pattern !== 'none') {
            if (terminationType === 'endDate' && endDate) {
                config.endDate = endDate;
            } else if (terminationType === 'occurrences' && occurrences) {
                config.occurrences = occurrences;
            }
        }

        return config;
    }, [pattern, interval, startDate, daysOfWeek, weekOfMonth, dayOfMonth, monthlyType, terminationType, endDate, occurrences, exceptions]);

    const calculatedOccurrences = useMemo(() => {
        if (pattern === 'none') return [startDate];

        if (pattern === 'weekly' && daysOfWeek.length === 0) return [];
        if (pattern === 'monthly' && monthlyType === 'week-based' && (weekOfMonth.length === 0 || daysOfWeek.length === 0)) return [];
        if (pattern === 'monthly' && monthlyType === 'date-based' && dayOfMonth === undefined) return [];
        if (terminationType === 'occurrences' && !occurrences) return [];
        if (terminationType === 'endDate' && !endDate) return [];

        return calculateOccurrences(currentConfig, startDate);
    }, [currentConfig, startDate, pattern, daysOfWeek, weekOfMonth, monthlyType, dayOfMonth, terminationType, occurrences, endDate]);

    useEffect(() => {
        onChange(currentConfig);
    }, [currentConfig, onChange]);

    const isValid = useMemo(() => {
        if (pattern === 'none') return true;
        if (pattern === 'weekly' && daysOfWeek.length === 0) return false;
        if (pattern === 'monthly' && monthlyType === 'week-based' && (weekOfMonth.length === 0 || daysOfWeek.length === 0)) return false;
        if (pattern === 'monthly' && monthlyType === 'date-based' && dayOfMonth === undefined) return false;
        if (terminationType === 'occurrences' && (!occurrences || occurrences > maxEvents)) return false;
        if (terminationType === 'endDate' && !endDate) return false;
        return true;
    }, [pattern, daysOfWeek, weekOfMonth, monthlyType, dayOfMonth, terminationType, occurrences, endDate, maxEvents]);

    const gridColsClass = useMemo(() => {
        const count = enabledPatterns.length;
        return GRID_COLS_MAP[count] || 'grid-cols-4';
    }, [enabledPatterns]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4" />
                    Schedule Recurrence
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* SECTION 1: START DATE - Always visible at top */}
                <div>
                    <Label className="text-sm font-medium mb-2 block">Start Date</Label>
                    <Input
                        type="date"
                        value={startDate.toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        min={minStartDate.toISOString().split('T')[0]}
                        className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {pattern === 'none' ? 'Date for this event' : 'First occurrence date'}
                    </p>
                </div>

                {/* SECTION 2: RECURRENCE PATTERN */}
                <div>
                    <Label className="text-sm font-medium mb-3 block">Recurrence Pattern</Label>
                    <Tabs value={pattern} onValueChange={(value) => setPattern(value as RecurrenceConfig['pattern'])}>
                        <TabsList className={cn("grid w-full", gridColsClass)}>
                            {enabledPatterns.includes('none') && <TabsTrigger value="none">One-Time</TabsTrigger>}
                            {enabledPatterns.includes('daily') && <TabsTrigger value="daily">Daily</TabsTrigger>}
                            {enabledPatterns.includes('weekly') && <TabsTrigger value="weekly">Weekly</TabsTrigger>}
                            {enabledPatterns.includes('monthly') && <TabsTrigger value="monthly">Monthly</TabsTrigger>}
                        </TabsList>

                        <TabsContent value="none" className="mt-4">
                            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground bg-muted/30 rounded-lg">
                                <Calendar className="h-10 w-10 mb-2 opacity-50" />
                                <p className="text-sm">Single event - no recurrence</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="daily" className="mt-4">
                            <DailyPatternConfig interval={interval} onChange={setInterval} />
                        </TabsContent>

                        <TabsContent value="weekly" className="mt-4">
                            <WeeklyPatternConfig
                                interval={interval}
                                daysOfWeek={daysOfWeek}
                                onChange={(newInterval, newDaysOfWeek) => {
                                    setInterval(newInterval);
                                    setDaysOfWeek(newDaysOfWeek);
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="monthly" className="mt-4">
                            <MonthlyPatternConfig
                                interval={interval}
                                monthlyType={monthlyType}
                                daysOfWeek={daysOfWeek}
                                weekOfMonth={weekOfMonth}
                                dayOfMonth={dayOfMonth}
                                onChange={(newInterval, newMonthlyType, newDaysOfWeek, newWeekOfMonth, newDayOfMonth) => {
                                    setInterval(newInterval);
                                    setMonthlyType(newMonthlyType);
                                    setDaysOfWeek(newDaysOfWeek);
                                    setWeekOfMonth(newWeekOfMonth);
                                    setDayOfMonth(newDayOfMonth);
                                }}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* SECTION 3: TERMINATION - Only for recurring patterns */}
                {pattern !== 'none' && (
                    <TerminationConfig
                        terminationType={terminationType}
                        endDate={endDate}
                        occurrences={occurrences}
                        maxEvents={maxEvents}
                        minStartDate={startDate}
                        onChange={(type, newEndDate, newOccurrences) => {
                            setTerminationType(type);
                            if (type === 'endDate') {
                                setEndDate(newEndDate);
                                setOccurrences(undefined);
                            } else {
                                setOccurrences(newOccurrences);
                                setEndDate(undefined);
                            }
                        }}
                    />
                )}

                {/* SECTION 4: EXCEPTIONS - Optional, only for recurring */}
                {pattern !== 'none' && !compact && (
                    <ExceptionDates
                        exceptions={exceptions}
                        minStartDate={startDate}
                        onChange={setExceptions}
                    />
                )}

                {/* SECTION 5: PREVIEW */}
                {showPreview && (
                    <RecurrencePreview occurrences={calculatedOccurrences} maxEvents={maxEvents} />
                )}

                {/* SECTION 6: VALIDATION ERRORS */}
                {!isValid && pattern !== 'none' && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {pattern === 'weekly' && daysOfWeek.length === 0 && 'Please select at least one day of the week'}
                            {pattern === 'monthly' && monthlyType === 'week-based' && weekOfMonth.length === 0 && 'Please select at least one week'}
                            {pattern === 'monthly' && monthlyType === 'week-based' && daysOfWeek.length === 0 && 'Please select a day of the week'}
                            {pattern === 'monthly' && monthlyType === 'date-based' && dayOfMonth === undefined && 'Please select a day of the month'}
                            {terminationType === 'occurrences' && !occurrences && 'Please specify number of occurrences'}
                            {terminationType === 'occurrences' && occurrences && occurrences > maxEvents && `Maximum ${maxEvents} occurrences allowed`}
                            {terminationType === 'endDate' && !endDate && 'Please select an end date'}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}