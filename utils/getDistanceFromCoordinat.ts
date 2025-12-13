export default function getDistanceFromCoordinat(lat1:number, lon1:number, lat2:number, lon2:number) {
    // Pakai rumus Haversine unutk menghitung jarak
    const R:number = 6371; // Radius bumi dalam km
    const dLat:number = degTorad(lat2 - lat1);
    const dLon:number = degTorad(lon2 - lon1);
    const a:number =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degTorad(lat1)) * Math.cos(degTorad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Jarak dalam km
    return d;

}


function degTorad(deg: number) :number{
    return deg * (Math.PI / 180);
}