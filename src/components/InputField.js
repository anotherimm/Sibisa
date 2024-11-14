// src/components/InputField.js
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function InputField({ value, onChangeText, placeholder }) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    padding: 8,
    marginVertical: 8,
  },
});
