import React, { useEffect, useRef } from 'react';
import { Animated, View, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

const AppRoot = () => {
  const navigation = useNavigation();
  const textImagePosition = useRef(new Animated.Value(0)).current;
  const mainImagePosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(textImagePosition, {
          toValue: -60,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(mainImagePosition, {
          toValue: 60,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000), // Pause for 1 second after the animation
    ]);

    animation.start(() => {
      // Navigate to the 'Login' screen after the animation completes
      if (navigation) {
        navigation.navigate('Login'); // Navigates to the 'Login' screen
      }
    });

    return () => {
      animation.stop(); // Cleanup on unmount
    };
  }, [navigation, textImagePosition, mainImagePosition]); // Validate dependencies

  return (
    <View style={styles.splashContainer}>
      <Animated.View
        style={[
          styles.imageContainer,
          { transform: [{ translateX: mainImagePosition }] },
        ]}
      >
        <Image source={require('../assets/splash1.png')} style={styles.image} />
      </Animated.View>

      <Animated.View
        style={[
          styles.imageContainer,
          { transform: [{ translateX: textImagePosition }] },
        ]}
      >
        <Image source={require('../assets/splash2.png')} style={styles.image} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imageContainer: {
    position: 'absolute',
  },
  image: {
    width: 100,
    height: 100,
  },
});

export default AppRoot;
