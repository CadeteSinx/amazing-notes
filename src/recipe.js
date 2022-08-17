import React, {useState, useEffect} from 'react';
import { View, TouchableOpacity, TextInput, Text, Modal, Dimensions, BackHandler} from 'react-native';
import * as FileSystem from "expo-file-system"

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'

import styles from './styles/styles';
import noteStyles from "./styles/noteStyles"
import Ingredients from './components/ingredients';
import palettes from './components/palettes';
const pallette = palettes[2]
var typePalette = palettes[3]


export default function Recipe({navigation, route}) {
    const dir = route.params.dir
    const file = route.params.ob

    const [object, setObject] = useState(JSON.parse(file))
    const [title, setTitle] = useState(object.title)
    const [mainText, setMainText] = useState(object.mainText)
    const [ingredientes, setIngredientes] = useState(object.ingredientes)
    const [currentIngredient, setCurrentIngredient] = useState('')

    const [modalVisible, setModalVisible] = useState(false)
    const [ingredientModalVisible, setIngredientModal] = useState(false)
    const [tempIngrediente, setTempIngrediente] = useState('')

    const saveFile = () => {
        let newOb = {
            date: object.date,
            title: title,
            type: object.type,
            ingredientes: ingredientes,
            mainText: mainText
        }

        FileSystem.deleteAsync(dir).then(() => {
            FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "Notes/" + title + ".json", JSON.stringify(newOb)).then(() => {
                navigation.navigate('Home')
            })
        })
    }

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

    const handleModalSetup  = (index) => {
        setCurrentIngredient(ingredientes[index]);
        setIngredientModal(true) 
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
            <View style={noteStyles.innerContainer}>

                <View style={{height: 100, backgroundColor: pallette[3]}}>
                    <TouchableOpacity onPress={() => {
                        saveFile()
                    }}>
                        <FontAwesomeIcon icon={faChevronLeft} size={38} style={{ color: pallette[5], top: 25, backgroundColor: pallette[2], borderRadius: 10}}/> 
                    </TouchableOpacity>
                    <TextInput style={[noteStyles.title, {color: typePalette[1]}]} value={title} onChangeText={setTitle}></TextInput>
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
                            <TextInput style={styles.modalText} placeholder="ex: 2kg de carne moida" onChangeText={setTempIngrediente}></TextInput>
                            <TouchableOpacity
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
                            </TouchableOpacity>
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


                    <Text style={[noteStyles.h1, {color: typePalette[1]}]}>ingredientes</Text>
                    
                    {
                        ingredientes.length == 0 ?

                        <View>
                            <Text style={{color: "#777777", fontStyle: "italic", top: 15}}>Press the + Button to add ingredients!</Text>
                        </View>

                    :
                        ingredientes.map((item, index) => {
                            return (
                                <TouchableOpacity key={index} onLongPress={() => complete(ingredientes, index, setIngredientes)} onPress={() => {
                                        handleModalSetup(index)
                                    }}>
                                    <Ingredients text={item.text} color={pallette[5]}/>
                                </TouchableOpacity>
                            )
                        })
                    }

                    <Text style={[noteStyles.h1, {color: typePalette[1]}]}>Modo de Preparo</Text>
                    <TextInput style={noteStyles.mainText} value={mainText} placeholder={'You can write here!'} placeholderTextColor={"#777777"} onChangeText={setMainText} multiline={true}></TextInput>

                    <TouchableOpacity style={{backgroundColor: pallette[2], height: 60, width: 60, borderRadius: 100, position: "absolute", top: Dimensions.get("window").height / 1.3, left: Dimensions.get("window").width / 1.4}} onPress={() => {
                        setModalVisible(true)
                    }}>
                        <Text style={{alignSelf: "center", fontSize: 40, color: pallette[0]}}> + </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}