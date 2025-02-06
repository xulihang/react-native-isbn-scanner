import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Book {
  imageBase64:string,
  title:string,
  author:string,
  ISBN:string,
  publisher:string
}

export class BookManager {

  static async saveItem(book:Book) {
    await AsyncStorage.setItem(book.ISBN.toString(),JSON.stringify(book));
  }

  static async deleteItem(key:string) {
    await AsyncStorage.removeItem(key);
  }

  static async getKeys(){
    return await AsyncStorage.getAllKeys();
  }

  static async getItem(key:string){
    let jsonStr:string|null = await AsyncStorage.getItem(key);
    if (jsonStr) {
      let book:Book = JSON.parse(jsonStr);
      return book;
    }else{
      return null;
    }
  }

  static async listItems(){
    let books:Book[] = [];
    let keys = await this.getKeys();
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      let book = await this.getItem(key);
      if (book) {
        books.push(book);
      }
    }
    return books;
  }
}