import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BarcodeScanner } from './BarcodeScanner';
import { DecodedBarcodesResult } from 'dynamsoft-capture-vision-react-native';
import { Book, BookManager } from '../utils/BookManager';
import {launchImageLibrary} from 'react-native-image-picker';

export interface LoggerProps{
  onSaved?: () => void;
  onCanceled?: () => void;
  book?:Book;
}

export function BookLogger(props:LoggerProps): React.JSX.Element {
  const [isScanning, setIsScanning] = React.useState(false);
  const [isFetching,setIsFetching] = React.useState(false);
  const [book,setBook] = React.useState<Book>(
    {
      imageBase64:"",
      title:"",
      author:"",
      publisher:"",
      ISBN:""
    }
  );

  useEffect(()=>{
    if (props.book) {
      setBook(props.book);
    }
  },[]);

  const toggleScanning = () => {
    setIsScanning(!isScanning);
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType:'photo',
      includeBase64: true
    });
    onChangeText("imageBase64",result.assets![0].base64!);
  }

  const onScanned = (result:DecodedBarcodesResult) => {
    if (result.items && result.items.length > 0) {
      const barcode = result.items[0].text;
      console.log(barcode);
      toggleScanning();
      fetchBookInfo(barcode)
    }
  };

  const fetchBookInfo = async (ISBN:string) => {
    setIsFetching(true);
    try {
      const response = await fetch(
        'https://www.googleapis.com/books/v1/volumes?q=isbn:'+ISBN,
      );
      const json = await response.json();
      console.log(json);
      const bookItem = json.items[0];
      const title = bookItem.volumeInfo.title;
      const publisher = bookItem.volumeInfo.publisher;
      const authors = bookItem.volumeInfo.authors.join(",");
      const newBook:Book = {
        imageBase64:"",
        title:title,
        publisher:publisher,
        author:authors,
        ISBN:ISBN
      }
      await fetchImageCover(newBook,bookItem);
      setBook(newBook);
      setIsFetching(false);
    } catch (error) {
      setIsFetching(false);
      Alert.alert("error",JSON.stringify(error));
    }
  }

  const removeDataURLHead = (dataURL:string) => {
    return dataURL.substring(dataURL.indexOf(",")+1,dataURL.length);
  }

  const blob2base64 = (blob:Blob):Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = removeDataURLHead(reader.result as string);
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const fetchImageCover = async (newBook:Book,bookItem:any) => {
    try {
      const response = await fetch(bookItem.volumeInfo.imageLinks.thumbnail);
      const blob = await response.blob();
      const base64 = await blob2base64(blob);
      newBook.imageBase64 = base64;
    } catch (error) {
      console.log(error);
    }
  }

  const onChangeText = (key:string,text:string) => {
    console.log("onChangeText");
    let modifiedBook:any = JSON.parse(JSON.stringify(book));
    modifiedBook[key] = text;
    console.log(modifiedBook);
    setBook(modifiedBook);
  }

  const Fields = () => {
    let fieldArray = [];
    let keys = Object.keys(book);
    for (let index = 0; index < keys.length; index++) {
      let key = keys[index];
      if (key === "ISBN" || key === "imageBase64") {
        continue;
      }
      const value = (book as any)[key];
      let view = 
      <View style={styles.infoField} key={"field-"+key}>
        <Text style={styles.fieldLabel}>{key+":"}</Text>
        <View style={[styles.fieldInput,styles.bottomBorder]}>
          <TextInput
            onChangeText={(text)=>{onChangeText(key,text)}}
            value={value}/>
        </View>
      </View>
      fieldArray.push(view);
    }
    return (
      fieldArray
    )
  }

  const save = async () => {
    await BookManager.saveItem(book);
    if (props.onSaved) {
      props.onSaved();
    }
  }

  const cancel = () => {
    if (props.onCanceled) {
      props.onCanceled();
    }
  }

  return (
    <SafeAreaView style={StyleSheet.absoluteFill}>
      {isScanning &&
      <>
        <BarcodeScanner
          onScanned={onScanned}
        />
        <View style={styles.controls}>
          <Button title="Stop Scanning" onPress={toggleScanning}/>
        </View>
      </>}
      {!isScanning &&
        <ScrollView>
          <Text style={styles.header}>
            Book
          </Text>
          {Fields()}
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>ISBN:</Text>
            <View style={[styles.ISBNInput,styles.bottomBorder]} >
              <View style={styles.ISBNTextInput}>
                <TextInput
                  onChangeText={(text)=>{onChangeText("ISBN",text)}}
                  value={book.ISBN}/>
              </View>
              <View style={styles.ISBNButton}>
                <Button title="Scan" onPress={toggleScanning}/>
              </View>
            </View>
          </View>
          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Cover:</Text>
            <View style={[styles.coverInput,styles.bottomBorder]}>
              {book.imageBase64 &&
                <View style={styles.imageContainer}>
                  <Pressable
                    onPress={()=>{pickImage()}}
                  >
                    <Image 
                      style={styles.coverImage}
                      source={{
                      uri: 'data:image/jpeg;base64,'+book.imageBase64,
                    }}></Image>
                  </Pressable>
                </View>
              }
              {!book.imageBase64 &&
                <View style={styles.buttonContainer}>
                  <Button title="Pick Image"
                    onPress={()=>{pickImage()}}
                  ></Button>
                </View>
              }
            </View>
          </View>
          <View style={styles.buttons}>
            <Button onPress={save} title="Save"/>
            <Button onPress={cancel} title="Cancel"/>
            {isFetching && (
              <ActivityIndicator size="large" />
            )}
          </View>
        </ScrollView>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  infoField:{
    flexDirection:"row",
    paddingLeft: 10,
    paddingRight: 10,
  },
  fieldLabel:{
    flex:1/3,
    alignSelf:"center",
  },
  fieldInput:{
    flex:2/3,
  },
  bottomBorder: {
    borderBottomWidth:0.2,
    borderBottomColor:"gray",
  },
  ISBNInput:{
    flex:2/3,
    flexDirection:'row',
  },
  ISBNTextInput:{
    flex:2/3,
  },
  ISBNButton:{
    flex:1/3,
    justifyContent:'center'
  },
  coverInput:{
    flex:2/3,
    flexDirection:'row',
    justifyContent:'flex-end'
  },
  header:{
    paddingTop:5,
    paddingBottom:5,
    paddingLeft:10,
    fontWeight:"bold",
    color:"black",
    backgroundColor:"lightgray",
  },
  controls:{
    position:'absolute',
    width:'100%',
    alignItems:'center',
    bottom:10,
  },
  buttons:{
    flexDirection:'row',
    gap:10,
    marginTop:10,
    padding:10
  },
  coverImage:{
    height: 150,
    resizeMode: 'contain',
  },
  buttonContainer:{
    paddingLeft:10,
    paddingTop:5,
    paddingBottom:5,
  },
  imageContainer:{
    flex:1,
    paddingLeft:10,
    paddingTop:5,
    paddingBottom:5,
  },
});

