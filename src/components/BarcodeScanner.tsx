import React, {useEffect, useRef} from 'react';
import {CameraEnhancer, CameraView, CaptureVisionRouter, DecodedBarcodesResult, EnumBarcodeFormat, EnumPresetTemplate, SimplifiedCaptureVisionSettings} from 'dynamsoft-capture-vision-react-native';
import { StyleSheet } from 'react-native';


export interface ScannerProps{
  onScanned?: (result:DecodedBarcodesResult) => void;
}

export function BarcodeScanner(props:ScannerProps) {
  const cameraView = useRef<CameraView>(null);
  const camera = CameraEnhancer.getInstance();
  const router = CaptureVisionRouter.getInstance();

  const updateSettingsForISBN = async () => {
    let settings: SimplifiedCaptureVisionSettings = {
      barcodeSettings: {
        barcodeFormatIds:  EnumBarcodeFormat.BF_EAN_13,
      }
    };
    await router.updateSettings(settings,EnumPresetTemplate.PT_READ_SINGLE_BARCODE);
  }

  useEffect(() => {
    router.setInput(camera);
    updateSettingsForISBN();
    camera.setCameraView(cameraView.current!!);
    let resultReceiver = router.addResultReceiver({
      onDecodedBarcodesReceived: (result: DecodedBarcodesResult) =>  {
        console.log('scanned');
        if (props.onScanned) {
          props.onScanned(result);
        }
      },
    });
    
    camera.open();
    router.startCapturing(EnumPresetTemplate.PT_READ_SINGLE_BARCODE);

    return () => {
      router.removeResultReceiver(resultReceiver!);
      camera.close();
      router.stopCapturing();
    };
  }, [camera, router, cameraView, props]);

  return (
    <CameraView style={styles.container} ref={cameraView} />
  );
}
const styles = StyleSheet.create({
  container: {
    flex:1,
  },
});
