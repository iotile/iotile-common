import {ObjectBase} from "./all-base";
import {InvalidOperationError} from "../app-errors";
import { UISeverity } from "../progress";

export interface ControllerOptions {
    manualInitCleanup?: boolean
}

export class ControllerBase extends ObjectBase {
    protected $scope: ng.IScope;
    protected $ionicLoading;
    protected $ionicPopup;
    protected $ionicHistory;
    protected $ionicModal;
    protected $cordovaInAppBrowser;
    protected net;

    protected currentModal;

    public error: string;
    public initialized: Promise<void>;

    constructor(name: string, $injector, $scope, options: ControllerOptions = {manualInitCleanup: false}) {
        super(name, $injector);

        this.$scope = $scope;
        this.$ionicPopup = $injector.get("$ionicPopup");
        this.$ionicHistory = $injector.get("$ionicHistory");
        this.$ionicLoading = $injector.get("$ionicLoading");
        this.$ionicModal = $injector.get("$ionicModal");
        this.$cordovaInAppBrowser = $injector.get("$cordovaInAppBrowser");
        this.net = $injector.get('NetService');

        this.error = null;
        this.currentModal = null;

        let that = this;

        /*
            * For generally good practice as well as for testability we need to know when the controller
            * has been properly initialized.  So we have an initialized promise that can be awaited to
            * make sure the controller has been properly initialized.  
            * 
            * NB the promise executor runs synchronously so there is no race condition here
            * setting resolve and reject handler and using them in the $scope.on clause below.  If a subclass
            * wants to manually initialize itself, it needs to assign a promise to this.initialized in the 
            * constructor.
            */

        this.initialized = null;

        if (options.manualInitCleanup === false) {
            let resolveInitialized: () => void;
            let rejectInitialized: (any) => void;

            this.initialized = new Promise<void>((resolve, reject) => {
                resolveInitialized = resolve;
                rejectInitialized = reject;
            });
            
            $scope.$on('$ionicView.beforeEnter', async function(ev) {
                that.error = null;
                try {
                    await that.initialize();
                    resolveInitialized();
                } catch(err) {
                    rejectInitialized(err);
                }
            });

            $scope.$on('$ionicView.beforeLeave', async function() {
                await that.cleanup();
            });
        }
    }

    protected showLoading(message: string, autoCloseOnTransition: boolean = false): Promise<void> {
        return this.showLoadingEx({template: message, hideOnStateChange: autoCloseOnTransition});
    }

    protected async showLoadingEx(details: {}) {
        let that = this;

        return new Promise<void>(function(resolve, reject) {
            that.$ionicLoading.show(details).then(function () {
                resolve();
            }).catch((err) => resolve());
        })
    }

    protected async hideLoading()
    {
        let that = this;

        return new Promise<void>(function(resolve, reject) {
            that.$ionicLoading.hide().then(function () {
                resolve();
            }).catch((err) => resolve());
        })
    }

    //FIXME: We may want to eliminate this function
    public async showIsolatedModal(modalController: any) {
        this.currentModal = modalController;
        await modalController.show();
    }

    public async hideIsolatedModal() {
        if (this.currentModal === null)
        {
            throw new InvalidOperationError('Hiding modal when there is no modal shown.');
        }

        await this.currentModal.hide();
    }

    public openExternal(url: string): Promise<void> {
        let browserOptions = {
            location: 'yes',
            clearcache: 'yes',
            toolbar: 'yes'
        };
    
        let that = this;
        return new Promise<void>((resolve, reject) => {
            that.$cordovaInAppBrowser.open(url, '_blank', browserOptions).then(function() {
                resolve();
            }).catch(function(err) {
                reject(err);
            });
        });
    }

    //Deprecated, we should be using isolated modals now
    public async showModal(templateURL: string)
    {
        let that = this;
        return new Promise<void>(function(resolve, reject) {
            that.$ionicModal.fromTemplateUrl(templateURL, {scope: that.$scope, animation: 'slide-in-up'}).then(function(modal) {
                that.currentModal = modal;
                modal.show().then(function() {
                    resolve();
                });
            });
        });
    }

    //Deprecated, we should be using isolated modals now
    public async hideModal()
    {
        if (this.currentModal === null)
        {
            throw new InvalidOperationError('Hiding modal when there is no modal shown.');
        }

        let that = this;

        return new Promise<void>(function(resolve, reject) {
            that.currentModal.hide().then(function() {
                that.currentModal.remove();
                that.currentModal = null;
                resolve();
            });
        });
    }

    public setError(message: string)
    {
        this.error = message;

        if (!this.$scope.$$phase) {
            this.$scope.$apply();
        }
    }

    public isOnline(): boolean {
        return this.net.isOnline();
    }

    protected async initialize() {

    }

    protected async cleanup() {

    }

    protected async leaveFromError(message: string, title?: string)
    {
        await this.hideLoading();

        //Make sure we hide any modals that might be visible before leaving
        try {
            await this.hideModal();
        } catch (err) {

        }

        if (!title) {
            title = "Fatal Error";
        }

        await this.alert(title, message);
        this.$ionicHistory.goBack();
    }

    protected async confirm(title: string, message: string, severity: UISeverity = UISeverity.Info): Promise<boolean>{
        let that = this;

        return new Promise<boolean>(function(resolve, reject) {
            that.$ionicPopup.confirm({
                title: title,
                template: message,
                cssClass: severity + '-popup',
                buttons: [{
                    text: "Cancel",
                    type: "button-assertive",
                    onTap: function(e) {return false}
                }, {
                    text: "Okay",
                    type: "button-balanced",
                    onTap: function(e) {return true}
                }]
            }).then(function (res) {
                resolve(res);
            });
        })        
    }

    protected async alert(title: string, message: string, severity: UISeverity = UISeverity.Info) 
    {
        let that = this;

        return new Promise<void>(function(resolve, reject) {
            that.$ionicPopup.alert({
                title: title,
                cssClass: severity + '-popup',
                template: message
            }).then(function () {
                resolve();
            });
        })
    }
}