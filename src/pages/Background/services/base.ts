import Emittery from 'emittery';
import { Alarms } from 'webextension-polyfill';
import MainServiceManager from './main';
import { Service, ServiceLifecycleEvents } from './types';

/**
 * An alarm schedule for use in the `browser.alarms` API.
 *
 * Note that even if `periodInMinutes` is less than 1, the alarm will only fire
 * a maximum of once a minute in Chrome for a packaged extension. When an
 * extension is loaded unpacked (from a directory for development), periods
 * less than 1 minute are respected across browsers.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/alarms/create|
 * The MDN docs for `alarms.create`}.
 */
type AlarmSchedule =
  | {
      when: number;
      periodInMinutes?: number;
    }
  | {
      delayInMinutes: number;
      periodInMinutes?: number;
    }
  | { periodInMinutes: number };

/**
 * An object carrying the same information as {@link AlarmSchedule}, but that
 * also provides a handler to handle the specified alarm. Designed for use with
 * {@link AlarmHandlerScheduleMap}, which allows for disambiguating between
 * different alarms.
 *
 * Also provides an optional `runAtStart` property that will immediately fire
 * the handler at service start for the first time instead of waiting for the
 * first scheduled run to execute.
 */
export type AlarmHandlerSchedule = {
  schedule: AlarmSchedule;
  handler: (alarm?: Alarms.Alarm) => void;
  runAtStart?: boolean;
};

/*
 * An object mapping alarm names to their designated schedules. Alarm names are
 * used to disambiguate between different alarms when they are fired, so as to
 * fire the handler associated with the appropriate alarm.
 */
export type AlarmHandlerScheduleMap = {
  [alarmName: string]: AlarmHandlerSchedule;
};

export type BaseServiceCreateProps = {
  mainServiceManager?: MainServiceManager;
};

export default abstract class BaseService<Events extends ServiceLifecycleEvents>
  implements Service<Events>
{
  /**
   * {@inheritdoc Service.emitter}
   */
  readonly emitter = new Emittery<Events>();

  /**
   * Takes the set of alarm schedules that this service wants to run. Schedules
   * are not added until `startService` is called.
   */
  protected constructor(
    protected readonly alarmSchedules: AlarmHandlerScheduleMap = {}
  ) {}

  private serviceState: 'unstarted' | 'started' | 'stopped' = 'unstarted';

  /**
   * {@inheritdoc Service.started}
   *
   * @throws {Error} If the service has already been stopped.
   */
  readonly started = async (): Promise<this> => {
    switch (this.serviceState) {
      case 'started':
        return this;

      case 'stopped':
        throw new Error('Service is already stopped and cannot be restarted.');

      case 'unstarted':
        return this.emitter.once('serviceStarted').then(() => this);

      default: {
        const exhaustiveCheck: never = this.serviceState;
        throw new Error(`Unreachable code: ${exhaustiveCheck}`);
      }
    }
  };

  abstract _startService(): Promise<void>;
  abstract _stopService(): Promise<void>;

  /**
   * {@inheritdoc Service.startService}
   *
   * Subclasses should extend `internalStartService` to handle additional
   * starting tasks.
   *
   * @throws {Error} If the service has already been stopped.
   *
   * @sealed
   */
  readonly startService = async (): Promise<void> => {
    switch (this.serviceState) {
      case 'started':
        return;

      case 'stopped':
        throw new Error('Service is already stopped and cannot be restarted.');

      case 'unstarted':
        this.serviceState = 'started';
        await this.internalStartService();
        await this._startService();
        this.emitter.emit('serviceStarted', undefined);
        break;

      default: {
        const exhaustiveCheck: never = this.serviceState;
        throw new Error(`Unreachable code: ${exhaustiveCheck}`);
      }
    }
  };

  /**
   * Hook for subclass starting tasks. Subclasses should call
   * `await super.internalStartService()`, as the base implementation sets up
   * all alarms and their handling.
   */
  protected async internalStartService(): Promise<void> {
    const scheduleEntries = Object.entries(this.alarmSchedules);

    scheduleEntries.forEach(([name, { schedule, runAtStart, handler }]) => {
      chrome.alarms.create(name, schedule);

      if (runAtStart) {
        handler();
      }
    });

    if (scheduleEntries.length > 0) {
      chrome.alarms.onAlarm.addListener(this.handleAlarm);
    }
  }

  /**
   * Hook for subclass stopping tasks. Subclasses should call
   * `await super.internalStopService()`, as the base implementation cleans up
   * all alarms and their handling.
   */
  protected async internalStopService(): Promise<void> {
    const scheduleNames = Object.keys(this.alarmSchedules);

    scheduleNames.forEach((alarmName) => chrome.alarms.clear(alarmName));

    if (scheduleNames.length > 0) {
      chrome.alarms.onAlarm.removeListener(this.handleAlarm);
    }
  }

  /**
   * {@inheritdoc Service.stopService}
   *
   * Subclasses should extend `internalStopService` to handle additional
   * stopping tasks.
   *
   * @throws {Error} If the service has never been started.
   *
   * @sealed
   */
  readonly stopService = async (): Promise<void> => {
    switch (this.serviceState) {
      case 'unstarted':
        throw new Error('Attempted to stop a service that was never started.');

      case 'stopped':
        return;

      case 'started':
        this.serviceState = 'stopped';
        await this.internalStopService();
        await this._stopService();
        this.emitter.emit('serviceStopped', undefined);
        break;

      default: {
        const exhaustiveCheck: never = this.serviceState;
        throw new Error(`Unreachable code: ${exhaustiveCheck}`);
      }
    }
  };

  /**
   * Default handler for alarms. By default, calls the defined handler for the
   * named alarm, if available. Override for custom behavior.
   */
  protected handleAlarm = (alarm: Alarms.Alarm): void => {
    this.alarmSchedules[alarm.name]?.handler(alarm);
  };
}
