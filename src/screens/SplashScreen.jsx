import React, { useEffect, useRef } from 'react';
import { Animated, View, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const textImagePosition = useRef(new Animated.Value(0)).current;
  const mainImagePosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(mainImagePosition, {
          toValue: -60,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(textImagePosition, {
          toValue: 60,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
    ]);

    animation.start()

    return () => {
      animation.stop();
    };
  }, [navigation, textImagePosition, mainImagePosition]);

  return (
    <View style={styles.splashContainer}>
      <Animated.View
        style={[
          styles.imageContainer,
          { transform: [{ translateX: textImagePosition }] },
        ]}
      >
        <Image source={require('../assets/splash2.png')} style={styles.image} />
      </Animated.View>

      <Animated.View
        style={[
          styles.imageContainer,
          { transform: [{ translateX: mainImagePosition }] },
        ]}
      >
        <Image source={require('../assets/splash1.png')} style={styles.image} />
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

export default SplashScreen;