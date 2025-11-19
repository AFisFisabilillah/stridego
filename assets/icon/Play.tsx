import * as React from "react"
import Svg, { Path } from "react-native-svg"
import {View} from "react-native";

function PlayIcon({width, height}: {width: number, height: number}) {
    return (
       <View>
           <Svg
               xmlns="http://www.w3.org/2000/svg"
               width={width}
               viewBox="0 0 1500 1499.999933"
               height={height}
           >
               <Path
                   fill="#fff"
                   d="M1315.828 876.75l-882.617 555.82c-95.606 64.938-232.809-14.32-229.238-128.593V192.305C200.253 77.812 337.789-1.004 433.21 63.675l882.656 555.856c93.176 54.559 92.992 202.625-.039 257.219zm0 0"
               />
           </Svg>
       </View>
    )
}

export default PlayIcon
