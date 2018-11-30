import React from 'react';
import { StyleSheet, Text, View, StatusBar, Dimensions, Platform, TextInput, ScrollView, AsyncStorage } from 'react-native';
import ToDo from './ToDo';
import { AppLoading } from 'expo';
import uuidv1 from 'uuid/v1'

const { height, width } = Dimensions.get("window")

export default class App extends React.Component {
  state = {
    newToDo: '',
    loadedToDos: false,
    toDos: {}
  };
  componentDidMount = () => {
    this._loadToDos();

  };
  render() {
    const { newToDo, loadedToDos, toDos } = this.state;
    if (!loadedToDos) {
      return <AppLoading />

    }
    return (
      <View style={styles.container}>
        <StatusBar barStyle='light-content' />
        <Text style={styles.title}>ZISU To Do</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            underlineColorAndroid='transparent'
            placeholder={"New To Do"}
            value={newToDo}
            onChangeText={this._controlNewToDo}
            placeholderTextColor={"#999"}
            returnKeyType={"done"}
            autoCorrect={false}
            onSubmitEditing={this._addToDo}
          />
          <ScrollView contentContainerStyle={styles.toDos}>
            {Object.values(toDos).reverse().map(toDo =>
              <ToDo key={toDo.id} {...toDo}
                deleteToDo={this._deleteToDo}
                completeToDo={this._completeToDo}
                uncompleteToDo={this._uncompleteToDo} 
                updateToDo={this._updateToDo}
                />
            )}
          </ScrollView>
        </View>
      </View>
    );
  };
  _controlNewToDo = text => {
    this.setState({
      newToDo: text
    })
  };
  _loadToDos = async () => { // why?
    try {
      const toDos = await AsyncStorage.getItem("toDos");
      const parsedToDos = JSON.parse(toDos);
      this.setState({
        loadedToDos: true,
        toDos: parsedToDos
      })

    } catch (err) {
      console.log("err", err);

    }
    
  };
  _addToDo = () => {
    const { newToDo } = this.state;
    if (newToDo !== '') {
      this.setState(prevState => {
        const ID = uuidv1();
        const newToDoObject = {
          [ID]: {
            id: ID,
            isCompleted: false,
            text: newToDo,
            createAt: Date.now()
          }
        };
        const newState = {
          ...prevState,
          newToDo: '',
          toDos: {
            ...prevState.toDos,
            ...newToDoObject

          }
        };
        this._saveToDo(newState.toDos);
        return { ...newState };

      });

    }

  };
  _deleteToDo = id => {
    this.setState(prevState => {
      const toDos = prevState.toDos;
      delete toDos[id];
      const newState = {
        ...prevState,
        ...toDos
      };
      this._saveToDo(newState.toDos);
      return { ...newState };

    });

  };
  _uncompleteToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: false
          }
        }
      }
      this._saveToDo(newState.toDos);
      return { ...newState };
    })
  };
  _completeToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: true
          }
        }
      }
      this._saveToDo(newState.toDos);
      return { ...newState };
    })
  };
  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            text: text
          }
        }
      }
      this._saveToDo(newState.toDos);
      return { ...newState };
    })
  };
  _saveToDo = newToDos => {
    const saveToDos = AsyncStorage.setItem("toDos", JSON.stringify(newToDos));
    // AsyncStorage can save only strings.

  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B4B4B',
    alignItems: 'center'
  },
  title: {
    color: 'white',
    fontSize: 30,
    marginTop: 50,
    fontWeight: '100',
    marginBottom: 30
  },
  card: {
    backgroundColor: 'white',
    flex: 1,
    width: width - 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(50, 50, 50)',
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: {
          height: -1,
          width: 0
        }
      },
      android: {
        elevation: 3
      }
    })
  },
  input: {
    padding: 20,
    borderBottomColor: '#bbb',
    borderBottomWidth: 1,
    fontSize: 25
  },
  toDos: {
    alignItems: 'center'
  }
});
