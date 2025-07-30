import { LogLevel } from './LogLevel';
import { TransportStrategy } from './transports/TransportStrategy';
import { ConsoleTransport } from './transports/ConsoleTransport';

// Main Logger class for AI-BOS

export class Logger {
    private transports: TransportStrategy[];
    private level: LogLevel;

    constructor(
        level: LogLevel = LogLevel.INFO,
        transports: TransportStrategy[] = [new ConsoleTransport()]
    ) {
        this.level = level;
        this.transports = transports;
    }

    log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
        if (level < this.level) {
            return;
        }

        this.transports.forEach(transport => {
            if (transport.isEnabled(level)) {
                transport.log(level, message, context);
            }
        });
    }

    debug(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    info(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, context);
    }

    warn(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, context);
    }

    error(message: string, context?: Record<string, unknown>): void {
        this.log(LogLevel.ERROR, message, context);
    }

    addTransport(transport: TransportStrategy): void {
        this.transports.push(transport);
    }

    removeTransport(name: string): void {
        this.transports = this.transports.filter(t => t.name !== name);
    }

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    async destroy(): Promise<void> {
        await Promise.all(
            this.transports
                .filter(t => t.destroy)
                .map(t => t.destroy!())
        );
    }
}
