import { LogLevel } from '../LogLevel';
import { TransportStrategy } from './TransportStrategy';

// File transport for AI-BOS logger (placeholder for Phase 1)

export class FileTransport implements TransportStrategy {
    name = 'file';
    private enabledLevels: Set<LogLevel>;

    constructor(enabledLevels: LogLevel[] = [LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]) {
        this.enabledLevels = new Set(enabledLevels);
    }

    log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        if (!this.isEnabled(level)) {
            return;
        }

        // TODO: Implement file writing in Phase 2
        // For now, just pass through to console
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            transport: 'file',
            ...context
        };

        console.log(JSON.stringify(logEntry));
    }

    isEnabled(level: LogLevel): boolean {
        return this.enabledLevels.has(level);
    }
}
