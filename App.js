import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Modal, Text, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

export default function CameraScreen() {
  const cameraRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === 'granted') {
        setIsCameraReady(true);
      }
    })();
  }, []);

  const onCameraReady = () => {
    // Do something when the camera is ready
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedPhoto(photo);
      setShowPreview(true);
    }
  };

  const savePhoto = async (photoUri) => {
    try {
      await MediaLibrary.saveToLibraryAsync(photoUri);
      console.log('Photo saved to Photos.');
    } catch (error) {
      console.log('Failed to save photo to Photos:', error);
    }
  };

  const cancelPreview = () => {
    setCapturedPhoto(null);
    setShowPreview(false);
    setZoomScale(1);
  };

  const savePreview = () => {
    if (capturedPhoto) {
      savePhoto(capturedPhoto.uri);
    }
    cancelPreview();
  };

  const handleZoom = (event) => {
    console.log(event.nativeEvent.scale)
    if (event.nativeEvent.scale > 1) {
      setIsZooming(true);
      setZoomScale(event.nativeEvent.scale);
    } else {
      setIsZooming(false);
      setZoomScale(1);
    }
  };

  return (
    <View style={styles.container}>
      {isCameraReady && (
        <Camera
          style={styles.camera}
          ref={cameraRef}
          type={cameraType}
          onCameraReady={onCameraReady}
        >
          {!showPreview && (
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <Ionicons name="camera" size={32} color="white" />
            </TouchableOpacity>
          )}
          {showPreview && (
            <PinchGestureHandler
              onGestureEvent={handleZoom}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  setIsZooming(false);
                  setZoomScale(1);
                }
              }}
            >
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: capturedPhoto.uri }}
                  style={[styles.previewImage, { transform: [{ scale: zoomScale }] }]}
                  resizeMode="contain"
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.saveButton} onPress={savePreview}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelPreview}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </PinchGestureHandler>
          )}
        </Camera>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  captureButton: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
