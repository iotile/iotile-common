import { Category, MessageType, ErrorType } from "typescript-logging";

export class LoggingBase {
    private category: Category;

    constructor(category: Category) {
        this.category = category;
    }

    protected logError(msg: MessageType, error?: ErrorType | undefined) {
        if (error === undefined) {
            error = null;
        }

        this.category.error(msg, error);
    }

    protected logDebug(msg: MessageType) {
        this.category.debug(msg);
    }

    protected logInfo(msg: MessageType) {
        this.category.info(msg);
    }

    protected logTrace(msg: MessageType) {
        this.category.trace(msg);
    }

    protected logWarning(msg: MessageType) {
        this.category.warn(msg);
    }
}