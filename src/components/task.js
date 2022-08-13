import React from 'react';
import { Text, View, StyleSheet, Dimensions } from 'react-native';

function Task(props) {
    return (
        <View>
            {props.done && 
                <View style={styles.viewStyle}>
                    <Text>
                        <Text style={styles.check}>✔️   </Text>
                        <Text style={[styles.text, {textDecorationLine:"line-through"}]}>{props.text}</Text>
                    </Text>
                    {
                        props.description != "" &&
                            <View style={styles.descriptionContainer}>
                                <Text styles={styles.description}>{props.description}</Text>
                            </View>
                    }
                </View>
            }

            {props.done == false &&
                <View style={styles.viewStyle}>
                    <Text>
                        <Text style={styles.check}>✖️   </Text>
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

const styles = StyleSheet.create({
    viewStyle: {
        paddingLeft: 40,
        paddingRight: 30,
        paddingTop: 10,
    },

    check: {
        fontSize: 20,
    },

    text: {
        fontSize: 20,
        fontWeight: "600",
    },

    description: {
        fontWeight: '300',
    },

    descriptionContainer: {
        width: Dimensions.get("window").width * 0.80,
    }
})