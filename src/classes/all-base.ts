/**
 * Legacy base object that previously assumed we were using angular logging
 */

import {LoggingBase} from "./logging-base";
import {Category} from "typescript-logging";

export class ObjectBase extends LoggingBase {
    protected $injector: any;
    private className: string;

    static categoryMap: {[key: string]: Category} = {};
    static categoryBase = new Category("object");

    protected static createOrGetCategory(name: string): Category {
        if (!(name in ObjectBase.categoryMap))
            this.categoryMap[name] = new Category(name, ObjectBase.categoryBase);
        
        return this.categoryMap[name];
    }
    constructor(name: string, $injector: any) {
        super(ObjectBase.createOrGetCategory(name));

        this.className = name;
        this.$injector = $injector;
    }

    protected log_debug(message: string, ...args: any[])
    {
        this.logDebug(message, args);
    }

    protected log_warn(message: string, ...args: any[])
    {
        this.logWarning(message, args);
    }

    protected log_error(message: string, ...args: any[])
    {
        this.logError(message, args);
    }

    protected log_info(message: string, ...args: any[])
    {
        this.logInfo(message, args);
    }
}