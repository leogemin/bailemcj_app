import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, View, Modal, Alert, Image, ImageBackground } from 'react-native';
import { useState, useRef } from 'react';
import { PaperProvider, Button, IconButton, Text } from 'react-native-paper'

export default function App() {
  const [modalVisible, setModalVisibility] = useState(false)
  const [checkinModalVisible, setCheckinModalVisibility] = useState(false)

  const [data, setData] = useState()
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

  async function qrCodeRead(data) {
    setModalVisibility(false)
    const url = `https://apibaile-production.up.railway.app/buscaHash/${data}`

    try {
      const response = await fetch(url)
      const json = await response.json()
      if (json.erro) return Alert.alert("Erro", json.erro)
      setData(json)
      setCheckinModalVisibility(true)
    } catch (err) {
      console.error(err)
    }
  }

  async function checkIn(data) {
    const url = `https://apibaile-production.up.railway.app/checkIn/${data?.Convite}`

    try {
      const response = await fetch(url)
      const json = await response.json()
      setCheckinModalVisibility(false)
      if (json.erro) return Alert.alert("Erro", json.erro)
      if (json.status == 1) return Alert.alert("Sucesso", "Check in realizado com sucesso")
    } catch (err) {
      console.error(err)
    }

  }

  async function fetchConvites() {
    const url = 'https://apibaile-production.up.railway.app/convites'

    try {
      const response = await fetch(url)
      const json = await response.json()

      return Alert.alert("Status", `Convites no evento: ${json.total_convites} \nConvites pendentes: ${236 - json.total_convites}`)

    } catch (err) {
      console.error(err)
    }
  }

  function cancel() {
    setCheckinModalVisibility(false)
    setData()
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ImageBackground source={require('../assets/homepage.png')} style={styles.container}>
          <Button onPress={fetchConvites} textColor='#ff7777' style={{marginBottom: 25}}>Status</Button>
          <IconButton
            icon="camera"
            size={50}
            mode='contained'
            style={{ height: 100, aspectRatio: "1/1" }}
            iconColor='#ffffff'
            containerColor='#880000aa'
            onPress={openCamera}
          />
          <Text variant='labelMedium' style={{ color: '#ffffff' }}>Ler QRCode</Text>

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
              <Button textColor='#000'
                onPress={() => setModalVisibility(false)}
              >Cancelar</Button>
            </View>
          </Modal>

          <Modal visible={checkinModalVisible} style={{ flex: 1 }}>
            <ImageBackground source={require('../assets/checkin.png')} style={{ flex: 1 }}>
              <View style={styles.checkInContainer}>
                <View style={styles.checkInSection}>
                  <Text style={styles.text}>
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Convite </Text>
                    <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>{data?.Convite.replace("BaileDosNamoradosMCJ2025_", "#")}</Text>
                  </Text>
                  <Text style={styles.convidados}>{data?.Convidados}</Text>
                </View>


                <Image source={require("../assets/confirm.png")} style={{ width: 200, height: 200, backgroundColor: '#ffffff', borderRadius: 500 }} />

                <View style={styles.checkInSection}>
                  <Text style={styles.mesa}>
                    <Text style={{ color: '#ffffff' }}>Mesa #</Text>
                    {data?.Mesa}
                  </Text>
                  <Text style={styles.patrocinador}>{data?.Patrocinador}</Text>
                </View>

              </View>

              <View style={styles.btnContainer}>
                <Button
                  onPress={cancel}
                  textColor='#fff'
                  buttonColor='#880000'
                  style={{ paddingVertical: 5 }}
                >Cancelar</Button>
                <Button
                  onPress={() => checkIn(data)}
                  buttonColor='#00aa00'
                  mode='contained'
                  style={{ paddingVertical: 5 }}
                >Check In</Button>
              </View>
            </ImageBackground>
          </Modal>
        </ImageBackground>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  checkInContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 50
  },
  checkInSection: {
    flexDirection: "column",
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 38
  },
  mesa: {
    fontWeight: 'bold',
    fontSize: 28,
    color: '#ffffff'
  },
  convidados: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  patrocinador: {
    fontSize: 16,
    color: '#efefefdd'
  },
  btnContainer: {
    flexDirection: 'column-reverse',
    gap: 15,
    justifyContent: 'center',
    marginInline: 50,
    marginBottom: 30
  },
});
