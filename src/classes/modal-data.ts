import {ModalBase} from "./modal-base";
import {ArgumentError} from "../app-errors";

export class DataGatheringModal<ArgsT, ResultT> extends ModalBase {
    private deferredResolve: ((ResultT: any) => void) | null;
    private deferredReject: ((any: any) => void) | null;
    private promise: Promise<ResultT> | undefined;
    protected args: ArgsT | null;

    constructor($injector: any, name: string, templateURL: string) {
        super(name, templateURL, $injector, {animation: 'slide-in-up', backdropClickToClose: false, hardwareBackButtonClose: false});
        this.deferredReject = null;
        this.deferredResolve = null;
        this.args = null;
    }

    public async launch(args: ArgsT): Promise<void> {
        this.args = args;

        await this.show();

        let that = this;
        this.promise =  new Promise<ResultT>(function (resolve, reject) {
            that.deferredResolve = resolve;
            that.deferredReject = reject;
        });
    }

    public wait(): Promise<ResultT> {
        if (this.promise == null) {
            return Promise.reject(new ArgumentError("You must call show before calling wait"));
        }

        return this.promise;
    }

    public async run(args: ArgsT): Promise<ResultT> {
        await this.launch(args);

        let result = await this.wait();
        this.remove();
        return result;
    }

    public closeWithData(result: ResultT) {
        if (!this.deferredResolve) {
            throw new ArgumentError("closeWithData called on data modal before run had return");
        }

        this.deferredResolve(result);
    }

    public closeWithError(error: any) {
        if (!this.deferredReject) {
            throw new ArgumentError("closeWithError called on data modal before run had return");
        }

        this.deferredReject(error);
    }
}
