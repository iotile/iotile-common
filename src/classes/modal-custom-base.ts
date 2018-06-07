import {ControllerBase} from "./controller-base";

/**
 * CustomModalBase should be used to create modal controllers
 * that can be invoked dynamically by name rather than having
 * to know the modal's name at compile time.
 */

export class CustomModalBase extends ControllerBase {
    public modal: any;

    constructor(name: string, $injector: any, $scope: any) {
        super(name, $injector, $scope, {manualInitCleanup: true});

        this.modal = null;
    }

    //We need initialize to be accessible publically since it will be called by ModalBase 
    //when we are created
    public async initialize() {

    }

    //We need initialize to be accessible publically since it will be called by ModalBase 
    //when we are created
    public async cleanup() {

    }

    public async hide() {
        if (!this.modal) {
            this.log_error("Custom modal improperly constructed with no modal member");
            return;
        }

        let that = this;
        return new Promise<void>((resolve, reject) => {
            that.modal.hide().then(resolve);
        });
    }

    public async remove() {
        if (!this.modal) {
            this.log_error("Custom modal improperly constructed with no modal member");
            return;
        }

        let that = this;
        return new Promise<void>((resolve, reject) => {
            that.modal.remove().then(resolve);
        });
    }
}