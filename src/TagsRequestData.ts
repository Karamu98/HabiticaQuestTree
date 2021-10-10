// To parse this data:
//
//   import { Convert, TagsRequestData } from "./file";
//
//   const tagsRequestData = Convert.toTagsRequestData(json);

export interface TagsRequestData {
    success?:       boolean;
    data?:          Tag[];
    notifications?: Notification[];
    userV?:         number;
    appVersion?:    string;
}

export interface Tag {
    name?: string;
    id?:   string;
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
export class TagsRequestConvert {
    public static ToData(json: string): TagsRequestData {
        return JSON.parse(json);
    }

    public static ToJSON(value: TagsRequestData): string {
        return JSON.stringify(value);
    }
}
