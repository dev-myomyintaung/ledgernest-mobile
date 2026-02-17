import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { line, curveCatmullRom } from 'd3-shape';

interface WavyGraphProps {
    data: number[];
    height?: number;
    color?: string;
}

export const WavyGraph = ({ data, height = 200, color = '#000000' }: WavyGraphProps) => {
    const { width } = useWindowDimensions();
    const graphWidth = width - 32; // padding

    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Scale points to fit the SVG
    const points = data.map((value, index) => ({
        x: (index / (data.length - 1)) * graphWidth,
        y: height - ((value - min) / range) * (height * 0.6) - (height * 0.2), // leave some padding top/bottom
    }));

    // Create smooth curve
    const lineGenerator = line<{ x: number; y: number }>()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(curveCatmullRom.alpha(0.5));

    const path = lineGenerator(points);

    if (!path) return null;

    return (
        <View style={{ height, width: graphWidth, alignSelf: 'center' }}>
            <Svg width={graphWidth} height={height}>
                <Path
                    d={path}
                    stroke={color}
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                />
                {/* Fill area below the curve */}
                <Path
                    d={`${path} L ${graphWidth} ${height} L 0 ${height} Z`}
                    fill={`${color}10`} // 10% opacity
                    stroke="none"
                />
            </Svg>
        </View>
    );
};
