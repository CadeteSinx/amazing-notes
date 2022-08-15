import { useState, useEffect} from "react";
import { View, SafeAreaView,Image, TouchableOpacity, Text, StyleSheet, Switch, Alert, BackHandler, Button} from "react-native";
import * as Linking from "expo-linking"
import * as FileSystem from "expo-file-system"
import * as Notifications from "expo-notifications"

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'

import {
    faGithub
}from "@fortawesome/free-brands-svg-icons"

//Custom
import palettes from "./components/palettes";
import styles from "./styles/styles";

var pallette = palettes[2] 

export default function Settings({route, navigation}){
    const [toggle, setToggle] = useState(theme)
    const [colorTheme, setColorTheme] = useState(false)
    const [currentMemory, setCurrentMemory] = useState(0)
    const [doc, setDoc] = useState(FileSystem.documentDirectory)

    useEffect(() => {
        pallette = global.pallette
        FileSystem.getFreeDiskStorageAsync().then((bytes) => {
            let gbValue = (bytes / (1000 * 1000 * 1000)).toFixed(2);
            setCurrentMemory(gbValue)
        })
    }, [])

    const toggleSwitch = () => {
        setToggle(previousState => !previousState)
        if(toggle){
            setColorTheme("Dark")
        }else{
            setColorTheme("Light")
        }
    };

    const handleExit = () => {
        FileSystem.deleteAsync(doc + "config.json").then(() => {
            const newOb = {
                theme: "Dark"
            }
            FileSystem.writeAsStringAsync(doc + "config.json", JSON.stringify(newOb)).then(() => {
                navigation.navigate('Home')
            })
        })
    }

    useEffect(() => {
        const handler = () => {
            handleExit()
            return true;
        }
        BackHandler.addEventListener('hardwareBackPress', () => handler());
    })

    const settingsStyle = StyleSheet.create({
        h1: {
            fontSize: 20,
            fontWeight: "600",
            color: pallette[0]
        },
        text: {
            fontSize: 18,
            color: pallette[5]
        },
        touchableOpacity: {
            position: "absolute",
            alignSelf: "flex-end",
            top: 75,
            right: 50
        },
    
        container: {
            alignItems: "center",
            flexDirection: "row"
        }
    })

     return (
        <SafeAreaView style={{flex: 1, backgroundColor: pallette[3]}}>
            <View style={{height: 100, backgroundColor: pallette[3]}}>
                <View style={{flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                    <Image source={require('../assets/logo_img_only.png')} style={styles.logo} ></Image>

                    <TouchableOpacity style={{position: "absolute", left: 10, top: 40}} onPress={() => {
                        handleExit()
                    }}>
                        <FontAwesomeIcon icon={faChevronLeft} size={40} style={{ color: pallette[0]}}/> 
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{paddingLeft: 20}}>
                <Text style={settingsStyle.h1}>About the app:</Text>
                <Text style={settingsStyle.text}>Create this app in react native as a way to practice. It is free and it will always be free.</Text>
                <Text style={settingsStyle.text}>You can see the github page here: </Text>
                <TouchableOpacity style={settingsStyle.touchableOpacity} onPress={() => {
                    Linking.openURL('https://github.com/CadeteSinx/amazing-notes');
                }}>
                    <FontAwesomeIcon icon={faGithub} size={30} style={{ color: pallette[0], borderRadius: 10}}/> 
                </TouchableOpacity>

                <Text style={[settingsStyle.h1, {paddingTop: 20}]}>Color Theme</Text>
                <View style={settingsStyle.container}>
                    <Switch
                        trackColor={{ false: pallette[2], true: pallette[1]}}
                        thumbColor={toggle ? "#fff" : "#000"}
                        onValueChange={toggleSwitch}
                        value={toggle}
                    />
                    <Text style={[settingsStyle.text]}>{colorTheme} Theme</Text>
                </View>
                <Text style={[settingsStyle.h1, {paddingTop: 10}]}>Memory</Text>
                <Text style={settingsStyle.text}>Current free system memory: {currentMemory}GB</Text>
                <TouchableOpacity style={{backgroundColor: pallette[2], borderWidth: 1, borderColor: '#FD3F3F', width: 150, height: 50, justifyContent: "center", top: 10, borderRadius: 15}} onPress={() => {
                        Alert.alert(
                            "Tem certeza?",
                            "Arquivos deletados não podem ser recuperados",
                            [
                              {
                                text: "Cancelar",
                                onPress: () => {return},
                              },
                              { text: "Sim", onPress: () => {
                                FileSystem.readDirectoryAsync(doc + "Notes").then((arr) => {
                                    arr.forEach(element => {
                                        Notifications.cancelAllScheduledNotificationsAsync().then(() => {
                                            FileSystem.deleteAsync(doc + "Notes/" + element).then(() => {
                                                Alert.alert(
                                                    "",
                                                    "Arquivos locais deletados",
                                                    [
                                                        {
                                                            text: "Ok",
                                                            onPress: () => {return},
                                                        }
                                                    ]
                                                )
                                            })
                                        })
                                    });
                                })
                              }}
                            ]
                          );
                }}>
                    <Text style={[settingsStyle.text, {color: '#FD3F3F'}]}>   Delete all files?</Text>
                </TouchableOpacity>
            </View>
            
        </SafeAreaView>
    );
}

