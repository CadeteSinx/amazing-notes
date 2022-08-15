import React from 'react';
import {View, Text} from 'react-native';



function Ingredients(props) {
    return (
        <View style={{flexDirection: "row", top: 16}}>
            <Text style={{color: props.color}}>
                <Text style={{fontSize: 16, top:2}}> › </Text>
                <Text>{props.text}</Text>
            </Text>
        </View>
    );
}

export default Ingredients;