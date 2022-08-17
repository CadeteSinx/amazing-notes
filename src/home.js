import { View, FlatList, Text, Modal, TextInput, SafeAreaView, TouchableOpacity, Dimensions, StatusBar, Image, Alert} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";

//Custom 
import palettes from "./components/palettes";
import styles from "./styles/styles";
import NoteThumbnail from "./components/noteThumbnail";


import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faBars,
} from '@fortawesome/free-solid-svg-icons'

var pallette = palettes[2];
var typePallette = palettes[3];

export default function Home({navigation}) {
    let character = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
   
    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

    function getIdentifier() {
        let newString = ''
        for (let index = 0; index < 9; index++) {
            let int = getRndInteger(0, character.length)
            newString += character[int]  
        }
        return newString
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];


    const [tempTitle, setTempTitle] = useState();
    const [notes, setNotes] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedValue, setSelectedValue] = useState("Simple Note");
    const [tag, setTag] = useState("All");


    const [originalNotes, setOriginalNotes] = useState([])

    const doc = FileSystem.documentDirectory
    
    const callback = (page, string) => {
        FileSystem.readAsStringAsync(string).then((file) => {
            navigation.navigate(page, {ob: file, dir: string})
        })

    }

    const setupApp =  () => {
        setNotes([])
        FileSystem.readDirectoryAsync(doc).then((dirArray) => {
            if(!dirArray.includes("Notes")) {
                FileSystem.makeDirectoryAsync(doc + "Notes").then((dir) => {
                    const config = {
                        theme: 'dark'
                    }
                    FileSystem.writeAsStringAsync(doc + "config.json", JSON.stringify(config))
                })
            }else{
                FileSystem.readDirectoryAsync(doc + "Notes").then((dirArray) => {
                    let tempArray = []
                    dirArray.forEach(element => {
                        const fileUri = doc + "Notes/" + element
                        FileSystem.readAsStringAsync(fileUri).then((file) => {
                            const ob = JSON.parse(file)
                            tempArray.push(ob)
                            if(tempArray.length == dirArray.length){
                                setNotes(tempArray)
                                setOriginalNotes(tempArray)
                            }
                        })
                    });
                })
            }
        })
    } 
    
    useEffect(() => {
        setupApp()
        FileSystem.readAsStringAsync(doc + "config.json").then((file) => {
            const ob = JSON.parse(file)
            if(ob.theme == "Dark"){
                StatusBar.setBackgroundColor(pallette[3])
                StatusBar.setBarStyle("light-content")
            }
        })
    }, [])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setupApp()
        });
        return unsubscribe;
    }, [navigation]);

    const renderItem = ({item}) => {
        if(item.type == 'Simple Note'){
            return  <NoteThumbnail title={item.title} main={item.mainText} date={item.date} type={item.type} callBack={callback} setupApp={setupApp}/>
        }
        if(item.type == 'Recipe'){
            return <NoteThumbnail title={item.title} main={item.ingredientes} date={item.date} type={item.type} callBack={callback} setupApp={setupApp}/>
        }
        if(item.type == 'Checklist'){
            return <NoteThumbnail title={item.title} main={item.tasks} date={item.date} type={item.type} callBack={callback} setupApp={setupApp}/>
        }
        if(item.type == 'Reminder'){
            return <NoteThumbnail title={item.title} main={item.tasks} date={item.date} identifier={item.identifier} type={item.type} callBack={callback} setupApp={setupApp}/>
        }
    }

    const setupTags = (itemValue) => {
        if(itemValue == "All"){
            setNotes(originalNotes)
            return
        }
        let tempArray = []
        originalNotes.forEach(element => {
            if(element.type == itemValue){
                tempArray =[...tempArray, element]
            }
        })
        setNotes(tempArray)
    }

    StatusBar.setBackgroundColor(pallette[3])
    StatusBar.setBarStyle("light-content")

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: pallette[3]}}>
            <View style={{height: 100, backgroundColor: pallette[3]}}>
                <View style={{flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                    <Image source={require('../assets/logo_img_only.png')} style={styles.logo} ></Image>

                    <TouchableOpacity style={{position: "absolute", right: 10, top: 40}} onPress={() => {navigation.navigate('Settings')}}>
                        <FontAwesomeIcon icon={faBars} size={40} style={{ color: pallette[0], borderRadius: 10}}/> 
                    </TouchableOpacity>
                </View>
             </View>
            
            <Picker
                selectedValue={tag}
                style={
                    tag == "All" ?
                    {height: 50, width: Dimensions.get("window").width, backgroundColor:pallette[0], marginBottom: 10}
                    : tag == "Simple Note" ?
                    {height: 50, width: Dimensions.get("window").width, backgroundColor: typePallette[0], marginBottom: 10}
                    : tag == "Recipe" ?
                    {height: 50, width: Dimensions.get("window").width, backgroundColor:typePallette[1], marginBottom: 10}
                    : tag == "Checklist" ?
                    {height: 50, width: Dimensions.get("window").width, backgroundColor:typePallette[2], marginBottom: 10}
                    :
                    {height: 50, width: Dimensions.get("window").width, backgroundColor:typePallette[3], marginBottom: 10}

                }
                onValueChange={(itemValue, itemIndex) => {setTag(itemValue); setupTags(itemValue)}}
            >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Simple Note" value="Simple Note" />
                <Picker.Item label="Recipe" value="Recipe" />
                <Picker.Item label="Checklist" value="Checklist" />
                <Picker.Item label="Reminder" value="Reminder" />

            </Picker>
        
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                <View style={styles.modalView}>
                <Picker
                    selectedValue={selectedValue}
                    style={{ height: 50, width: 150}}
                    onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                >
                    <Picker.Item label="Simple Note" value="Simple Note" />
                    <Picker.Item label="Recipe" value="Recipe" />
                    <Picker.Item label="Checklist" value="Checklist" />
                    <Picker.Item label="Reminder" value="Reminder" />

                </Picker>

                    <TextInput style={styles.modalText} placeholder="Notes title" onChangeText={setTempTitle}></TextInput>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => {
                            if(tempTitle == null) return
                            const date = new Date()
                            const dateString = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
                            let ob = {
                                title: tempTitle,
                                date: dateString
                            }
                            switch (selectedValue) {
                                case "Simple Note":
                                    ob.type = "Simple Note",
                                    ob.mainText = ""
                                    break;
                                case "Recipe":
                                    ob.type = "Recipe"
                                    ob.ingredientes = []
                                    ob.mainText = ""
                                    break;
                                case "Checklist":
                                    ob.type = "Checklist"
                                    ob.tasks = []
                                    break;
                                case "Reminder":
                                    ob.type = "Reminder"
                                    ob.tasks = []
                                    ob.identifier = getIdentifier()
                                    break;
                            }
                            FileSystem.readDirectoryAsync(doc + "Notes/").then((arr) => {
                                if(arr.includes(`${tempTitle}.json`)){
                                    Alert.alert(
                                        "Arquivo ja existem",
                                        "Deseja sobreescrever?",
                                        [
                                        {
                                            text: "Cancelar",
                                            onPress: () => {return},
                                        },
                                        { text: "Sim", onPress: () => {
                                            FileSystem.writeAsStringAsync(doc + "Notes/" + tempTitle + ".json", JSON.stringify(ob)).then((file) => {
                                                setupApp()
                                                setModalVisible(!modalVisible)
                                                navigation.navigate("Note", {ob: JSON.stringify(ob), dir: doc + "Notes/" + tempTitle + ".json"})
                                            })
                                        }}
                                        ]
                                    );
                                }else{
                                    FileSystem.writeAsStringAsync(doc + "Notes/" + tempTitle + ".json", JSON.stringify(ob)).then((file) => {
                                        setupApp()
                                        setModalVisible(!modalVisible)
                                        navigation.navigate("Note", {ob: JSON.stringify(ob), dir: doc + "Notes/" + tempTitle + ".json"})
                                    })
                                }
                            })
                        }}
                    >
                    <Text style={styles.textStyle}>Confirm</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </Modal>
            
            <FlatList
                numColumns={2}
                data={notes}
                renderItem={renderItem}
                ListEmptyComponent={<View></View>}
            />

            <TouchableOpacity style={{backgroundColor: pallette[2], height: 60, width: 60, borderRadius: 100, position: "absolute", top: Dimensions.get("window").height / 1.1, left: Dimensions.get("window").width / 1.3}} onPress={() => {
                setModalVisible(true)
            }}>
                <Text style={{alignSelf: "center", fontSize: 40, color: pallette[0]}}> + </Text>
            </TouchableOpacity>


        </SafeAreaView>
    );
}