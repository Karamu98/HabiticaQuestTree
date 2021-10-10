// To parse this data:
//
//   import { Convert, WebhookUpdateData } from "./file";
//
//   const webhookUpdateData = Convert.toWebhookUpdateData(json);

export interface TasksRequest {
    success?:       boolean;
    data?:          Datum[];
    notifications?: Notification[];
    appVersion?:    string;
}

export interface Datum {
    challenge?:         Challenge;
    group?:             Group;
    up?:                boolean;
    down?:              boolean;
    counterUp?:         number;
    counterDown?:       number;
    frequency?:         Frequency;
    history?:           History[];
    type?:              Type;
    notes?:             string;
    tags?:              string[];
    value?:             number;
    priority?:          number;
    attribute?:         Attribute;
    byHabitica?:        boolean;
    reminders?:         any[];
    createdAt?:         Date;
    updatedAt?:         Date;
    _id?:               string;
    text?:              string;
    userId?:            string;
    id?:                string;
    repeat?:            Repeat;
    everyX?:            number;
    streak?:            number;
    nextDue?:           string[];
    yesterDaily?:       boolean;
    completed?:         boolean;
    collapseChecklist?: boolean;
    startDate?:         Date;
    daysOfMonth?:       any[];
    weeksOfMonth?:      number[];
    checklist?:         any[];
    isDue?:             boolean;
    date?:              Date | null;
}

export enum Attribute {
    Int = "int",
    Str = "str",
}

export interface Challenge {
}

export enum Frequency {
    Daily = "daily",
    Monthly = "monthly",
    Weekly = "weekly",
}

export interface Group {
    approval?:         Approval;
    assignedUsers?:    any[];
    sharedCompletion?: SharedCompletion;
}

export interface Approval {
    required?:  boolean;
    approved?:  boolean;
    requested?: boolean;
}

export enum SharedCompletion {
    SingleCompletion = "singleCompletion",
}

export interface History {
    date?:       number;
    value?:      number;
    scoredUp?:   number;
    scoredDown?: number;
    isDue?:      boolean;
    completed?:  boolean;
}

export interface Repeat {
    m?:  boolean;
    t?:  boolean;
    w?:  boolean;
    th?: boolean;
    f?:  boolean;
    s?:  boolean;
    su?: boolean;
}

export enum Type {
    Daily = "daily",
    Habit = "habit",
    Reward = "reward",
    Todo = "todo",
}

export interface Notification {
    type?: string;
    data?: Data;
    seen?: boolean;
    id?:   string;
}

export interface Data {
    headerText?: string;
    bodyText?:   string;
}

// Converts JSON strings to/from your types
export class TasksRequestConvert {
    public static ToData(json: string): TasksRequest {
        return JSON.parse(json);
    }

    public static ToJSON(value: TasksRequest): string {
        return JSON.stringify(value);
    }
}
