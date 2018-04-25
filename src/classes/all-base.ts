export class ObjectBase {
    protected $injector: any;
    protected $log: any;

    private className: string;

    constructor(name: string, $injector) {
        this.className = name;
        this.$log = $injector.get("$log");
        this.$injector = $injector;
    }

    protected log_debug(message: string, ...args: any[])
    {
        this.$log.debug("[" + this.className + "] " + message, ...args);
    }

    protected log_warn(message: string, ...args: any[])
    {
        this.$log.warn("[" + this.className + "] " + message, ...args);
    }

    protected log_error(message: string, ...args: any[])
    {
        this.$log.error("[" + this.className + "] " + message, ...args);
    }

    protected log_info(message: string, ...args: any[])
    {
        this.$log.info("[" + this.className + "] " + message, ...args);
    }
}