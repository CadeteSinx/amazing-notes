import {useState, useEffect} from "react"
import { View, TextInput, Text, StyleSheet, Pressable,Dimensions ,Modal, TouchableOpacity, SafeAreaView, BackHandler} from "react-native";
import * as FileSystem from "expo-file-system";
import Checkbox from 'expo-checkbox';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as Notifications from "expo-notifications";
import { Picker } from "@react-native-picker/picker";


//Custom components
import palettes from "./components/palettes";
import Ingredients from "./components/ingredients";
import Task from "./components/task";
import styles from "./styles/styles";


Notifications.setNotificationHandler({
    handleNotification: async() => {
        return {
            shouldShowAlert: true
        }
    }
})

//FIXME: Get more stuff
//FONT AWESOME
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faChevronLeft,
    faPlus,
} from '@fortawesome/free-solid-svg-icons'
import { useFocusEffect } from "@react-navigation/native";

const pallette = palettes[0]


export default function Note({route, navigation}) {
    const [modalVisible, setModalVisible] = useState(false)
    const [ingredientModalVisible, setIngredientModal] = useState(false)
    const [tempIngrediente, setTempIngrediente] = useState('')
    const [tempTask, setTempTask] = useState('')
    const [tempDescription, setTempDescription] = useState('')
    const [currentIngredient, setCurrentIngredient] = useState('')

    //OPTIMIZE: Time stuff
    const [repeats, setRepeats] = useState(false)
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [repeatType, setRepeatType] = useState('Daily')

    const [debugList, setDebugList] = useState([])

    const scheduleNotification = (title, repeats, repeatType, date) => {
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
                    title: title,
                    body: "",
                    data: {},
                },
                trigger
            });
        }else{
            Notifications.scheduleNotificationAsync({
                content: {
                    title: title,
                    body: "",
                    data: {},
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

    const handleConfirm = (date, title=tempTitle) => {
        const ob = {
            text: title,
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
                    console.log(date.toLocaleString())
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
                        if(element.content.title == item.text){
                            Notifications.cancelScheduledNotificationAsync(element.identifier)
                           complete(tasks, index, setTasks)
                        }
                    })
                }
            })
        }
    }

    //OPTIMIZE: Time stuff

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
        console.log('======================')
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

        FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "Notes/" + title + ".json", JSON.stringify(newOb)).then(() => {
            navigation.navigate('Home')
        })
        
    }

    const handleModalSetup  = (index) => {
        setCurrentIngredient(ingredientes[index]);
        setIngredientModal(true) 
    }

    const handleEdit = (op=false) => {
        if(tempIngrediente.length == 0 && op == false){
            setIngredientModal(!ingredientModalVisible)
            return
        }
        const indexOfIngredient = ingredientes.indexOf(currentIngredient)
        const tempArray = ingredientes
        tempArray[indexOfIngredient] = {text: tempIngrediente}
        setIngredientes(tempArray)
        setTempIngrediente('')
        setCurrentIngredient('')
        setIngredientModal(!ingredientModalVisible)
    }

    useEffect(() => {
        const handler = () => {
            console.log(mainText)
            saveFile()
            return true;
        }
        BackHandler.addEventListener('hardwareBackPress', () => handler());
    })

    return (
        <SafeAreaView style={{flex: 1,backgroundColor: pallette[2]}}>
            <View style={styles.header}>
                <View style={noteStyles.container}>
                    <TouchableOpacity onPress={() => {
                        saveFile()
                    }}>
                        <FontAwesomeIcon icon={faChevronLeft} size={35} style={{ color: pallette[5], top: 5}}/> 
                    </TouchableOpacity>

                    <TextInput style={styles.text} value={title} onChangeText={setTitle}></TextInput>
                </View>
                

            </View>

            {type == "Recipe" &&
                <View>

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
                            <TextInput style={styles.modalText} placeholder="ex: 2kg de carne moida" onChangeText={setTempIngrediente}></TextInput>
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => {
                                    const newOb = {
                                        "text": tempIngrediente,
                                    }
                                    setIngredientes([...ingredientes, newOb])
                                    setModalVisible(!modalVisible)
                                }}
                            >
                            <Text style={styles.textStyle}>Confirm</Text>
                            </Pressable>
                        </View>
                        </View>
                    </Modal>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={ingredientModalVisible}
                        onRequestClose={() => {
                        setIngredientModal(!ingredientModalVisible);
                        }}
                    >
                        <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <TextInput style={styles.modalText} placeholder={currentIngredient.text} onChangeText={setTempIngrediente}></TextInput>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => {
                                    handleEdit()
                                }}
                            >
                            <Text style={styles.textStyle}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                        </View>
                    </Modal>


                    <Text style={noteStyles.h1}>ingredientes</Text>
                    
                    {
                        ingredientes.length == 0 ?

                        <View>
                            <Text style={{color: "#777777", fontStyle: "italic", marginLeft: 20}}>Press the + Button to add ingredients!</Text>
                        </View>

                    :
                        ingredientes.map((item, index) => {
                            return (
                                <TouchableOpacity key={index} onLongPress={() => complete(ingredientes, index, setIngredientes)} onPress={() => {
                                        handleModalSetup(index)
                                    }}>
                                    <Ingredients  text={item.text}/>
                                </TouchableOpacity>
                            )
                        })
                    }

                    <Text style={noteStyles.h1}>Modo de Preparo</Text>
                    <TextInput style={noteStyles.mainTextNotes} value={mainText} placeholder={'You can write here!'} placeholderTextColor={"#777777"} onChangeText={setMainText} multiline={true}></TextInput>

                    <TouchableOpacity style={[styles.aditionButton, {top: Dimensions.get("window").height / 1.22}]} onPress={() => {
                        setModalVisible(true)
                    }}>
                        <Text style={styles.aditionButtonText}> + </Text>
                    </TouchableOpacity>
                </View>
            }
            {type == "Simple Note" &&
                <View>
                    <Text style={noteStyles.date}>{object.date}</Text>
                    <TextInput style={noteStyles.mainTextNotes} value={mainText} placeholder={'You can write here!'} placeholderTextColor={"#777777"} onChangeText={setMainText} multiline={true}></TextInput>
                </View>
                
            }
            {type == "Checklist" &&
                <View> 
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
                            <TextInput style={styles.modalText} placeholder="ex: Lavar roupa" onChangeText={setTempTask}></TextInput>
                            <TextInput style={styles.modalText} placeholder="descrição: (opcional)" onChangeText={setTempDescription} multiline={true}></TextInput>

                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => {
                                    if(tempTask == '' || tempTask == null) return

                                    let newOb;
                                    if(tempDescription == ''){
                                        newOb = {
                                            "title": tempTask,
                                            "done": false,
                                        }
                                    }else{
                                        newOb = {
                                            "title": tempTask,
                                            "done": false,
                                            "description": tempDescription
                                        }
                                    }
                                    setTasks([...tasks, newOb])
                                    setTempDescription('')
                                    setModalVisible(!modalVisible)
                                }}
                            >
                                <Text style={noteStyles.textStyle}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                        </View>
                    </Modal>

                    {
                        tasks.length == 0 ?
                            <View>
                                <Text style={{color: "#777777", fontStyle: "italic", marginLeft: 20, fontSize: 20, top: 20}}>Press the + Button to add Task!</Text>
                            </View>
                        :
                        tasks.map((item, index) => {
                            if(item.description == '' || item.description == undefined){
                                return (
                                    <TouchableOpacity key={index} onPress={() => complete(tasks, index, setTasks, 1)} onLongPress={() => complete(tasks, index, setTasks)}>
                                        <Task text={tasks[index].title} done={tasks[index].done}/>
                                    </TouchableOpacity>
                                )
                            }else{
                                return (
                                    <TouchableOpacity key={index} onPress={() => complete(tasks, index, setTasks, 1)} onLongPress={() => complete(tasks, index, setTasks)}>
                                        <Task text={tasks[index].title} done={tasks[index].done} description={tasks[index].description}/>
                                    </TouchableOpacity>
                                )
                            }
                        })
                    }

                    <TouchableOpacity style={[styles.aditionButton, {top: Dimensions.get("window").height / 1.22}]} onPress={() => {
                            setModalVisible(true)
                        }}>
                            <Text style={styles.aditionButtonText}> + </Text>
                    </TouchableOpacity>
                </View>
            }
            
            {/*  OPTIMIZE: Working on this: */}

            {type == "Reminder" && 
                <View>
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
                        tasks.map((item, index) => {
                            return (
                                <View>
                                    <TouchableOpacity 
                                        onLongPress={() => {
                                            Notifications.getAllScheduledNotificationsAsync().then((array) => {
                                                if(array.length == 0){
                                                    let tempArray = tasks
                                                    tempArray.splice(index, 1)
                                                    setTasks(tempArray)
                                                    complete(tasks, index, setTasks)
                                                }else{
                                                    array.forEach(element => {
                                                        if(element.content.title == item.text){
                                                            Notifications.cancelScheduledNotificationAsync(element.identifier)
                                                            let tempArray = tasks
                                                            tempArray.splice(index, 1)
                                                            setTasks(tempArray)
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
                                                    <Text>
                                                        <Text>{item.text}   </Text>
                                                    </Text>
                                                    <Text style={{fontWeight: "300"}}>{item.date}</Text>
                                                </View>
                                            :
                                            <View>
                                                <Text>
                                                    <Text style={{color: "#F35555"}}>{item.text}   </Text>
                                                </Text>
                                                <Text style={{fontWeight: "300"}}>{item.date}</Text>
                                            </View>
                                        }
                                    </TouchableOpacity>
                                </View>
                            )
                        })
                    }        

                    {/* DEBUG BUTTONS*/}
                    <TouchableOpacity style={noteStyles.debugButton} onPress={() => {
                            Notifications.cancelAllScheduledNotificationsAsync()
                        }}>
                            <Text style={styles.aditionButtonText}> + </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[noteStyles.debugButton, {backgroundColor: "blue", right: Dimensions.get("window").width / 1.7}]} onPress={() => {
                            Notifications.getAllScheduledNotificationsAsync().then((array) => {
                                console.log(array)
                            })
                        }}>
                            <Text style={styles.aditionButtonText}> + </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[noteStyles.debugButton, {backgroundColor: "green", right: Dimensions.get("window").width / 2.4}]} onPress={() => {
                            Notifications.getAllScheduledNotificationsAsync().then((array) => {
                                array.forEach((element) => {
                                    console.log(element.content.title)
                                })
                            })
                        }}>
                            <Text style={styles.aditionButtonText}> + </Text>
                    </TouchableOpacity>
                    {/* DEBUG BUTTONS*/}


                    <TouchableOpacity style={[styles.aditionButton, {top: Dimensions.get("window").height / 1.22}]} onPress={() => {
                           setModalVisible(true)
                        }}>
                            <Text style={styles.aditionButtonText}> + </Text>
                    </TouchableOpacity>
                </View>
            }
        </SafeAreaView>
    );
}

const noteStyles = StyleSheet.create({
    container: {
        flexDirection: 'row', 
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
        fontWeight: "bold",
        fontSize: 20
    },

    date: {
        textAlign: "center",
        fontWeight: "300"
    },

    mainTextNotes: {
        marginRight : 20,
        marginLeft: 20,
    },
})
