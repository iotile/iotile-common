import {ComponentBase} from "./component-base";

export class WidgetChannel {
    public bindMethod?: (func: any, stream: number | string) => void;
    public bindCallback?: (func: any, stream: number | string) => void;
    public getStreamID?: (stream: string) => string;
    public callRPC?: (addr: number, rpcID: number, call_fmt: string, resp_fmt: string, args: (string | number)[], timeout?: number) => Promise<any[]>;
    public getUnits?: (stream: string) => string;
    public setState?: (state: string) => void;

    constructor(){}
}

export class WidgetBase extends ComponentBase {
    public channel: WidgetChannel | undefined;
    public widget: any;

    constructor(name: string,  $injector: any, $scope: any){
        super(name, $injector, $scope);
    }

    public async initialize() {}

    public async cleanup() {}

}
