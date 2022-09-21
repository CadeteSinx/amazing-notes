import {useState, useEffect} from "react"
import { View, TextInput, Text, Dimensions ,Modal, TouchableOpacity, SafeAreaView, BackHandler, ScrollView} from "react-native";
import * as FileSystem from "expo-file-system";
import Checkbox from 'expo-checkbox';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Notifications from "expo-notifications";
import { Picker } from "@react-native-picker/picker";

//Custom components
import palettes from "./components/palettes";
import styles from "./styles/styles";
import noteStyles from "./styles/noteStyles"

Notifications.setNotificationHandler({
    handleNotification: async() => {
        return {
            shouldShowAlert: true
        }
    }
})

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'

var pallette = palettes[2]
var typePalette = palettes[3]


export default function Note({route, navigation}) {
    const [modalVisible, setModalVisible] = useState(false)

    const [repeats, setRepeats] = useState(false)
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [repeatType, setRepeatType] = useState('Daily')

    const scheduleNotification = (text, repeats, repeatType, date) => {
        const nd = new Date(date)
        const time = nd.toLocaleTimeString()
        const string = time.split(":")
        const hour = parseInt(string[0])
        const minutes = parseInt(string[1])

        if(repeats){
            const trigger = {
                hour: hour,
                minute: minutes,
                repeats: repeats
            }
            if(repeatType == "Weekly"){
                const dayOfWeek = nd.getDay()
                trigger.weekday = dayOfWeek
            }
            Notifications.scheduleNotificationAsync({
                content: {
                    title: `${title}-${text}`,
                    body: "",
                    data: {notificationIdentifier: `${object.identifier}-${text}`},
                },
                trigger
            })
        }else{
            Notifications.scheduleNotificationAsync({
                content: {
                    title: text,
                    body: "",
                    data: {notificationIdentifier: `${object.identifier}-${text}`},
                },
                trigger: {
                    date: date,
                    repeats: repeats,
                }
            })
        }
    }

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        const ob = {
            text: tempTitle,
            repeats: repeats,
            repeatType: repeatType,
            date: date.toLocaleString(),
            done: false
        }
        setTasks([...tasks, ob])
        try{
            scheduleNotification(ob.text, ob.repeats,ob.repeatType,Date.parse(ob.date))
        }catch(err){
            console.log(err)
        }
        setRepeats(false)
        setRepeatType('')
        setDatePickerVisibility(false);
        setModalVisible(false)
     };

    const handleEnd = (item, index) => {
        if(item.repeats){
            const date1 = new Date()
            const date2 = new Date(item.date)
            if(item.done == false){
                if(date2.getDate() == date1.getDate()){
                    item.done = true
                    const date = new Date(item.date)
                    date.setDate(date.getDate() + 1)
                    item.date = date.toLocaleString()
                    setupPage()
                }else{
                    item.done = true
                    const time = new Date(item.date)
                    const day = new Date()
                    day.setDate(day.getDate() + 1)
                    const newDate = new Date()
                    newDate.setTime(time.getTime())
                    newDate.setDate(day.getDate())
                    item.date = day.toLocaleString()
                    setupPage()
                }
            }            
        }else{
            Notifications.getAllScheduledNotificationsAsync().then((array) => {
                if(array.length == 0){
                    complete(tasks, index, setTasks)
                }else{
                    array.forEach((element) => {
                        if(element.content.data.notificationIdentifier == object.identifier + "-" + item.title){
                            Notifications.cancelScheduledNotificationAsync(element.identifier)
                           complete(tasks, index, setTasks)
                        }else{
                           complete(tasks, index, setTasks)
                        }
                    })
                }
            })
        }
    }

    const dir = route.params.dir
    const file = route.params.ob

    //Setup variables
    const [object, setObject] = useState(JSON.parse(file))
    const [title, setTitle] = useState(object.title)
    const [type, setType] = useState(object.type)
    const [mainText, setMainText] = useState(object.mainText)
    const [ingredientes, setIngredientes] = useState(object.ingredientes)
    const [tasks, setTasks] = useState(object.tasks)

    const complete = (array, index, callback, option=0) => {
        let arrayCopy = [...array]
        if(option == 0){
            arrayCopy.splice(index, 1)
            callback(arrayCopy)
        }else{
            const copyOb = arrayCopy[index]
            copyOb.done = !copyOb.done
            arrayCopy[index] = copyOb
            callback(arrayCopy)
        }
        
    }
    
    const setupPage = () => {
        pallette = global.pallette
        FileSystem.readAsStringAsync(dir).then((file) => {
            const ob = JSON.parse(file)
            setObject(ob)
            setTitle(ob.title)
            setType(ob.type)
            setMainText(ob.mainText)
            if(ob.type == "Recipe"){
                if(ingredientes.length == 0){
                    setIngredientes(ob.ingredientes)
                }
            }
            if(ob.type == "Reminder"){
                ob.tasks.forEach((element) => {
                    if(element.repeats == true && new Date(element.date) <= new Date()){
                        element.done = false
                    }
                }) 
            }

            if(ob.type == "Checklist" || ob.type == "Reminder"){
                if(tasks.length == 0){
                    setTasks(ob.tasks)
                }
            }
        })
    }

    const saveFile = () => {
        let newOb = {
            date: object.date,
            title: title,
            type: object.type
        }
        if(type == "Simple Note" || type == "Recipe"){
            newOb.mainText = mainText
        }
        if(type == "Recipe"){
            newOb.ingredientes = ingredientes
        }
        if(type == "Checklist" || type == "Reminder"){
            newOb.tasks = tasks
        }
        if(type == "Reminder"){
            newOb.identifier = object.identifier
        }

        FileSystem.deleteAsync(dir).then(() => {
            FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "Notes/" + title + ".json", JSON.stringify(newOb)).then(() => {
                navigation.navigate('Home')
            })
        })
    }

    useEffect(() => {
        const handler = () => {
            saveFile()
            return true;
        }
        BackHandler.addEventListener('hardwareBackPress', () => handler());
    })

    return (
        <View style={{flex: 1,backgroundColor: pallette[3]}}>
            <ScrollView style={{marginLeft: 20, marginRight: 20}}>

                <View style={{height: 100, backgroundColor: pallette[3]}}>
                    <TouchableOpacity onPress={() => {
                        saveFile()
                    }}>
                        <FontAwesomeIcon icon={faChevronLeft} size={38} style={{ color: pallette[5], top: 25, backgroundColor: pallette[2], borderRadius: 10}}/> 
                    </TouchableOpacity>
                    <TextInput style={
                        type == "Simple Note" ?
                        [noteStyles.title, {color: typePalette[0]}]:
                        type == "Recipe" ?
                        [noteStyles.title, {color: typePalette[1]}]:
                        type == "Checklist" ?
                        [noteStyles.title, {color: typePalette[2]}]:
                        [noteStyles.title, {color: typePalette[3]}]

                    } value={title} onChangeText={setTitle}></TextInput>
                </View>

                
                <View>
                    <Text style={noteStyles.date}>{object.date}</Text>


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
                            <TextInput style={styles.modalText} placeholder="Title: " onChangeText={setTempTitle}></TextInput>
                            <Text style={{marginBottom: 10}}>
                                <Text>Repeats? </Text>
                                <Checkbox
                                disabled={false}
                                value={repeats}
                                onValueChange={(newValue) => setRepeats(newValue)}
                                />
                            </Text>
                            
                            {
                                repeats==true &&
                                    <View>
                                        <Picker
                                            selectedValue={repeatType}
                                            style={{ height: 50, width: 150}}
                                            onValueChange={(itemValue, itemIndex) => setRepeatType(itemValue)}
                                        >
                                            <Picker.Item label="Daily" value="Daily" />
                                            <Picker.Item label="Weekly" value="Weekly" />
                                        </Picker>
                                    </View>
                            }

                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => {
                                    if(tempTitle == '' || tempTitle == null) return
                                    showDatePicker()
                                }}
                            >
                                <Text style={noteStyles.textStyle}>Confirm</Text>
                            </TouchableOpacity>

                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                date={new Date()}
                                mode="datetime"
                                onConfirm={(date) => {
                                    handleConfirm(date)
                                }}
                                onCancel={hideDatePicker}
                            />
                        </View>
                        </View>
                    </Modal>

                    {
                        tasks.length == 0 ?
                            <View></View>
                        :
                        tasks.map((item, index, key) => {
                            return (
                                <View>
                                    <TouchableOpacity 
                                        onLongPress={() => {
                                            Notifications.getAllScheduledNotificationsAsync().then((array) => {
                                                if(array.length == 0){
                                                    let tempArray = tasks
                                                    tempArray.splice(index, 1)
                                                    complete(tasks, index, setTasks)
                                                }else{
                                                    array.forEach(element => {
                                                        if(element.content.data.notificationIdentifier == object.identifier + "-" + item.text){
                                                            Notifications.cancelScheduledNotificationAsync(element.identifier)
                                                            let tempArray = tasks
                                                            tempArray.splice(index, 1)
                                                            complete(tasks, index, setTasks)
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                    }

                                    onPress={() => {
                                            handleEnd(item, index)
                                        }}
                                    >       
                                        {
                                            new Date(item.date) >= new Date() || item.done == true?
                                                <View>
                                                    <Text style={{color: '#fff', top: 20, fontWeight: '600', paddingTop: 10}}>
                                                        <Text>{item.text}   </Text>
                                                    </Text>
                                                    <Text style={{color: typePalette[3], top: 20}}>{item.date}</Text>
                                                </View>
                                            :
                                            <View>
                                                <Text style={{color: '#fff', top: 20, fontWeight: '600', paddingTop: 10}}>
                                                    <Text style={{color: "#F34343", fontWeight: "bold"}}>{item.text}   </Text>
                                                </Text>
                                                <Text style={{color: typePalette[3], top: 20}}>{item.date}</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                            )
                        })
                    }        
                        <TouchableOpacity style={{backgroundColor: pallette[2], height: 60, width: 60, borderRadius: 100, position: "absolute", top: Dimensions.get("window").height / 1.3, left: Dimensions.get("window").width / 1.4}} onPress={() => {
                            setModalVisible(true)
                        }}>
                            <Text style={{alignSelf: "center", fontSize: 40, color: pallette[0]}}> + </Text>
                        </TouchableOpacity>
                </View>
            </ScrollView>

            <TouchableOpacity style={{backgroundColor: pallette[2], height: 60, width: 60, borderRadius: 100, position: "absolute", top: Dimensions.get("window").height / 1.09, left: Dimensions.get("window").width / 1.4}} onPress={() => {
                    setModalVisible(true)
                }}>
                <Text style={{alignSelf: "center", fontSize: 40, color: pallette[0]}}> + </Text>
            </TouchableOpacity>
        </View>
    );
}

