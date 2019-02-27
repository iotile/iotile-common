import { Category, MessageType, ErrorType, CategoryServiceFactory, CategoryConfiguration, LogLevel } from "typescript-logging";

export class LoggingBase {
    private category: Category;

    constructor(category: Category) {
        this.category = category;
    }

    // WARNING: This will override the entire category configuration, not just the LogLevel.
    // TODO: Keep current config settings and only update LogLevel. It is not apparent how
    // to do this and may require a PR for https://github.com/mreuvers/typescript-logging
    protected setLogLevel(level: LogLevel, applyChildren: boolean = false) {
        CategoryServiceFactory.setConfigurationCategory(new CategoryConfiguration(level), this.category, applyChildren);
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