import {Coordinate} from "@/types/Coordinate";

export type Activity = {
    id?: string;
    title:string,
    description?:string,
    type: string,
    duration:number,
    calorie:number,
    visibility:string,
    createdAt?:string,
    user_id:string,
}

export type ActivityRuning = {
    id?: string;
    distance:number,
    pace:string,
    route:Coordinate[],
    createdAt?:string,
    activity_id?:string,
}