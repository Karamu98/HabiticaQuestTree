// To parse this data:
//
//   import { Convert, WebhookUpdateData } from "./file";
//
//   const webhookUpdateData = Convert.toWebhookUpdateData(json);

export interface WebhookUpdateData {
    type?:        string;
    direction?:   string;
    delta?:       number;
    task?:        Task;
    user?:        User;
    webhookType?: string;
}

export interface Task {
    repeat?:            Repeat;
    challenge?:         Challenge;
    group?:             Group;
    frequency?:         string;
    everyX?:            number;
    streak?:            number;
    nextDue?:           Date[];
    yesterDaily?:       boolean;
    history?:           History[];
    completed?:         boolean;
    collapseChecklist?: boolean;
    type?:              string;
    notes?:             string;
    tags?:              string[];
    value?:             number;
    priority?:          number;
    attribute?:         string;
    byHabitica?:        boolean;
    startDate?:         Date;
    daysOfMonth?:       any[];
    weeksOfMonth?:      any[];
    checklist?:         any[];
    reminders?:         any[];
    createdAt?:         Date;
    updatedAt?:         Date;
    _id?:               string;
    text?:              string;
    userId?:            string;
    isDue?:             boolean;
    id?:                string;
}

export interface Challenge {
}

export interface Group {
    approval?:         Approval;
    assignedUsers?:    any[];
    sharedCompletion?: string;
}

export interface Approval {
    required?:  boolean;
    approved?:  boolean;
    requested?: boolean;
}

export interface History {
    date?:      number;
    value?:     number;
    isDue?:     boolean;
    completed?: boolean;
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

export interface User {
    _tmp?:  Tmp;
    stats?: Stats;
    _id?:   string;
}

export interface Tmp {
    quest?: Quest;
}

export interface Quest {
    progressDelta?: number;
    collection?:    number;
}

export interface Stats {
    buffs?:       Buffs;
    training?:    Training;
    hp?:          number;
    mp?:          number;
    exp?:         number;
    gp?:          number;
    lvl?:         number;
    class?:       string;
    points?:      number;
    str?:         number;
    con?:         number;
    int?:         number;
    per?:         number;
    toNextLevel?: number;
    maxHealth?:   number;
    maxMP?:       number;
}

export interface Buffs {
    str?:            number;
    int?:            number;
    per?:            number;
    con?:            number;
    stealth?:        number;
    streaks?:        boolean;
    snowball?:       boolean;
    spookySparkles?: boolean;
    shinySeed?:      boolean;
    seafoam?:        boolean;
}

export interface Training {
    int?: number;
    per?: number;
    str?: number;
    con?: number;
}

// Converts JSON strings to/from your types
export class WebhookConvert {
    public static ToData(json: string): WebhookUpdateData {
        return JSON.parse(json);
    }

    public static ToJSON(value: WebhookUpdateData): string {
        return JSON.stringify(value);
    }
}
