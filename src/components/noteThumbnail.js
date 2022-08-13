import {TouchableOpacity, Alert, Text, View, StyleSheet} from 'react-native';
import * as FileSystem from "expo-file-system"

import palettes from './palettes';
const pallette = palettes[0]


export default function NoteThumbnail({title, main, date, type, callBack, setupApp}){
    const doc = FileSystem.documentDirectory
    let page = ''
    if(type == "Simple Note" || type == "Checklist" || type == "Recipe"){
        page = "Note"
    }else{
        page = "Note"
    }
    const setupText = (main, type) => {
        let string = ""
        if(type == "Checklist"){
            main.forEach(element => {
                let isChecked = element.done
                if(isChecked){
                    let taskString = `✔️     ${element.title}\n`
                    string += taskString
                }else{
                    let taskString = `✖️     ${element.title}\n`
                    string += taskString
                }
            });
        }
       if(type == "Recipe"){
            main.forEach(element => {
                let taskString = `► ${element.text}\n`
                let trimmedString = taskString.substring(0, 26);
                string += trimmedString+"\n"
            });
       }
        return string
    }
    
    return (
        <TouchableOpacity
                style={homeStyles.note}
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
                <View style={homeStyles.noteHeader}>
                    {type == "Simple Note" &&
                        <Text style={[homeStyles.noteType, homeStyles.noteNote]}>{type}</Text>
                    }
                    {type == "Recipe" &&
                        <Text style={[homeStyles.noteType, homeStyles.noteRecipe]}>{type}</Text>
                    }
                    {type == "Checklist" &&
                        <Text style={[homeStyles.noteType, homeStyles.noteChecklist]}>{type}</Text>
                    }
                    {type == "Reminder" &&
                        <Text style={[homeStyles.noteType, homeStyles.noteReminder]}>{type}</Text>
                    }
                    <Text style={homeStyles.noteDate}>{date}</Text>
                </View>
                <Text style={homeStyles.noteTitle}>{title}</Text>
                    {type == "Simple Note" &&
                        <Text style={homeStyles.noteMain} numberOfLines={5}>{main}</Text>
                    }
                    {type == "Recipe" &&
                        <Text style={homeStyles.noteMain} numberOfLines={5}>{`${setupText(main, type)}`}</Text>
                    }
                    {type == "Checklist" &&
                        <Text style={homeStyles.noteMain} numberOfLines={5}>{`${setupText(main, type)}`}</Text>
                    }
                    {type == "Reminder" &&
                        <Text style={homeStyles.noteMain} numberOfLines={5}>{`${setupText(main, type)}`}</Text>
                    }
        </TouchableOpacity>
    )
};

  
const homeStyles = StyleSheet.create({
    note: {
        backgroundColor: pallette[2],
        height: 180,
        width: 170,
        margin: 10,
        borderRadius: 20,
    },

    noteTitle: {
        textAlign: "center",
        fontSize: 20,
    },

    noteMain: {
        fontSize: 15,
        margin: 5,
        top: 5,
        color: pallette[0]
    },

    noteDate: {
        fontSize: 12,
        fontWeight: "300",
        textAlign: "right",
        marginRight: 8,
        marginTop: 5,
        color: pallette[5]
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