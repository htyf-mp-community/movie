import { useWindowDimensions } from "react-native";

export const useOrientation = () => {
    const { height: _height, width: _width, fontScale } = useWindowDimensions();

    const height = fontScale < 1 ? _height : _height * fontScale * 0.8
    const width = fontScale < 1 ? _width : _width * fontScale * 0.8
    const orientation = height > width ? 'PORTRAIT' : 'LANDSCAPE';

    const isLandscape = orientation === 'LANDSCAPE'
    const isPortrait = !isLandscape

    const numCols = Math.max(Math.floor(width / 168), 2)

    return { height, width, orientation, isLandscape, isPortrait, numCols }
}