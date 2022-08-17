import { StyleSheet, Dimensions, StatusBar} from "react-native";

import palettes from "../components/palettes";
var pallette = palettes[2]

export default StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: pallette[3]
    },

    innerContainer: {
        marginLeft: 20,
        marginRight: 20,
    },

    title: {
        fontSize: 27,
        color: pallette[5],
        top: 25,
    },

    mainText: {
        top: 20,
        color: pallette[5],
    },

    date: {
        color: pallette[5],
        fontWeight: "100",
        top: 15,
    },

     container: {
            flexDirection: 'row', 
        },
    
    title: {
        fontSize: 27,
        color: pallette[5],
        top: 25,
    },

    mainText: {
        top: 20,
        color: pallette[5],
    },

    debugButton: {
        backgroundColor: "red",
        height: 60,
        width: 60,
        borderRadius: 100,
        position: "absolute",
        top: Dimensions.get("window").height / 1.22,
        right: Dimensions.get("window").width / 1.3
    },

    h1: {
        fontWeight: '600',
        fontSize: 18,
        top: 16,
        color: pallette[0],
    },

    date: {
        color: pallette[5],
        fontWeight: "100",
        top: 15,
    },

    mainTextNotes: {
        marginRight : 20,
    },
})