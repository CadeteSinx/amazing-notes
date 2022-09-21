import React, {useState, useEffect} from 'react';
import { View, TouchableOpacity, TextInput, Text, Modal, Dimensions, BackHandler, ScrollView} from 'react-native';
import * as FileSystem from "expo-file-system"

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'

import styles from './styles/styles';
import noteStyles from "./styles/noteStyles"
import Task from './components/task';
import palettes from './components/palettes';
const pallette = palettes[2]
var typePalette = palettes[3]


export default function Checklist({navigation, route}) {
    const dir = route.params.dir
    const file = route.params.ob

    //Setup variables
    const [object, setObject] = useState(JSON.parse(file))
    const [title, setTitle] = useState(object.title)
    const [tasks, setTasks] = useState(object.tasks)

    const [modalVisible, setModalVisible] = useState(false)
    const [tempTask, setTempTask] = useState('')
    const [tempDescription, setTempDescription] = useState('')

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
    
    const saveFile = () => {
        let newOb = {
            date: object.date,
            title: title,
            type: object.type,
            tasks: tasks
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
        <View style={noteStyles.outerContainer}>
            <ScrollView style={noteStyles.innerContainer}>

                <View style={{height: 100, backgroundColor: pallette[3]}}>
                    <TouchableOpacity onPress={() => {
                        saveFile()
                    }}>
                        <FontAwesomeIcon icon={faChevronLeft} size={38} style={{ color: pallette[5], top: 25, backgroundColor: pallette[2], borderRadius: 10}}/> 
                    </TouchableOpacity>
                    <TextInput style={[noteStyles.title, {color: typePalette[2]}]} value={title} onChangeText={setTitle}></TextInput>
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
                            <Text style={{color: "#777777", fontStyle: "italic", fontSize: 20, top: 20}}>Press the + Button to add Task!</Text>
                        </View>
                    :
                    tasks.map((item, index) => {
                        if(item.description == '' || item.description == undefined){
                            return (
                                <TouchableOpacity key={index} onPress={() => complete(tasks, index, setTasks, 1)} onLongPress={() => complete(tasks, index, setTasks)}>
                                    <Task text={tasks[index].title} done={tasks[index].done} color={pallette[5]}/>
                                </TouchableOpacity>
                            )
                        }else{
                            return (
                                <TouchableOpacity key={index} onPress={() => complete(tasks, index, setTasks, 1)} onLongPress={() => complete(tasks, index, setTasks)}>
                                    <Task text={tasks[index].title} done={tasks[index].done} description={tasks[index].description} color={pallette[5]}/>
                                </TouchableOpacity>
                            )
                        }
                    })
                }
                        {/*FIXME transform this into a component*/}

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
