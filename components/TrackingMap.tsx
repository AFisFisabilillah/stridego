import MapView, {Marker, Polyline} from "react-native-maps";
import {StyleSheet, View} from "react-native";
import {LocationObject} from "expo-location";
import {Colors} from "@/constants/theme";
const LATITUDE_DELTA = 0.001;
const LONGITUDE_DELTA = 0.001;
export default function TrackingMap({ currentLocation, routeLocation} : {currentLocation: LocationObject, routeLocation: {latitude:number, longitude:number}[]}) {
    return (
        <>
            <MapView
                region={{
                    latitude:currentLocation?.coords.latitude || 0 ,
                    longitude:currentLocation?.coords.longitude || 0,
                    latitudeDelta:LATITUDE_DELTA,
                    longitudeDelta:LONGITUDE_DELTA
                }}
                showsUserLocation={true}
                showsBuildings={true}
                showsMyLocationButton={true}
                showsScale={true}
                style={styles.mapContainer}>
                <Polyline coordinates={routeLocation} strokeColor={Colors.light.primary} strokeWidth={6} />
            </MapView>
        </>
    )
}

const styles = StyleSheet.create({
    mapContainer:{
        ...StyleSheet.absoluteFillObject
    },
})