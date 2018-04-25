export type QueuedWaiter = () => void;

/**
 * @ngdoc object
 * @name IOTileAppModule.type:BlockingEvent
 * 
 * @description
 * A concurrent event that allows waiting until a condition is met.  Anyone who 
 * calls wait() will yield and block until set() is called, at which point all
 * waiters will be released in parallel.
 * 
 * @property {boolean} isSet Whether the event is set
 */
export class BlockingEvent 
{
    private _set = false;
    private resolve: QueuedWaiter;
    private event: Promise<void>;

    constructor(){
        let that = this;

        this.event = new Promise<void>(function(resolve, reject) { 
            that.resolve = resolve; 
        });
    }

    public wait(): Promise<void> 
    {
        return this.event;
    }

    public set()
    {
        this._set = true;
        this.resolve();   
    }

    public get isSet()
    {
        return this._set;
    }
}