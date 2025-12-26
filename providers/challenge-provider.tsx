import {ChallengeDay, ChallengeTemplate, ExerciseDay, WorkoutComplete} from "@/types/challenge";
import {createContext, ReactNode, useContext, useState} from "react";
import {useImmer} from "use-immer";
import {error} from "@expo/fingerprint/cli/build/utils/log";

type ChallengeContextType = {
    challenge:ChallengeTemplate | null;
    setChallenge:(challenge:ChallengeTemplate) => void;
    challengeDay:ChallengeDay | null;
    setChallengeDay:(challengeDay:ChallengeDay) => void;
    exerciseDays:ExerciseDay[] | null;
    setExerciseDays:(exerciseDay:ExerciseDay[]) => void;
    workoutCompleted:WorkoutComplete |null,
    setWorkoutCompleted:(workoutCompleted:WorkoutComplete) => void;
    idChallengeJoin:number|null;
    setIdChallengeJoin:(join :number)=>void;
}

const ChallengeContext = createContext<ChallengeContextType|null>(null);

export function ChallengeProvider({children }: {children: ReactNode} ) {
    const [challenge , setChallenge] = useImmer<ChallengeTemplate|null>(null);
    const [challengeDay, setChallengeDay] = useImmer<ChallengeDay|null>(null);
    const [exerciseDays, setExerciseDays] = useImmer<ExerciseDay[]|null>(null);
    const [workoutCompleted, setWorkoutCompleted] = useImmer<WorkoutComplete|null>(null);
    const[idChallengeJoin, setChallengeJoin] = useState<number|null>(null);


    function updateChallenge(challenge: ChallengeTemplate) {
        setChallenge(challenge);
    }

    function updateChallengeDay(challengeDay: ChallengeDay) {
        setChallengeDay(challengeDay);
    }

    function updateExerciseDay(exerciseDays: ExerciseDay[]) {
        setExerciseDays(exerciseDays)
    }

    function updateWorkoutCompleted(workoutCompleted:WorkoutComplete) {
        setWorkoutCompleted(workoutCompleted)
    }

    function updateIdChallengeJoin(join: number) {
        setChallengeJoin(join);
    }

    return (
        <ChallengeContext.Provider value={{
            challenge:challenge,
            setChallenge:updateChallenge,
            challengeDay:challengeDay,
            setChallengeDay:updateChallengeDay,
            exerciseDays:exerciseDays,
            setExerciseDays:updateExerciseDay,
            workoutCompleted:workoutCompleted,
            setWorkoutCompleted:updateWorkoutCompleted,
            idChallengeJoin:idChallengeJoin,
            setIdChallengeJoin:updateIdChallengeJoin
        }}>
            {children}
        </ChallengeContext.Provider>
    )
}

export function useChallenge() {
    const ctx = useContext(ChallengeContext);
    if (!ctx) throw new Error("useActivity must be used inside ActivityProvider");
    return ctx;
}