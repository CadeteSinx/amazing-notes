import { StyleSheet, Dimensions, StatusBar} from "react-native";

import palettes from "../components/palettes";
const pallette = palettes[0]

export default StyleSheet.create({
    header: {
        height: 70,
        backgroundColor: pallette[0],
        justifyContent: "center",
    },

    text: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
        alignSelf: "center",
        justifyContent: "center",
        top: 5
    },

    aditionButton: {
        backgroundColor: pallette[5],
        height: 60,
        width: 60,
        borderRadius: 100,
        position: "absolute",
        top: Dimensions.get("window").height / 1.1,
        left: Dimensions.get("window").width / 1.3 
    },

    aditionButtonText: {
        alignSelf: "center",
        fontSize: 40,
    },

    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
      
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },

    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },

    buttonClose: {
        backgroundColor: "#2196F3",
    },

    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },

    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
}) 
