import React, { useEffect } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraEnhancer, LicenseManager } from 'dynamsoft-capture-vision-react-native';
import { BookLogger } from './components/BookLogger';
import { Book, BookManager } from './utils/BookManager';
import { BookCard } from './components/BookCard';

function App(): React.JSX.Element {
  const [isLogging, setIsLogging] = React.useState(false);
  const [books,setBooks] = React.useState<Book[]>([]);
  const [selectedBook,setSelectedBook] = React.useState<Book|undefined>();
  const [modalVisible,setModalVisible] = React.useState(false);
  useEffect(()=>{
    LicenseManager.initLicense('DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9')
    .then(()=>{/*Init license successfully.*/})
    .catch(error => console.error('Init License failed.', error));
    CameraEnhancer.requestCameraPermission();
    listBooks();
  },[]);

  const listBooks = () => {
    BookManager.listItems().then((items)=>{
      setBooks(items);
    })
  }

  const toggleLogging = () => {
    setIsLogging(!isLogging);
  };

  const onCanceled = () => {
    toggleLogging();
  }

  const onSaved = () => {
    toggleLogging();
    listBooks();
  }

  const bookCardPressed = (book:Book) => {
    console.log(book);
    setSelectedBook(book);
    setModalVisible(true);
  }

  const performAction = async (action:'open'|'delete') => {
    setModalVisible(false);
    if (action === 'open') {
      toggleLogging();
    }else{
      if (selectedBook) {
        await BookManager.deleteItem(selectedBook.ISBN);
        listBooks();
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {isLogging &&
      <>
        <BookLogger book={selectedBook} onCanceled={onCanceled} onSaved={onSaved} />
      </>}
      {!isLogging &&
        <View style={styles.home}>
          <View style={styles.header}>
            <Text style={styles.title}>ISBN Scanner</Text>
          </View>
          <View style={styles.content}>
            <ScrollView>
              {books.map(book => (
                <View style={styles.bookcard} key={"key-"+book.ISBN}>
                  <BookCard book={book} onPressed={()=>{bookCardPressed(book)}}/>
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={[styles.bottomBar, styles.elevation, styles.shadowProp]}>
            <Pressable onPress={()=>{
              setSelectedBook(undefined);
              toggleLogging()
            }}>
              <View style={styles.circle}>
                <Text style={styles.buttonText}>NEW</Text>
              </View>
            </Pressable>
          </View>
        </View>
      }
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalInfoText}>Please select an action:</Text>
            <View style={{flexDirection:"row"}}>
              <Pressable
                style={styles.modalButton}
                onPress={() => performAction("open")}>
                <Text style={styles.modalButtonText}>Open</Text>
              </Pressable>
              <Pressable
                style={styles.modalButton}
                onPress={() => performAction("delete")}>
                <Text style={styles.modalButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getContentHeight = () => {
  return Dimensions.get("window").height - 95;
}

const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  home:{
    flex:1,
  },
  header:{
    width:'100%',
    height: 50,
    backgroundColor:'white',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    justifyContent:'center',
  },
  title:{
    color:'black',
    fontSize:18,
    padding:10,
  },
  content: {
    padding:10,
    height:getContentHeight(),
  },
  bookcard:{
    height: 150,
    marginBottom: 10,
  },
  controls:{
    position:'absolute',
    width:'100%',
    alignItems:'center',
    bottom:10,
  },
  button:{
    width: '50%',
  },
  bottomBar:{
    position:'absolute',
    bottom:0,
    left:0,
    width:'100%',
    height: 45,
    flexDirection:"row",
    justifyContent:"center",
    backgroundColor:"white",
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: 2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  elevation: {
    elevation: 20,
    shadowColor: '#52006A',
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: "rgb(120,190,250)",
    top:-25,
    justifyContent:"center",
  },
  buttonText:{
    alignSelf:"center",
    color:"white",
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: '#2196F3',
    margin:5,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalInfoText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default App;
