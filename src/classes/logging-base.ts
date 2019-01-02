import { Category, MessageType, ErrorType } from "typescript-logging";

export class LoggingBase {
    private category: Category;

    constructor(category: Category) {
        this.category = category;
    }

    protected buildLogMessage(msg: string, extraArgs?: {} | any[]): MessageType {
        if (extraArgs == null)
            extraArgs = undefined;

        return {
            msg: msg,
            data: extraArgs
        };
    }

    protected logException(msg: string, error: ErrorType, extraArgs?: {}) {
        this.category.error(this.buildLogMessage(msg, extraArgs), error);
    }

    protected logError(msg: string, extraArgs?: {} | any[]) {
        this.category.error(this.buildLogMessage(msg, extraArgs), null);
    }

    protected logDebug(msg: string, extraArgs?: {} | any[]) {
        this.category.debug(this.buildLogMessage(msg, extraArgs));
    }

    protected logInfo(msg: string, extraArgs?: {} | any[]) {
        this.category.info(this.buildLogMessage(msg, extraArgs));
    }

    protected logTrace(msg: string, extraArgs?: {} | any[]) {
        this.category.trace(this.buildLogMessage(msg, extraArgs));
    }

    protected logWarning(msg: string, extraArgs?: {} | any[]) {
        this.category.warn(this.buildLogMessage(msg, extraArgs));
    }
}