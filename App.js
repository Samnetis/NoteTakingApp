import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, SafeAreaView, FlatList, TextInput } from 'react-native';
import { Amplify, Auth, API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react-native';
import { Camera } from 'expo-camera';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as queries from './src/graphql/queries';
import * as mutations from './src/graphql/mutations';
import awsconfig from './src/aws-exports';

Amplify.configure({
  ...awsconfig,
  Analytics: {
    disabled: true,
  },
});

function App({ signOut, user }) {
  const [notes, setNotes] = useState([]);
  const [hasPermission, setHasPermission] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      const noteData = await API.graphql(graphqlOperation(queries.listNotes));
      const notes = noteData.data.listNotes.items;
      setNotes(notes);
    } catch (err) {
      console.log('error fetching notes');
    }
  }

  async function createNote() {
    if (title === '' || content === '') return;

    const note = { title, content };
    try {
      await API.graphql(graphqlOperation(mutations.createNote, { input: note }));
      setTitle('');
      setContent('');
      fetchNotes();
    } catch (err) {
      console.log('error creating note:', err);
    }
  }

  async function deleteNote(id) {
    try {
      await API.graphql(graphqlOperation(mutations.deleteNote, { input: { id } }));
      fetchNotes();
    } catch (err) {
      console.log('error deleting note:', err);
    }
  }

  const addPicture = () => {
    // This is a placeholder for the camera functionality
    console.log('Add picture functionality to be implemented');
  };

  const renderNote = ({ item }) => (
    <View style={styles.noteItem}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteContent}>{item.content}</Text>
      <View style={styles.noteActions}>
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
      <View style={styles.header}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
        />
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.welcomeText}>Welcome, {user.username}!</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Note Title"
        />
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="Note Content"
          multiline
        />
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 75,
    resizeMode: 'contain',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    width: '90%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
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