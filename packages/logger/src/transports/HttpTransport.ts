import { LogLevel } from '../LogLevel';
import { TransportStrategy } from './TransportStrategy';

// HTTP transport for AI-BOS logger (placeholder for Phase 1)

export class HttpTransport implements TransportStrategy {
    name = 'http';
    private enabledLevels: Set<LogLevel>;
    private endpoint?: string;

    constructor(
        enabledLevels: LogLevel[] = [LogLevel.ERROR],
        endpoint?: string
    ) {
        this.enabledLevels = new Set(enabledLevels);
        this.endpoint = endpoint;
    }

    log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        if (!this.isEnabled(level)) {
            return;
        }

        // TODO: Implement HTTP transport in Phase 2
        // For now, just pass through to console
        const timestamp = new Date().toISOString();
        const logEntry: Record<string, unknown> = {
            timestamp,
            level,
            message,
            transport: 'http',
            ...(this.endpoint && { endpoint: this.endpoint }),
            ...context
        };

        console.log(JSON.stringify(logEntry));
    }

    isEnabled(level: LogLevel): boolean {
        return this.enabledLevels.has(level);
    }
}
