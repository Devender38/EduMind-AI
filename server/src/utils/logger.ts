// ANSI color codes for clean terminal logging
const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "HTTP";

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
}

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, color: string, message: string, meta?: unknown) {
    const time = `${colors.dim}[${formatTimestamp()}]${colors.reset}`;
    const levelStr = `${color}[${level.padEnd(5)}]${colors.reset}`;
    const ctx = `${colors.cyan}[${this.context}]${colors.reset}`;

    if (meta !== undefined) {
      if (meta instanceof Error) {
        console.log(`${time} ${levelStr} ${ctx} ${message}`, `\n${colors.red}${meta.stack || meta.message}${colors.reset}`);
      } else {
        console.log(`${time} ${levelStr} ${ctx} ${message}`, meta);
      }
    } else {
      console.log(`${time} ${levelStr} ${ctx} ${message}`);
    }
  }

  info(message: string, meta?: unknown) {
    this.log("INFO", colors.green, message, meta);
  }

  warn(message: string, meta?: unknown) {
    this.log("WARN", colors.yellow, message, meta);
  }

  error(message: string, meta?: unknown) {
    this.log("ERROR", colors.red, message, meta);
  }

  debug(message: string, meta?: unknown) {
    this.log("DEBUG", colors.magenta, message, meta);
  }

  http(message: string, meta?: unknown) {
    this.log("HTTP", colors.blue, message, meta);
  }
}

export const createLogger = (context: string) => new Logger(context);
export const logger = new Logger("Server");
