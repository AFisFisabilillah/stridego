import {SafeAreaView} from "react-native-safe-area-context";
import {Text, View} from "react-native";
import {Link} from "expo-router";

export default function Home() {
    return(
        <>
            <SafeAreaView>
                <View>
                    <Link href={{
                        pathname: "/(auth)/register",
                    }}>
                        <Text>register click here</Text>
                    </Link>
                </View>
                <Link href={{
                    pathname: "/welcomescreen",
                }}>
                    <Text>Welcome Screen </Text>
                </Link>
            </SafeAreaView>
        </>
    )
}