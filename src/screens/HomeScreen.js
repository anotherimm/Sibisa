import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Image
            source={require('../assets/logo-sibisa.png')}  // Pastikan untuk menambahkan logo di folder assets
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Selamat Datang di</Text>
          <Text style={styles.brandName}>SIBISA</Text>
          <Text style={styles.subtitle}>Sistem Informasi Bank Sampah Sriwulan</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('Nasabah')}
          >
            <View style={styles.iconContainer}>
              {/* Anda bisa menambahkan icon di sini */}
              <Text style={styles.iconText}>👥</Text>
            </View>
            <Text style={styles.buttonText}>Kelola Nasabah</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('Setoran')}
          >
            <View style={styles.iconContainer}>
              {/* Anda bisa menambahkan icon di sini */}
              <Text style={styles.iconText}>♻️</Text>
            </View>
            <Text style={styles.buttonText}>Catat Setoran Sampah</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('HasilSetoran')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>📊</Text>
            </View>
            <Text style={styles.buttonText}>Hasil Setoran</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('Monitoring')}
          >
            <View style={styles.iconContainer}>
              {/* Anda bisa menambahkan icon di sini */}
              <Text style={styles.iconText}>📈</Text>
            </View>
            <Text style={styles.buttonText}>Monitoring Fermentasi Pupuk</Text>
          </TouchableOpacity>

        </View>
        {/* Footer Copyright */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 PPK ORMAWA BEM FT. All Rights Reserved.</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 5,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E9',
    marginBottom: 20,
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#E8F5E9',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5E20',
  },
  footer: {
    padding: 10,
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#fff',
  },
});