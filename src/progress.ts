import { NgZone } from '@angular/core';

/*
 * Classes for reporting progress about complex
 * multistep operations.
 */

export interface ProgressEvent {
    currentItem: number,
    totalItems: number,
    currentStep: string
}

export class ProgressNotifier {
    public finishOne() {

    }

    public startOne(desc: string, subparts: number) : ProgressNotifier | null {
        return null;
    }

    public setTotal(total: number) {
    }

    public addMessage(severity: MessageSeverity, message: string) {
    }

    public fatalError(message: string) {
        
    }

    public updateDescription(desc: string) {

    }
}

export class TaskProgressNotifier extends ProgressNotifier {
    private manager: ProgressManager;

    constructor(manager: ProgressManager) {
        super();

        this.manager = manager;
    }

    public finishOne() {
        this.manager.finishTask();
    }

    public startOne(desc: string, subparts: number) : ProgressNotifier | null {
        return this.manager.startTask(desc, subparts);
    }

    public updateDescription(desc: string) {
        this.manager.subTaskDescription = desc;
        this.manager.updateScope();
    }

    public setTotal(total: number) {
        this.manager.totalTasks = total;
    }

    public addMessage(severity: MessageSeverity, message: string) {
        this.manager.addMessage(severity, message);
    }

    public fatalError(message: string) {
        this.manager.fatalError(message);
    }
}

export class SubTaskProgressNotifier extends ProgressNotifier {
    private manager: ProgressManager;

    constructor(manager: ProgressManager) {
        super();

        this.manager = manager;
    }

    public finishOne() {
        this.manager.updateSubtask();
    }

    public startOne(desc: string, subparts: number) : ProgressNotifier {
        this.manager.subSubTaskDescription = desc;
        return new ProgressNotifier();
    }

    public setTotal(total: number) {
        this.manager.subTaskTotal = total;   
    }

    public addMessage(severity: MessageSeverity, message: string) {
        this.manager.addMessage(severity, message);
    }

    public fatalError(message: string) {
        this.manager.fatalError(message);
    }

    public updateDescription(desc: string) {
        this.manager.subSubTaskDescription = desc;
        this.manager.updateScope();
    }
}

export enum MessageSeverity {
    Info = 0,
    Warn = 1,
    Error = 2
}

export class OperationMessage {
    public severity: MessageSeverity;
    public message: string;

    constructor(severity: MessageSeverity, message: string) {
        this.message = message;
        this.severity = severity;
    } 

    public get iconClass() : string {
        if (this.severity == MessageSeverity.Info) {
            return 'ion-information-circled balanced';
        } else if (this.severity == MessageSeverity.Warn) {
            return 'ion-alert-circled energized';
        } else {
            return 'ion-minus-circled assertive';
        }
    }
}

export class ProgressManager {
    public totalTasks: number;
    public finishedTasks: number;

    public subTaskTotal: number;
    public subTaskFinished: number;
    public subTaskDescription: string | null;
    public subSubTaskDescription: string | null;
    public subTaskInProgress: boolean;

    public messages: OperationMessage[];

    private scope: NgZone;
    private errorState: boolean;

    constructor(totalTasks: number, NgZone: NgZone) {
        this.totalTasks = totalTasks;
        this.finishedTasks = 0;

        this.subTaskDescription = null;
        this.subSubTaskDescription = null;
        this.subTaskTotal = 0;
        this.subTaskFinished = 0;
        this.subTaskInProgress = false;

        this.messages = [];

        //If we need to autoupdate some bindings on a scope
        //by triggering a digest cycle
        this.scope = NgZone;
    }

    public clear() {
        this.finishedTasks = 0;

        this.subTaskDescription = null;
        this.subTaskTotal = 0;
        this.subTaskFinished = 0;
        this.subTaskInProgress = false;

        this.messages = [];
        this.errorState = false;
    }

    public getNotifier(): ProgressNotifier {
        return new TaskProgressNotifier(this);
    }

    public startTask(desc: string, totalParts: number) : ProgressNotifier | null {
        if (this.errorState) {
            return null;
        }

        this.subTaskTotal = totalParts;
        this.subTaskFinished = 0;
        this.subTaskDescription = desc;
        this.subTaskInProgress = true;

        this.updateScope();

        return new SubTaskProgressNotifier(this);
    }

    public finishTask() {
        if (this.errorState) {
            return;
        }

        if (this.subTaskInProgress) {
            this.subTaskInProgress = false;
            this.subTaskTotal = 0;
            this.subSubTaskDescription = null;
        }

        if (this.finishedTasks < this.totalTasks) {
            this.finishedTasks += 1;

        }

        this.updateScope();
    }

    public addMessage(severity: MessageSeverity, message: string) {
        this.messages.push(new OperationMessage(severity, message));
    }

    public fatalError(message: string) {
        this.subTaskInProgress = false;
        this.finishedTasks = this.totalTasks;
        this.errorState = true;
        this.addMessage(MessageSeverity.Error, message);
        
        this.updateScope();
    }

    public updateSubtask() {
        if (this.errorState) {
            return;
        }

        if (this.subTaskFinished < this.subTaskTotal) {
            this.subTaskFinished += 1;
            this.subTaskInProgress = true;
        } 
        
        this.updateScope();
    }

    public get hasErrors() : boolean {
        for(let msg of this.messages) {
            if (msg.severity === MessageSeverity.Error) {
                return true;
            }
        }

        return false;
    }

    public updateScope() {
        if (this.scope) {
            this.scope.run(() => undefined);
        }
    }
}