import {ControllerBase} from "./controller-base";
import {CustomModalBase} from "./modal-custom-base";
import {ArgumentError} from "../app-errors";

export interface ModalOptions {
    animation: string,
    backdropClickToClose: boolean,
    hardwareBackButtonClose: boolean,
    customController?: string
}

export class ModalBase extends ControllerBase {
    private modal;
    private customController: CustomModalBase;
    private templateURL: string;
    private options: ModalOptions;

    constructor(name: string, templateURL: string, $injector, options: ModalOptions) {
        let $rootScope = $injector.get("$rootScope");
        let $scope = $rootScope.$new();

        super(name, $injector, $scope, {manualInitCleanup: true});

        this.modal = null;
        this.customController = null;
        this.templateURL = templateURL;
        this.options = options;

        //Normally we expect users to subclass ModalBase in order to create custom controllers.
        //However if we need to dynamically create new controllers based on a string name like in the
        //gateway page, we need a way to find the appropriate controller programmatically using angular's
        //$injector.
        //
        //If we should use a custom controller, create that and attach it to our scope instead of ourselves
        if (options.customController != null) {
            let controllerService: any = $injector.get("$controller");
            this.customController = controllerService(options.customController, {$scope: $scope});
            if (!(this.customController instanceof CustomModalBase)) {
                this.log_error("Attempted to create a modal with a custom controller that did not inherit from CustomModalBase", options.customController);
                throw new ArgumentError("Invalid controller type specified: " + options.customController);
            }

            $scope.vm = this.customController;
        } else {
            $scope.vm = this; //Inject ourselves as vm so we can access our data from the template
        }
        
        this.initialized = this.createModal();
        
        let that = this;
        $scope.$on('modal.removed', async function() {
            if (that.customController != null) {
                await that.customController.cleanup();
            } else {
                await that.cleanup();
            }
        });
    }

    private async createModal() {
        let that = this;

        return new Promise<void>((resolve, reject) => {
            that.$ionicModal.fromTemplateUrl(this.templateURL, {
                scope: this.$scope,
                animation: this.options.animation,
                backdropClickToClose: this.options.backdropClickToClose,
                hardwareBackButtonClose: this.options.hardwareBackButtonClose
            }).then(function(modal) {
                that.modal = modal;

                if (that.customController) {
                    that.customController.modal = modal;
                }

                resolve();
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    public async show(...args) {
        await this.initialized;

        let that = this;

        if (this.modal.isShown()) {
            this.log_error("Show called multiple times");
            return;
        }

        return new Promise<void>((resolve, reject) => {
            that.modal.show().then(async function() {
                try {
                    if (that.customController != null) {
                        await that.customController.initialize();
                    } else {
                        await that.initialize();
                    }

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    public async hide() {
        await this.initialized;

        let that = this;
        return new Promise<void>((resolve, reject) => {
            that.modal.hide().then(resolve);
        });
    }

    public async remove() {
        await this.initialized;

        let that = this;
        return new Promise<void>((resolve, reject) => {
            that.modal.remove().then(resolve);
        });
    }
};
