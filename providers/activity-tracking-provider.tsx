import {createContext, useContext, useState, ReactNode} from "react";
import {TrackingType} from "@/types/trackingTypes";
import {Coordinate} from "@/types/Coordinate";


type ActivityRun = {
    route: Coordinate[];
    pace: string;
    distance: number;
    duration: number;
    calorie: number;
    trackingType: TrackingType;
};

type ActivityContextType = {
    activityRun: ActivityRun | null;
    setActivity: (data: ActivityRun) => void;
    clearActivity: () => void;
};

const ActivityContext = createContext<ActivityContextType | null>(null);

export function ActivityProvider({children}: { children: ReactNode }) {
    const [activityRun, setActivityState] = useState<ActivityRun | null>(null);

    const setActivity = (data: ActivityRun) => {
        setActivityState(data);
    };

    const clearActivity = () => {
        setActivityState(null);
    };

    return (
        <ActivityContext.Provider value={{activityRun, setActivity, clearActivity}}>
            {children}
        </ActivityContext.Provider>
    );
}

export function useActivityRun() {
    const ctx = useContext(ActivityContext);
    if (!ctx) throw new Error("useActivity must be used inside ActivityProvider");
    return ctx;
}
