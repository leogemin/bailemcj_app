import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Button, View, Modal, Alert } from 'react-native';
import { useState, useRef } from 'react';

export default function App() {
  const [modalVisible, setModalVisibility] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()

  const qrCodeLock = useRef(false)

  async function openCamera() {
    try {
      const { granted } = await requestPermission()

      if(!granted) {
        return Alert.alert("Camera", "O App precisa de permissão para usar a câmera")
      }
      
      setModalVisibility(true)
      qrCodeLock.current = false
    } catch (err) {
      console.log(err)
    }
  }

  function qrCodeRead(data: string) {
    setModalVisibility(false)
    Alert.alert("QRCode", data)
  }

  return (
    <View style={styles.container}>
      <Button title='Ler QRCode' onPress={openCamera}/>

      <Modal visible={modalVisible} style={{flex: 1}}>
        <CameraView 
          style={{flex: 1}} 
          facing='back' 
          onBarcodeScanned={({ data }) => {
            if(data && !qrCodeLock.current) {
              qrCodeLock.current = true
              setTimeout(() => qrCodeRead(data), 500)
            }
          }}
        />

        <View>
          <Button title='Cancelar' onPress={() => setModalVisibility(false)}/>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
