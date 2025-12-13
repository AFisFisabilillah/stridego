export const getAveragePace = (distanceInKm: number, durationInSeconds: number): string => {
    if (distanceInKm <= 0 || durationInSeconds <= 0) {
        return '--:--';
    }

    const paceInMinutesPerKm = (durationInSeconds / 60) / distanceInKm;

    const minutes = Math.floor(paceInMinutesPerKm);
    const seconds = Math.floor((paceInMinutesPerKm - minutes) * 60);

    // Format menjadi MM:SS
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};