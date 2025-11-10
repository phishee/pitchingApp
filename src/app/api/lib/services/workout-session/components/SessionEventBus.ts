import { injectable } from 'inversify';
import { ISessionEventBus } from '../interfaces/IWorkoutSessionService';

@injectable()
export class SessionEventBus implements ISessionEventBus {
  publish(eventName: string, payload: any): void {
    this.dispatch(eventName, payload).catch((error) => {
      console.error('[SessionEventBus] Failed to handle event', {
        eventName,
        error: error?.message,
      });
    });
  }

  private async dispatch(eventName: string, payload: any): Promise<void> {
    switch (eventName) {
      case 'session.started':
        // TODO: integrate analytics/notifications
        break;
      default:
        console.warn('[SessionEventBus] Unknown event type', { eventName });
    }
  }
}

