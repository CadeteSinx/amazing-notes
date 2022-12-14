import {TouchableOpacity, Alert, Text, View, StyleSheet} from 'react-native';
import * as FileSystem from "expo-file-system"
import * as Notifications from "expo-notifications"

import palettes from './palettes';
const pallette = palettes[0]
var typePallette = palettes[3]


export default function NoteThumbnail({title, main, date, type, identifier,callBack, setupApp}){
    const homeStyles = StyleSheet.create({
        note: {
            height: 180,
            width: 170,
            margin: 10,
            borderRadius: 20,
        },
        
        noteTitle: {
            top: 5,
            left: 10,
            fontSize: 20,
            fontWeight: "500",
        },
    
        noteMain: {
            fontSize: 15,
            margin: 5,
            top: 5,
            color: pallette[0]
        },
    
        noteDate: {
            fontSize: 12,
            fontWeight: "200",
            marginLeft: 20,
            marginTop: 10,
            position: 'absolute',
            bottom: 10
            
        },
    
        noteNote: {
            color: "blue",
            fontSize: 13,
            top: 1
        },
    
        noteRecipe: {
            color: "green",
        },
    
        noteChecklist: {
            color: "purple",
        },
    
        noteReminder: {
            color: "yellow",
        },
    
        noteType: {
            fontSize: 14,
            fontWeight: "500",
            marginLeft: 8,
            marginTop: 3,
    
        },
    
        noteHeader: {
            flexDirection: "row",
            justifyContent: "space-between"
        },
    })

    const doc = FileSystem.documentDirectory
    let page = ''
    if(type == "Checklist"){
        page = "Checklist"
    }
    if(type == "Simple Note"){
        page = "SimpleNote"
    }
    if(type == "Recipe"){
        page = "Recipe"
    }
    if(type == "Reminder"){
        page = "Note"
    }
    const setupText = (main, type) => {
        let string = ""
        if(type == "Checklist"){
            main.forEach(element => {
                let isChecked = element.done
                if(isChecked){
                    let taskString = `??????     ${element.title}\n`
                    string += taskString
                }else{
                    let taskString = `??????     ${element.title}\n`
                    string += taskString
                }
            });
        }
       if(type == "Recipe"){
            main.forEach(element => {
                let taskString = `??? ${element.text}\n`
                let trimmedString = taskString.substring(0, 26);
                string += trimmedString+"\n"
            });
       }
       if(type == "Reminder"){
            main.forEach(element => {
                let taskString = `??? ${element.text}\n${new Date(element.date).toLocaleTimeString()}\n`
                let trimmedString = taskString.substring(0, 26);
                string += trimmedString+"\n"
            })
       }
        return string
    }
    
    return (
        <View>
            {type == "Simple Note" ?
                <TouchableOpacity
                style={[homeStyles.note, {backgroundColor: typePallette[0]}]}
                    onLongPress={() => {
                        Alert.alert(
                            "Delete?",
                            "",
                            [
                                {
                                    text: "Yes",
                                    onPress: () => {
                                        FileSystem.deleteAsync(doc + "Notes/" + title + ".json").then(setupApp())
                                    }
                                },
                                {
                                    text: "No"
                                }
                            ]
                        )
                    }}
                    onPress={() => {callBack(page, `${doc}Notes/${title}.json`)}}
                >
                    
                    <Text style={homeStyles.noteTitle}>{title}</Text>
                    <Text style={homeStyles.noteMain} numberOfLines={5}>{main}</Text>
                    <Text style={homeStyles.noteDate}>{date}</Text>
                </TouchableOpacity>
            :   
                <TouchableOpacity
                    //style={[homeStyles.note, {backgroundColor: '#BCFAC4'}]}
                    style={
                        type == "Recipe" ?
                        [homeStyles.note, {backgroundColor: typePallette[1]}]
                        : type == "Checklist" ?
                        [homeStyles.note, {backgroundColor: typePallette[2]}]
                        :
                        [homeStyles.note, {backgroundColor: typePallette[3]}]
                    }
                    onLongPress={() => {
                        Alert.alert(
                            "Delete?",
                            "",
                            [
                                {
                                    text: "Yes",
                                    onPress: () => {
                                        if(type == 'Reminder'){
                                            Notifications.getAllScheduledNotificationsAsync().then((array) => {
                                                if(array.length == 0){
                                                    FileSystem.deleteAsync(doc + "Notes/" + title + ".json").then(setupApp())
                                                }else{
                                                    array.forEach((element, index) => {
                                                        let newString = element.content.data.notificationIdentifier
                                                        newString = newString.split('-')
                                                        if(newString[0] == identifier){
                                                            Notifications.cancelScheduledNotificationAsync(element.identifier)
                                                        }
                                                        if(index == array.length - 1){
                                                            FileSystem.deleteAsync(doc + "Notes/" + title + ".json").then(setupApp())
                                                        }
                                                    })
                                                }   
                                            })
                                        }else{
                                            FileSystem.deleteAsync(doc + "Notes/" + title + ".json").then(setupApp())
                                        }
                                    }
                                },
                                {
                                    text: "No"
                                }
                            ]
                        )
                    }}
                    onPress={() => {callBack(page, `${doc}Notes/${title}.json`)}}
                >
                    
                    <Text style={homeStyles.noteTitle}>{title}</Text>
                    <Text style={homeStyles.noteMain} numberOfLines={5}>{`${setupText(main, type)}`}</Text>
                    <Text style={homeStyles.noteDate}>{date}</Text>      
                </TouchableOpacity>
            } 
        </View>
    )
};

  
