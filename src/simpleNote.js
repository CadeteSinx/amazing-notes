import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, BackHandler, ScrollView} from 'react-native';
import * as FileSystem from "expo-file-system"

import palettes from "./components/palettes";
import noteStyles from './styles/noteStyles';

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'

var pallette = palettes[2]
var typePalette = palettes[3]

export default function SimpleNote({navigation, route}) {
    const dir = route.params.dir
    const file = route.params.ob

    useEffect(() => {
        const handler = () => {
            saveFile()
            return true;
        }
        BackHandler.addEventListener('hardwareBackPress', () => handler());
    })

    const [object, setObject] = useState(JSON.parse(file))
    const [title, setTitle] = useState(object.title)
    const [mainText, setMainText] = useState(object.mainText)

    const saveFile = () => {
        let newOb = {
            date: object.date,
            title: title,
            type: object.type,
            mainText: mainText
        }

        FileSystem.deleteAsync(dir).then(() => {
            FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "Notes/" + title + ".json", JSON.stringify(newOb)).then(() => {
                navigation.navigate('Home')
            })
        })
    }

    return (
        <ScrollView style={noteStyles.outerContainer}>
            <View style={noteStyles.innerContainer}>
                <View style={{height: 100, backgroundColor: pallette[3]}}>
                    <TouchableOpacity onPress={() => {
                        saveFile()
                    }}>
                        <FontAwesomeIcon icon={faChevronLeft} size={38} style={{ color: pallette[5], top: 25, backgroundColor: pallette[2], borderRadius: 10}}/> 
                    </TouchableOpacity>
                    <TextInput testID='title' style={[noteStyles.title, {color: typePalette[0]}]} value={title} onChangeText={setTitle}></TextInput>
                </View>

                <View>
                    <Text style={noteStyles.date}>{object.date}</Text>
                    <TextInput testID='mainText' style={noteStyles.mainText} value={mainText} placeholder={'You can write here!'} placeholderTextColor={"#777777"} onChangeText={setMainText} multiline={true}></TextInput>
                </View>
            </View>
        </ScrollView>
    );
}

