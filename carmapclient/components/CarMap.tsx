import React, { useState, useEffect, useRef } from 'react';
import {StyleSheet, View, Text} from 'react-native';
import { gql, useSubscription } from '@apollo/client';
import MapView, { Marker } from 'react-native-maps';

import SlidingUpPanel from 'rn-sliding-up-panel';
import CloseButton from './CloseButton';

type Car = {
  id: string;
  location: {latitude: number; longitude: number};
  distanceToDestination: number;
};

const SUBSCRIPTION = gql`
subscription {
  car {
    id
    location {
      latitude
      longitude
    }
    distanceToDestination
  }
}
`;

const CarMap = () => {
  // At the top of this component you should subscribe to updates from the server.
  // See https://www.apollographql.com/docs/react/data/subscriptions/#executing-a-subscription
  const panelEl = useRef<SlidingUpPanel>(null);
  const { data = [] } = useSubscription(SUBSCRIPTION)
  const [coord, setCoord] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.1022,
    longitudeDelta: 0.0521,
  })
  const [selectedCar, setSelectedCar] = useState<number>(0)

  useEffect(() => {
    if (data?.car?.[0]) {
      const { latitude, longitude } = data?.car?.[4].location
      setCoord({
        ...coord,
        latitude,
        longitude
      })
    }
  }, [data])
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825, // can use react-native-get-location to get current coordinates of the client. But it's not the requirement of the
          longitude: -122.4324,
          latitudeDelta: 0.1022,
          longitudeDelta: 0.0521,
        }}
        region={coord}
      >
        {data?.car?.map((val: any , index: number) => {
          const { latitude, longitude } = val.location
          return (
            <Marker
              key={index}
              coordinate={{
                latitude,
                longitude
              }}
              image={require('./Car.png')}
              onPress={() => {
                setSelectedCar(index)
                panelEl.current?.show()
              }}
            />
          )
        })}
      </MapView>
      {/* For documentation on the MapView see https://github.com/react-native-maps/react-native-maps */}
      <SlidingUpPanel
        ref={panelEl}
        draggableRange={{top: 200, bottom: 0}}
        showBackdrop={false}
        allowDragging={false}>
        <View style={styles.panel}>
          <CloseButton
            onPress={() => panelEl.current?.hide()}
          />
          <Text style={styles.txtID}>Car #{data?.car?.[selectedCar].id}</Text>
          <Text>Location: {`${data?.car?.[selectedCar].location?.latitude?.toFixed(5) }, ${data?.car?.[selectedCar].location?.longitude?.toFixed(5)}`}</Text>
          <Text>Distance to Destination: {data?.car?.[selectedCar].distanceToDestination}</Text>
        </View>
      </SlidingUpPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  panel: {
    flex: 1,
    backgroundColor: 'white',
    paddingLeft: 20,
    paddingTop: 20,
  },
  txtID: {
    fontWeight: 'bold',
    marginBottom: 12
  }
});

export default CarMap;


