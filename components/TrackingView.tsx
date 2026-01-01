// components/TrackingView.tsx
import MapView, { Polyline } from "react-native-maps";
import {StyleSheet, Text, View} from "react-native";
import { Colors } from "@/constants/theme";

interface TrackingViewProps {
    routeLocation: { latitude: number; longitude: number }[];
    initialLocation?: { latitude: number; longitude: number } | null;
}

export default function TrackingView({
                                         routeLocation,
                                         initialLocation
                                     }: TrackingViewProps) {

    if (!routeLocation || routeLocation.length === 0) {
        // @ts-ignore
        return (
            <View style={styles.emptyContainer}>
                <Text>No route data available</Text>
            </View>
        );
    }

    // Calculate region bounds
    const calculateRegion = () => {
        if (routeLocation.length === 0 && initialLocation) {
            return {
                latitude: initialLocation.latitude,
                longitude: initialLocation.longitude,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
            };
        }

        if (routeLocation.length > 0) {
            const latitudes = routeLocation.map((coord) => coord.latitude);
            const longitudes = routeLocation.map((coord) => coord.longitude);

            const minLat = Math.min(...latitudes);
            const maxLat = Math.max(...latitudes);
            const minLng = Math.min(...longitudes);
            const maxLng = Math.max(...longitudes);

            const latitudeDelta = (maxLat - minLat) * 1.2 || 0.001;
            const longitudeDelta = (maxLng - minLng) * 1.2 || 0.001;

            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;

            return {
                latitude: centerLat,
                longitude: centerLng,
                latitudeDelta,
                longitudeDelta,
            };
        }

        return {
            latitude: routeLocation[0]?.latitude || 0,
            longitude: routeLocation[0]?.longitude || 0,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
        };
    };

    return (
        <MapView
            region={calculateRegion()}
            showsUserLocation={false}
            showsBuildings={true}
            showsMyLocationButton={false}
            showsScale={true}
            style={styles.mapContainer}
            mapType="standard"
        >
            <Polyline
                coordinates={routeLocation}
                strokeColor={Colors.light.primary}
                strokeWidth={4}
            />
        </MapView>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: 250,
    },
    emptyContainer: {
        height: 250,
        width: '100%',
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
});