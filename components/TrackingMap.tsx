import MapView, {Marker, Polyline} from "react-native-maps";
import {StyleSheet, View} from "react-native";
import {LocationObject} from "expo-location";
import {Color} from "react-native/Libraries/Animated/AnimatedExports";
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
    markerContainer: {
        width: 30,            // Ukuran total marker
        height: 30,
        borderRadius: 15,     // Setengah dari width/height agar bulat
        backgroundColor: 'white', // Warna border luar (putih)
        justifyContent: 'center',
        alignItems: 'center',
        // Menambahkan bayangan (elevation) agar terlihat timbul
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    markerInner: {
        width: 20,            // Ukuran lingkaran dalam
        height: 20,
        borderRadius: 10,     // Setengah dari width/height agar bulat
        backgroundColor: '#2196F3', // WARNA BIRU yang diinginkan
    }
})