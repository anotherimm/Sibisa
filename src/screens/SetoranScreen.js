import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  Image,
  Alert,
  Modal,
  FlatList,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { addSetoran, getNasabahList } from '../services/api';
import { Picker } from '@react-native-picker/picker';

export default function SetoranScreen() {
  const [selectedNasabah, setSelectedNasabah] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredNasabah, setFilteredNasabah] = useState([]);
  const [nasabahList, setNasabahList] = useState([]);
  const [showNasabahModal, setShowNasabahModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sampahList, setSampahList] = useState([{ jenisSampah: '', berat: '' }]);

  useEffect(() => {
    fetchNasabah();
  }, []);

  const fetchNasabah = async () => {
    setIsLoading(true);
    try {
      const nasabahData = await getNasabahList();
      if (Array.isArray(nasabahData)) {
        setNasabahList(nasabahData);
        setFilteredNasabah(nasabahData);
      } else {
        setNasabahList([]);
        setFilteredNasabah([]);
      }
    } catch (error) {
      Alert.alert("Error", "Gagal mengambil data nasabah. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetor = async () => {
    if (!selectedNasabah || sampahList.some(item => !item.jenisSampah || !item.berat)) {
      Alert.alert("Error", "Semua field harus diisi");
      return;
    }

    try {
      const setoranData = sampahList.map(item => ({
        nasabahId: selectedNasabah.id,
        namaNasabah: selectedNasabah.nama,
        jenisSampah: item.jenisSampah,
        berat: parseFloat(item.berat),
      }));

      for (const data of setoranData) {
        await addSetoran(data);
      }

      Alert.alert("Sukses", "Setoran berhasil dicatat!");
      setSelectedNasabah(null);
      setSampahList([{ jenisSampah: '', berat: '' }]);
    } catch (error) {
      Alert.alert("Error", "Gagal mencatat setoran. Silakan coba lagi.");
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filteredData = nasabahList.filter(item =>
      item.nama.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredNasabah(filteredData);
  };

  const selectNasabah = (nasabah) => {
    setSelectedNasabah(nasabah);
    setShowNasabahModal(false);
    setSearchText('');
  };

  const handleAddSampah = () => {
    setSampahList([...sampahList, { jenisSampah: '', berat: '' }]);
  };

  const handleRemoveSampah = (index) => {
    setSampahList(sampahList.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    const updatedList = sampahList.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setSampahList(updatedList);
  };

  const jenisSampahOptions = [
    { label: 'Pilih jenis sampah', value: '' },
    { label: 'Besi', value: 'Besi' },
    { label: 'Kaca', value: 'Kaca' },
    { label: 'Kertas', value: 'Kertas' },
    { label: 'Plastik', value: 'Plastik' },
    { label: 'Sterofoam', value: 'Sterofoam' }
  ];
  const renderPickerItem = (item, index) => (
    <View style={styles.pickerItemContainer}>
      <Text style={styles.pickerIcon}>{item.icon}</Text>
      <Text style={styles.pickerLabel}>{item.label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Image source={require('../assets/logo-sibisa.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Catat Setoran</Text>
            <Text style={styles.headerSubtitle}>Silahkan isi data setoran sampah</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Nasabah</Text>
              <TouchableOpacity
                onPress={() => setShowNasabahModal(true)}
                style={styles.input}
              >
                <Text style={selectedNasabah ? styles.inputText : styles.placeholderText}>
                  {selectedNasabah ? selectedNasabah.nama : "Pilih nama nasabah"}
                </Text>
              </TouchableOpacity>
            </View>
            {sampahList.map((item, index) => (
              <View key={index} style={styles.dynamicInputContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Jenis Sampah {index + 1}</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={item.jenisSampah}
                      onValueChange={(value) => handleInputChange(index, 'jenisSampah', value)}
                      style={styles.picker}
                      dropdownIconColor="#4CAF50"
                      mode="dropdown"
                    >
                      {jenisSampahOptions.map((option, idx) => (
                        <Picker.Item
                          key={idx}
                          label={`${option.icon ? option.icon + ' ' : ''}${option.label}`}
                          value={option.value}
                          color={option.value === '' ? '#999' : '#333'}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Berat (kg)</Text>
                  <TextInput
                    placeholder="Berat (kg)"
                    value={item.berat}
                    onChangeText={(value) => {
                      const floatValue = value.replace(/[^0-9.]/g, '');
                      handleInputChange(index, 'berat', floatValue);
                    }}
                    style={styles.input}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>

                {index > 0 && (
                  <TouchableOpacity onPress={() => handleRemoveSampah(index)}>
                    <Text style={styles.removeText}>Hapus</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={handleAddSampah} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Tambah Jenis Sampah</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSetor}>
              <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.buttonGradient}>
                <Text style={styles.submitButtonText}>Catat Setoran</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Modal visible={showNasabahModal} animationType="slide" transparent={true} onRequestClose={() => setShowNasabahModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Nasabah</Text>
              <TouchableOpacity onPress={() => setShowNasabahModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Cari nasabah..."
              value={searchText}
              onChangeText={handleSearch}
              placeholderTextColor="#999"
            />

            <FlatList
              data={filteredNasabah}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.nasabahItem} onPress={() => selectNasabah(item)}>
                  <Text style={styles.nasabahText}>{item.nama}</Text>
                  <Text style={styles.nasabahPhone}>{item.telepon}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {isLoading ? "Memuat data..." : "Tidak ada data nasabah"}
                  </Text>
                </View>
              )}
              style={styles.nasabahList}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E8F5E9',
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  searchInput: {
    margin: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  nasabahList: {
    maxHeight: '70%',
  },
  nasabahItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  nasabahText: {
    fontSize: 16,
    color: '#333',
  },
  nasabahPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dynamicInputContainer: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 10,
  },
  removeText: {
    color: 'red',
    marginLeft: 10,
  },
  addButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    marginBottom: 10,
  },
  picker: {
    height: Platform.OS === 'ios' ? 120 : 50,
    width: '100%',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        margin: -8,
      },
      android: {
        paddingHorizontal: 10,
      },
    }),
  },
  pickerItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  pickerIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
  },
  removeText: {
    color: '#DC2626', // Warna merah untuk teks
    fontWeight: '500', // Medium font weight
    fontSize: 12, // Ukuran font dikecilkan
    paddingVertical: 4, // Padding vertical dikurangi
    paddingHorizontal: 12, // Padding horizontal dikurangi
    backgroundColor: '#FEE2E2', // Background merah muda soft
    borderRadius: 6, // Border radius disesuaikan
    overflow: 'hidden',
    marginVertical: 2, // Margin vertical dikurangi
    textAlign: 'center', // Teks di tengah
    alignSelf: 'center', // Komponen di tengah secara horizontal
},
  
});