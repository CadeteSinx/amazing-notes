import { View, FlatList, Text, Modal, TextInput, SafeAreaView, TouchableOpacity, Dimensions, StatusBar} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";


//Custom 
import palettes from "./components/palettes";
import styles from "./styles/styles";
import NoteThumbnail from "./components/noteThumbnail";

const pallette = palettes[0]


export default function Home({navigation}) {

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
                    console.log(dir)
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
            return <NoteThumbnail title={item.title} main={item.tasks} date={item.date} type={item.type} callBack={callback} setupApp={setupApp}/>
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

/*
    FileSystem.readDirectoryAsync(doc + "Notes").then((arr) => {
        console.log(arr)
        arr.forEach(element => {
            //console.log(element)
            //FileSystem.deleteAsync(doc + "Notes/" + element)
        });
    })

   */
    StatusBar.setBackgroundColor(pallette[0])
    StatusBar.setBarStyle("light-content")

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: pallette[1]}}>
            <View style={styles.header}>
                <Text style={styles.text}> Amazing Notes </Text>
            </View>


            <Picker
                selectedValue={tag}
                style={{ height: 50, width: Dimensions.get("window").width, backgroundColor:pallette[2], marginBottom: 10 }}
                onValueChange={(itemValue, itemIndex) => {setTag(itemValue); setupTags(itemValue)}}
            >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Simple Note" value="Simple Note" />
                <Picker.Item label="Recipe" value="Recipe" />
                <Picker.Item label="Checklist" value="Checklist" />
                <Picker.Item label="Reminder" value="Reminder" />

            </Picker>
        
            {/* TODO: Make this code less ugly and unreadible */}
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
                                    break;
                            }
                            FileSystem.writeAsStringAsync(doc + "Notes/" + tempTitle + ".json", JSON.stringify(ob)).then((file) => {
                                setupApp()
                                setModalVisible(!modalVisible)
                                navigation.navigate("Note", {ob: JSON.stringify(ob), dir: doc + "Notes/" + tempTitle + ".json"})
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

            <TouchableOpacity style={styles.aditionButton} onPress={() => {
                setModalVisible(true)
            }}>
                <Text style={styles.aditionButtonText}> + </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}