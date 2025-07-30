import { LogLevel } from '../LogLevel';
import { TransportStrategy } from './TransportStrategy';

// Console transport for AI-BOS logger

export class ConsoleTransport implements TransportStrategy {
    name = 'console';
    private enabledLevels: Set<LogLevel>;

    constructor(enabledLevels: LogLevel[] = [LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]) {
        this.enabledLevels = new Set(enabledLevels);
    }

    log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        if (!this.isEnabled(level)) {
            return;
        }

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...context
        };

        switch (level) {
            case LogLevel.DEBUG:
                console.debug(logEntry);
                break;
            case LogLevel.INFO:
                console.info(logEntry);
                break;
            case LogLevel.WARN:
                console.warn(logEntry);
                break;
            case LogLevel.ERROR:
                console.error(logEntry);
                break;
        }
    }

    isEnabled(level: LogLevel): boolean {
        return this.enabledLevels.has(level);
    }
}
