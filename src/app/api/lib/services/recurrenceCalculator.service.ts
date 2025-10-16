import { RecurrenceConfig } from '@/models/Calendar';
import { injectable } from 'inversify';

export interface RecurrenceCalculationOptions {
  startDate: Date;
  endDate?: Date;
  maxOccurrences?: number;
}

@injectable()
export class RecurrenceCalculatorService {
  /**
   * Calculate all dates for a given recurrence configuration
   */
  calculateDates(
    recurrence: RecurrenceConfig,
    options: RecurrenceCalculationOptions
  ): Date[] {
    const { startDate, endDate, maxOccurrences = 100 } = options;
    const dates: Date[] = [];
    
    if (recurrence.pattern === 'none') {
      return [new Date(startDate)];
    }

    let currentDate = new Date(startDate);
    let occurrenceCount = 0;

    while (occurrenceCount < maxOccurrences) {
      // Check if we've exceeded the end date
      if (endDate && currentDate > endDate) {
        break;
      }

      // Check if we've reached the maximum occurrences
      if (recurrence.occurrences && occurrenceCount >= recurrence.occurrences) {
        break;
      }

      // Check if this date is in the exceptions list
      if (!this.isDateInExceptions(currentDate, recurrence.exceptions)) {
        dates.push(new Date(currentDate));
        occurrenceCount++;
      }

      // Move to next occurrence
      currentDate = this.getNextOccurrenceDate(currentDate, recurrence);
      
      // Safety check to prevent infinite loops
      if (currentDate.getTime() === dates[dates.length - 1]?.getTime()) {
        break;
      }
    }

    return dates;
  }

  /**
   * Calculate dates for weekly recurrence
   */
  calculateWeeklyDates(
    recurrence: RecurrenceConfig,
    options: RecurrenceCalculationOptions
  ): Date[] {
    const { startDate, endDate, maxOccurrences = 100 } = options;
    const dates: Date[] = [];
    const daysOfWeek = recurrence.daysOfWeek || [];
    
    if (daysOfWeek.length === 0) {
      return dates;
    }

    let currentDate = new Date(startDate);
    let occurrenceCount = 0;
    const interval = recurrence.interval || 1;
    const maxOccurrencesToCreate = recurrence.occurrences || maxOccurrences;

    // Find the first occurrence of the first selected day
    while (currentDate.getDay() !== daysOfWeek[0] && occurrenceCount < 365) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    while (occurrenceCount < maxOccurrencesToCreate) {
      for (const dayOfWeek of daysOfWeek) {
        if (occurrenceCount >= maxOccurrencesToCreate) {
          break;
        }

        // Set to the correct day of the week
        const eventDate = new Date(currentDate);
        const daysToAdd = (dayOfWeek - currentDate.getDay() + 7) % 7;
        eventDate.setDate(currentDate.getDate() + daysToAdd);

        // Check if we've exceeded the end date
        if (endDate && eventDate > endDate) {
          return dates;
        }

        // Check if this date is in the exceptions list
        if (!this.isDateInExceptions(eventDate, recurrence.exceptions)) {
          dates.push(new Date(eventDate));
          occurrenceCount++;
        }
      }

      // Move to next week
      currentDate.setDate(currentDate.getDate() + (7 * interval));
    }

    return dates;
  }

  /**
   * Get the next occurrence date based on recurrence pattern
   */
  private getNextOccurrenceDate(currentDate: Date, recurrence: RecurrenceConfig): Date {
    const nextDate = new Date(currentDate);
    const interval = recurrence.interval || 1;

    switch (recurrence.pattern) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (7 * interval));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      default:
        nextDate.setDate(nextDate.getDate() + 1);
    }

    return nextDate;
  }

  /**
   * Check if a date is in the exceptions list
   */
  private isDateInExceptions(date: Date, exceptions?: Date[]): boolean {
    if (!exceptions || exceptions.length === 0) {
      return false;
    }

    return exceptions.some(exceptionDate => {
      const exc = new Date(exceptionDate);
      return exc.getTime() === date.getTime();
    });
  }

  /**
   * Calculate the total number of occurrences for a recurrence pattern
   */
  calculateTotalOccurrences(
    recurrence: RecurrenceConfig,
    options: RecurrenceCalculationOptions
  ): number {
    if (recurrence.pattern === 'none') {
      return 1;
    }

    if (recurrence.occurrences) {
      return recurrence.occurrences;
    }

    if (recurrence.endDate && options.endDate) {
      const endDate = recurrence.endDate < options.endDate ? recurrence.endDate : options.endDate;
      const dates = this.calculateDates(recurrence, { ...options, endDate });
      return dates.length;
    }

    // Default to 12 occurrences if no limit is specified
    return 12;
  }

  /**
   * Calculate the end date based on recurrence pattern and number of occurrences
   */
  calculateEndDateFromOccurrences(
    recurrence: RecurrenceConfig,
    startDate: Date,
    occurrences: number
  ): Date {
    if (recurrence.pattern === 'none') {
      return startDate;
    }

    const dates = this.calculateDates(recurrence, {
      startDate,
      maxOccurrences: occurrences
    });

    if (dates.length === 0) {
      return startDate;
    }

    return dates[dates.length - 1];
  }

  /**
   * Get the day of week number (0 = Sunday, 1 = Monday, etc.)
   */
  getDayOfWeekNumber(dayName: string): number {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.indexOf(dayName.toLowerCase());
  }

  /**
   * Validate recurrence configuration
   */
  validateRecurrence(recurrence: RecurrenceConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!recurrence.pattern) {
      errors.push('Recurrence pattern is required');
    }

    if (recurrence.pattern === 'weekly' && (!recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0)) {
      errors.push('Days of week must be specified for weekly recurrence');
    }

    if (recurrence.pattern === 'monthly' && !recurrence.weekOfMonth && !recurrence.dayOfMonth) {
      errors.push('Either weekOfMonth or dayOfMonth must be specified for monthly recurrence');
    }

    if (recurrence.interval && recurrence.interval < 1) {
      errors.push('Recurrence interval must be greater than 0');
    }

    if (recurrence.occurrences && recurrence.occurrences < 1) {
      errors.push('Number of occurrences must be greater than 0');
    }

    if (recurrence.startDate && recurrence.endDate && recurrence.startDate >= recurrence.endDate) {
      errors.push('Start date must be before end date');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
