import * as React from "react"
import Svg, { Defs, ClipPath, Path, G } from "react-native-svg"

function StopIcon({width, height, fill}: {width: number, height: number, fill?: string}) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            viewBox="0 0 1500 1499.999933"
            height={height}
        >
            <Defs>
                <ClipPath id="a">
                    <Path d="M1500 75v1350a74.989 74.989 0 01-21.969 53.031A74.989 74.989 0 011425 1500H75a74.989 74.989 0 01-53.031-21.969A74.989 74.989 0 010 1425V75C0 33.578 33.578 0 75 0h1350a74.989 74.989 0 0153.031 21.969A74.989 74.989 0 011500 75zm0 0" />
                </ClipPath>
                <ClipPath id="c">
                    <Path d="M0 0h1500v1500H0zm0 0" />
                </ClipPath>
                <ClipPath id="d">
                    <Path d="M1500 75v1350a74.989 74.989 0 01-21.969 53.031A74.989 74.989 0 011425 1500H75a74.989 74.989 0 01-53.031-21.969A74.989 74.989 0 010 1425V75C0 33.578 33.578 0 75 0h1350a74.989 74.989 0 0153.031 21.969A74.989 74.989 0 011500 75zm0 0" />
                </ClipPath>
                <ClipPath id="b">
                    <Path d="M0 0H1500V1500H0z" />
                </ClipPath>
            </Defs>
            <G clipPath="url(#a)">
                <G clipPath="url(#b)">
                    <G clipPath="url(#c)">
                        <G clipPath="url(#d)">
                            <Path
                                fill={fill}
                                d="M-330 -329.999985H1830V1829.9999189999999H-330z"
                            />
                        </G>
                    </G>
                </G>
            </G>
        </Svg>
    )
}

export default StopIcon
