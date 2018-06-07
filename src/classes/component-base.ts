import {ControllerBase} from "./controller-base";

/**
 * ComponentBase should be used to create components
 * that can be invoked dynamically by name rather than having
 * to know the component's name at compile time.
 */

export class ComponentBase extends ControllerBase {
    private resolve: (() => void) | undefined;
    private reject: (() => void) | undefined;

    constructor(name: string, $injector: any, $scope:any) {
        super(name, $injector, $scope, {manualInitCleanup: true});
        let that = this;
        
        this.initialized = new Promise<void>(function(resolve, reject) { 
            that.resolve = resolve; 
            that.reject = reject;
        });
    }

    public async $onInit() {
        try {
            let initialized = await this.initialize();
            if (this.resolve){
                this.resolve();
            }
        } catch(error){
            this.log_error("Unable to initialize component; " + error);
            if (this.reject){
                this.reject();
            }
        }
      }

    public async $onDestroy() {
        this.cleanup();
    }


    public async initialize() {}

    public async cleanup() {}
}
