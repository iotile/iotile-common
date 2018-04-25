export type MutexReleaser = () => void;
export type QueuedRunnable = (MutexReleaser: MutexReleaser) => void;

export class Mutex {
    private _queue: QueuedRunnable[] = [];
    private _pending = false;

    public acquire(): Promise<MutexReleaser> {
        let that = this;

        let entry = new Promise<MutexReleaser>(function (resolve, reject) {
            that._queue.push(resolve);
        });

        if (!this._pending) {
            this.dispatch();
        }

        return entry;
    }

    private dispatch() {
        if (this._queue.length > 0) {
            let nextRunnable = this._queue.shift();
            let that = this;
            let releaseFunction: MutexReleaser = function () {
                that.dispatch();
            }

            this._pending = true;
            if (nextRunnable){
                nextRunnable(releaseFunction);
            }
        } else {
            this._pending = false;
        }
    }
}