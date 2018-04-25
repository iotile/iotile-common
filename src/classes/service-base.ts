import {ObjectBase} from "./all-base";

export class ServiceBase extends ObjectBase {
    public initialized: Promise<void>;

    constructor(name: string, $injector) {
        super(name, $injector);

        this.initialized = null;
    }

    protected beginInitialization() {
        this.initialized = this.initialize();
    }

    //Subclasses that need to do asynchronous initialization should
    //override this function.  It must return a void promise.
    protected async initialize() : Promise<void> {

    }
}