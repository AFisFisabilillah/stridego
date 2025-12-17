import RunIcon from "@/assets/icon/Run";

export type TrackingType = {
    id:number,
    name: string,
    icon: React.ElementType<any>,
    met:number
}

export const TrackingTypes :TrackingType[] =[
    {
        id:1,
        name:"Run",
        icon:RunIcon,
        met:8
    },{
        id:2,
        name:"Lari",
        icon:RunIcon,
        met:8
    },{
        id:3,
        name:"Lari",
        icon:RunIcon,
        met:8
    },{
        id:4,
        name:"Lari",
        icon:RunIcon,
        met:8
    },{
        id:5,
        name:"Lari",
        icon:RunIcon,
        met:8
    },{
        id:6,
        name:"Lari",
        icon:RunIcon,
        met:8
    },
]