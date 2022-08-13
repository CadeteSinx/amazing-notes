import React from 'react';
import {View, Text} from 'react-native';

function Ingredients(props) {
    return (
        <View style={{flexDirection: "row"}}>
            <Text>
                <Text style={{fontSize: 16, top:2}}> ►  </Text>
                <Text>{props.text}</Text>
            </Text>
        </View>
    );
}

export default Ingredients;