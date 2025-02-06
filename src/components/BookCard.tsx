import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Book } from '../utils/BookManager';

export interface BookCardProps{
  onPressed?: () => void;
  book:Book;
}

export function BookCard(props:BookCardProps): React.JSX.Element {
  const [pressed,setPressed] = React.useState(false);
  const onPress = () => {
    setPressed(true);
    setTimeout(()=>{
      setPressed(false);
      if (props.onPressed) {
        props.onPressed();
      }
    },100);
  }
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.container,pressed?styles.pressed:undefined]}>
        <View style={styles.textInfo}>
          {['title','author','publisher','ISBN'].map(field => (
            <Text key={field}>{field+": "+(props.book as any)[field]}</Text>
          ))}
        </View>
        <View style={styles.cover}>
          <Image 
            style={styles.coverImage}
            source={{
            uri: 'data:image/jpeg;base64,'+props.book.imageBase64,
          }}></Image>
        </View>
      </View>
    </Pressable>
   
  );
}

const styles = StyleSheet.create({
  container:{
    flexDirection:'row',
    alignItems:'center',
    padding:10,
    borderColor:'lightgray',
    borderRadius:5,
    borderWidth:1
  },
  pressed:{
    backgroundColor:'lightgray'
  },
  textInfo:{
    flex:3
  },
  cover:{
    flex:1
  },
  coverImage:{
    height: '100%',
    resizeMode: 'contain',
  },
});

