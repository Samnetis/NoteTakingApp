import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, SafeAreaView, FlatList } from 'react-native';
import { Amplify, Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react-native';
import { Camera } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';

// Import your AWS configuration file
import awsconfig from './src/aws-exports';

Amplify.configure(awsconfig);

function App() {
  const [notes, setNotes] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const createNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
  };

  const addPicture = () => {
    // This is a placeholder for the camera functionality
    console.log('Add picture functionality to be implemented');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const updateNote = (id, updatedNote) => {
    setNotes(notes.map(note => note.id === id ? { ...note, ...updatedNote } : note));
  };

  const renderNote = ({ item }) => (
    <View style={styles.noteItem}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent}>{item.content}</Text>
      <View style={styles.noteActions}>
        <TouchableOpacity onPress={() => updateNote(item.id, { title: 'Updated Title' })}>
          <FontAwesome name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <FontAwesome name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('./assets/logo.png')}
        style={styles.logo}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={createNote}>
          <FontAwesome name="plus" size={24} color="white" />
          <Text style={styles.buttonText}>Create Note</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={addPicture}>
          <FontAwesome name="camera" size={24} color="white" />
          <Text style={styles.buttonText}>Add Picture</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={item => item.id}
        style={styles.noteList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginTop: 50,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
  noteList: {
    width: '100%',
    paddingHorizontal: 10,
  },
  noteItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteContent: {
    fontSize: 14,
    color: '#333',
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
});

export default withAuthenticator(App);