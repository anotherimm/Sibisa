import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { addNasabah, getNasabahList, updateNasabah, deleteNasabah } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';


export default function NasabahScreen() {
  const [nasabahList, setNasabahList] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  const [filteredNasabahList, setFilteredNasabahList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  // Form states
  const [nama, setNama] = useState('');
  const [telepon, setTelepon] = useState('');
  const [alamat, setAlamat] = useState('');

  useEffect(() => {
    loadNasabahData();
  }, []);

  useEffect(() => {
    setFilteredNasabahList(nasabahList);
  }, [nasabahList]);

  const loadNasabahData = async () => {
    try {
      setIsLoading(true);
      const data = await getNasabahList();
      // Pastikan setiap nasabah memiliki `nasabahId` sebagai ID unik
      const validatedData = data.map((nasabah) => ({
        ...nasabah,
        id: nasabah.nasabahId, // Gunakan `nasabahId` dari Firebase sebagai `id`
      }));
      setNasabahList(validatedData || []);
    } catch (error) {
      console.error("Error loading nasabah:", error);
      Alert.alert("Error", "Gagal memuat data nasabah");
    }
    finally {
      setIsLoading(false);
    }
  };
  
  const resetForm = () => {
    setNama('');
    setTelepon('');
    setAlamat('');
    setSelectedId(null);
    setIsEditing(false);
    setIsFormVisible(false);
  };

  const handleSubmit = async () => {
    if (!nama || !telepon || !alamat) {
      Alert.alert("Error", "Semua field harus diisi");
      return;
    }

    const nasabahData = { nama, telepon, alamat };
    
    try {
      if (isEditing) {
        await updateNasabah(selectedId, nasabahData);
        Alert.alert("Sukses", `Data nasabah ${nama} berhasil diperbarui!`);
      } else {
        await addNasabah(nasabahData);
        Alert.alert("Sukses", `Nasabah ${nama} berhasil ditambahkan!`);
      }
      resetForm();
      loadNasabahData();
    } catch (error) {
      console.error("Error submitting nasabah:", error);
      Alert.alert("Error", isEditing ? "Gagal memperbarui nasabah" : "Gagal menambahkan nasabah");
    }
  };

  const handleEdit = (nasabah) => {
    setNama(nasabah.nama);
    setTelepon(nasabah.telepon);
    setAlamat(nasabah.alamat);
    setSelectedId(nasabah.id); // Menggunakan `nasabahId` sebagai ID yang dipilih
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleDelete = async (nasabah) => {
    Alert.alert(
      "Konfirmasi",
      `Apakah anda yakin ingin menghapus nasabah ${nasabah.nama}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNasabah(nasabah.id); // Menggunakan `nasabahId` sebagai ID unik
              Alert.alert("Sukses", "Nasabah berhasil dihapus!");
              await loadNasabahData();
            } catch (error) {
              console.error("Error deleting nasabah:", error);
              Alert.alert("Error", "Gagal menghapus nasabah");
            }
          },
        },
      ]
    );
  };
  
  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = nasabahList.filter(nasabah =>
      nasabah.nama?.toLowerCase().includes(text.toLowerCase()) ||
      nasabah.telepon?.includes(text) ||
      nasabah.alamat?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredNasabahList(filtered);
  };
  
  const renderNasabahItem = ({ item }) => (
    <View style={styles.nasabahItem}>
      <View style={styles.nasabahInfo}>
        <Text style={styles.nasabahName}>{item.nama}</Text>
        <Text style={styles.nasabahDetail}>{item.telepon}</Text>
        <Text style={styles.nasabahDetail} numberOfLines={2}>{item.alamat}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <MaterialIcons name="edit" size={20} color="#2E7D32" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <MaterialIcons name="delete" size={20} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/logo-sibisa.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Data Nasabah</Text>
            <Text style={styles.headerSubtitle}>
              {isFormVisible 
                ? (isEditing ? 'Edit Data Nasabah' : 'Tambah Nasabah Baru')
                : 'Kelola data nasabah'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {!isFormVisible ? (
        <View style={styles.listContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsFormVisible(true)}
          >
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.buttonGradient}
            >
              <Text style={styles.addButtonText}>+ Tambah Nasabah</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nasabah..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#999"
            />
            {searchQuery !== '' && (
              <TouchableOpacity 
                onPress={() => handleSearch('')}
                style={styles.clearButton}
              >
                <MaterialIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredNasabahList}
            renderItem={renderNasabahItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Memuat data nasabah...</Text>
                  </View>
                ) : (
                  <Text style={styles.emptyText}>
                    {searchQuery.trim() !== '' 
                      ? "Nasabah tidak ditemukan"
                      : "Belum ada data nasabah"}
                  </Text>
                )}
              </View>
            )}
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Lengkap</Text>
                <TextInput
                  placeholder="Masukkan nama lengkap"
                  value={nama}
                  onChangeText={setNama}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nomor Telepon</Text>
                <TextInput
                  placeholder="Masukkan nomor telepon"
                  value={telepon}
                  onChangeText={setTelepon}
                  style={styles.input}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Alamat</Text>
                <TextInput
                  placeholder="Masukkan alamat lengkap"
                  value={alamat}
                  onChangeText={setAlamat}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.buttonText}>
                    {isEditing ? 'Perbarui' : 'Simpan'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={resetForm}
                >
                  <Text style={styles.buttonText}>Batal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
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
  listContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  addButton: {
    marginVertical: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  nasabahItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  nasabahInfo: {
    flex: 1,
  },
  nasabahName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  nasabahDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  actionButtons: {
    justifyContent: 'space-around',
    paddingLeft: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: '#E8F5E9',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
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
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4CAF50', // Modern blue color
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#f0f0f0',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  button: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  searchContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 10,
  marginBottom: 15,
  paddingHorizontal: 15,
  height: 50,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,
},
searchIcon: {
  marginRight: 10,
},
searchInput: {
  flex: 1,
  fontSize: 16,
  color: '#333',
},
clearButton: {
  padding: 5,
},
});