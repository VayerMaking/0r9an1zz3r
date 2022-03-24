import * as React from 'react';
import { Button, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import CategoriesComponent from '../components/SearchComponent';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';

export default function TabTwoScreen({ navigation }: RootTabScreenProps<'TabTwo'>) {
  return (
    <>
      <CategoriesComponent />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
