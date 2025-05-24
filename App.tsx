import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Button, View, Modal, Alert, Text } from 'react-native';
import { useState, useRef } from 'react';

type convite = {
  Convite: string,
  Mesa: string,
  Convidados: string,
  Patrocinador: string,
  Checkin: string,
}

export default function App() {
  const [modalVisible, setModalVisibility] = useState(false)
  const [checkinModalVisible, setCheckinModalVisibility] = useState(false)

  const [data, setData] = useState<convite>()
  const [permission, requestPermission] = useCameraPermissions()

  const qrCodeLock = useRef(false)

  async function openCamera() {
    try {
      const { granted } = await requestPermission()

      if (!granted) {
        return Alert.alert("Camera", "O App precisa de permissão para usar a câmera")
      }

      setModalVisibility(true)
      qrCodeLock.current = false
    } catch (err) {
      console.log(err)
    }
  }

  async function qrCodeRead(data: string) {
    setModalVisibility(false)
    const url: string = `http://192.168.0.39:8000/buscaHash/${data}`

    try {
      const response = await fetch(url)
      const json = await response.json()
      setData(json)
      setCheckinModalVisibility(true)

    } catch (err) {
      console.error(err)
    }
  }

  return (
    <View style={styles.container}>
      <Button title='Ler QRCode' onPress={openCamera} />

      <Modal visible={modalVisible} style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          facing='back'
          onBarcodeScanned={({ data }) => {
            if (data && !qrCodeLock.current) {
              qrCodeLock.current = true
              setTimeout(() => qrCodeRead(data), 500)
            }
          }}
        />

        <View>
          <Button
            title='Cancelar'
            onPress={() => setModalVisibility(false)}
          />
        </View>
      </Modal>

      <Modal visible={checkinModalVisible} style={{ flex: 1 }}>
        <View style={{flex: 1}}>
          <Text>{data?.Convite.replace("BaileDosNamoradosMCJ2025_", "Convite Número #")}</Text>
          <Text>{data?.Mesa}</Text>
          <Text>{data?.Convidados}</Text>
          <Text>{data?.Patrocinador}</Text>
        </View>

        <Button
          title='Check In'
          onPress={() => setCheckinModalVisibility(false)}
        />
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
