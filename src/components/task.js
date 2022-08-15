import React from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';

import palettes from './palettes';
var typePalette = palettes[3]


function Task(props) {
    typePalette = global.typePallette

    const styles = StyleSheet.create({
        viewStyle: {
            paddingRight: 30,
            top: 10,
            paddingTop: 10,
        },
    
        check: {
            fontSize: 20,
        },
    
        text: {
            fontSize: 20,
            fontWeight: "600",
            color: props.color
        },
    
    
        description: {
            fontWeight: '400',
            color: typePalette[2]
        },
    
        descriptionContainer: {
            width: Dimensions.get("window").width * 0.80,
        }
    })

    return (
        <View>
            {props.done && 
                <View style={styles.viewStyle}>
                    <Text>
                        <Text style={styles.check}>✔️  </Text>
                        <Text style={[styles.text, {textDecorationLine:"line-through"}]}>{props.text}</Text>
                    </Text>
                    {
                        props.description != "" &&
                            <View style={styles.descriptionContainer}>
                                <Text style={[styles.description, {color: props.color, fontWeight: "100"}]}>{props.description}</Text>
                            </View>
                    }
                </View>
            }

            {props.done == false &&
                <View style={styles.viewStyle}>
                    <Text>
                        <Text style={styles.check}>✖️  </Text>
                        <Text style={styles.text}>{props.text}</Text>
                    </Text>
                    {
                        props.description != "" &&
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.description}>{props.description}</Text>
                        </View>
                    }
                </View>
            }
        </View>
    );
}

export default Task;

