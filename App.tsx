import React, { useEffect } from 'react';
import {
  Button,
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BarcodeScanner } from './components/BarcodeScanner';
import { CameraEnhancer, DecodedBarcodesResult, LicenseManager } from 'dynamsoft-capture-vision-react-native';

function App(): React.JSX.Element {
  const [isScanning, setIsScanning] = React.useState(false);
  const [barcodeText, setBarcodeText] = React.useState('');
  useEffect(()=>{
    LicenseManager.initLicense('DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9')
    .then(()=>{/*Init license successfully.*/})
    .catch(error => console.error('Init License failed.', error));
    CameraEnhancer.requestCameraPermission();
  },[]);

  const toggleScanning = () => {
    setIsScanning(!isScanning);
  };

  const onScanned = (result:DecodedBarcodesResult) => {
    if (result.items && result.items.length > 0) {
      console.log(result.items[0].text);
      toggleScanning();
      setBarcodeText(result.items[0].text);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.home}>
          <View style={styles.header}>
            <Text style={styles.title}>ISBN Scanner</Text>
          </View>
          <View style={styles.content}>
            <ScrollView>
            </ScrollView>
          </View>
          <View style={[styles.bottomBar, styles.elevation, styles.shadowProp]}>
            <Pressable onPress={()=>toggleScanning()}>
              <View style={styles.circle}>
                <Text style={styles.buttonText}>SCAN</Text>
              </View>
            </Pressable>
          </View>
        </View>
      }
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
});

export default App;
