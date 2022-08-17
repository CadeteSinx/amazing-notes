import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Import here stuff
import Home from './src/home';
import Note from './src/note';
import Recipe from './src/recipe';
import Settings from './src/settings';
import SimpleNote from './src/simpleNote';
import Checklist from './src/checklist';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}>
        <Stack.Screen name="Home" component={Home}/>
        <Stack.Screen name="SimpleNote" component={SimpleNote}/>
        <Stack.Screen name="Recipe" component={Recipe}/>
        <Stack.Screen name="Checklist" component={Checklist}/>
        <Stack.Screen name="Note" component={Note}/>
        <Stack.Screen name="Settings" component={Settings}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
