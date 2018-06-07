import {ObjectBase} from "./all-base";

export class ServiceBase extends ObjectBase {
    public initialized: Promise<void> | null;

    constructor(name: string, $injector: any) {
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