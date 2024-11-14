import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getSetoranList, deleteSetoran, updateSetoran } from '../services/api';

export default function HasilSetoranScreen({ navigation }) {
  const [setoranList, setSetoranList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSetoran, setSelectedSetoran] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editableItem, setEditableItem] = useState(null);

  useEffect(() => {
    loadSetoranData();
  }, []);

  const loadSetoranData = async () => {
    try {
      setLoading(true);
      const data = await getSetoranList();
  
      const groupedData = data.reduce((acc, item) => {
        const nasabahId = item.nasabahId;
        if (!acc[nasabahId]) {
          acc[nasabahId] = {
            id: nasabahId,
            nasabahId,
            nama: item.namaNasabah,
            items: [],
            totalBerat: 0,
          };
        }
        acc[nasabahId].items.push({
          id: item.id,
          tanggal: item.tanggal,
          jenis: item.jenisSampah,
          berat: parseFloat(item.berat),
        });
        
        acc[nasabahId].totalBerat += parseFloat(item.berat);
        return acc;
      }, {});
  
      const formattedData = Object.values(groupedData).map((group) => {
        group.items.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        return group;
      });
  
      setSetoranList(formattedData);
      setFilteredData(formattedData);
    } catch (error) {
      console.error('Error loading setoran data:', error);
      Alert.alert('Error', 'Gagal memuat data setoran');
    } finally {
      setLoading(false);
    }
  };
  

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const filtered = setoranList.filter(item =>
        item.nama.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(setoranList);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const handleEditItem = (item, index) => {
    // Pastikan semua properti di-set dengan nilai default jika undefined
    const itemToEdit = {
      ...item,
      jenisSampah: item.jenisSampah ?? 'Tidak Diketahui', // Nilai default jika undefined
      berat: item.berat ?? 0, // Nilai default jika undefined
    };
  
    setEditMode(true);
    setEditableItem({ ...itemToEdit, index });
    setModalVisible(true);
  };
  

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedSetoran(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.nama}</Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Total Setoran:</Text>
          <Text style={styles.cardValue}>{item.totalBerat} kg</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Jumlah Item:</Text>
          <Text style={styles.cardValue}>{item.items.length} jenis</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const DetailModal = () => {
    const [editMode, setEditMode] = useState(false);
    const [editableItem, setEditableItem] = useState(null);
  
    const handleSaveEdit = async () => {
      const setoranId = selectedSetoran.items[editableItem.index]?.id;
      if (!setoranId) {
        Alert.alert('Error', 'ID setoran tidak ditemukan');
        return;
      }
    
      const jenisSampah = editableItem.jenisSampah && editableItem.jenisSampah.trim() !== ""
        ? editableItem.jenisSampah
        : selectedSetoran.items[editableItem.index]?.jenisSampah || 'Tidak Diketahui';
    
      const updatedData = {
        berat: editableItem?.berat || 0,
        jenisSampah: jenisSampah,
        namaNasabah: selectedSetoran?.nama || 'Tidak Diketahui',
        tanggal: editableItem?.tanggal || new Date().toISOString(),
      };
    
      try {
        await updateSetoran(setoranId, updatedData);
        Alert.alert(
          'Sukses',
          'Data setoran ${} berhasil diperbarui',
          [
            {
              text: 'OK',
              onPress: () => {
                loadSetoranData();
                setModalVisible(false);
                setEditMode(false);
              }
            }
          ]
        );
      } catch (error) {
        console.error('Error saving edited setoran:', error);
        Alert.alert('Error', 'Gagal memperbarui data setoran');
      }
    };
    
    const handleDeleteItem = async (itemId) => {
      Alert.alert(
        'Konfirmasi Hapus',
        'Apakah Anda yakin ingin menghapus data setoran ini?',
        [
          {
            text: 'Batal',
            style: 'cancel'
          },
          {
            text: 'Hapus',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteSetoran(itemId);
                Alert.alert(
                  'Sukses',
                  'Data setoran berhasil dihapus',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        loadSetoranData();
                        setModalVisible(false);
                      }
                    }
                  ]
                );
              } catch (error) {
                console.error('Error deleting setoran:', error);
                Alert.alert('Error', 'Gagal menghapus data setoran');
              }
            }
          }
        ]
      );
    };
    


  
    return (
      <>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            setEditMode(false);
            setEditableItem(null);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Detail Setoran</Text>
              <Text style={styles.modalSubtitle}>{selectedSetoran?.nama}</Text>
  
              <ScrollView style={styles.modalItems}>
                {selectedSetoran?.items.map((item, index) => (
                  <View key={index} style={styles.modalItem}>
                    <Text style={styles.itemName}>{item.jenis}</Text>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemDate}>{formatDate(item.tanggal)}</Text>
                      <Text style={styles.itemValue}>{item.berat} kg</Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditMode(true);
                          setEditableItem({ ...item, index });
                        }}
                      >
                        <Text style={styles.editButton}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          if (selectedSetoran.items[index]?.id) {
                            handleDeleteItem(selectedSetoran.items[index].id);
                          } else {
                            console.warn("ID untuk item tidak ditemukan.");
                          }
                        }}
                      >
                        <Text style={styles.deleteButton}>Hapus</Text>
                      </TouchableOpacity>


                    </View>
                  </View>
                ))}
              </ScrollView>
  
              <View style={styles.modalTotal}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Berat:</Text>
                  <Text style={styles.totalValue}>{selectedSetoran?.totalBerat} kg</Text>
                </View>
              </View>
  
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
  
        {editMode && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={editMode}
            onRequestClose={() => {
              setEditMode(false);
              setEditableItem(null);
              setModalVisible(true);
            }}
            style={{ zIndex: 2 }}
          >
            <View style={[styles.modalContainer, { zIndex: 2 }]}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Item</Text>
                <TextInput
                  style={styles.input}
                  value={editableItem?.jenisSampah}
                  onChangeText={(text) =>
                    setEditableItem({ ...editableItem, jenisSampah: text })  // Memastikan perubahan disimpan
                  }
                  placeholder="Jenis Sampah"
                />

                <TextInput
                  style={styles.input}
                  value={editableItem?.berat.toString()}
                  onChangeText={(text) =>
                    setEditableItem({ ...editableItem, berat: parseFloat(text) })
                  }
                  placeholder="Berat"
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                  <Text style={styles.saveButtonText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </>
    );
  };

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
            <Text style={styles.headerTitle}>Hasil Setoran</Text>
            <Text style={styles.headerSubtitle}>Riwayat setoran nasabah</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama nasabah..."
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Memuat data...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>

      <DetailModal />
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
    content: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      marginTop: -20,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      color: '#666',
    },
    listContainer: {
      flexGrow: 1,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 15,
      marginBottom: 15,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    cardName: {
      fontSize: 18,
      fontWeight: '600',
    },
    cardDate: {
      color: '#666',
    },
    cardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    cardInfo: {
      flex: 1,
    },
    cardLabel: {
      color: '#666',
      marginBottom: 5,
    },
    cardValue: {
      fontSize: 16,
      fontWeight: '500',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    modalSubtitle: {
      fontSize: 18,
      color: '#333',
    },
    modalDate: {
      color: '#666',
      marginBottom: 15,
    },
    modalItems: {
      maxHeight: 200,
    },
    modalItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    itemName: {
      fontSize: 16,
    },
    itemDetails: {
      alignItems: 'flex-end',
    },
    itemValue: {
      fontSize: 16,
      color: '#4CAF50',
      fontWeight: '500',
    },
    modalTotal: {
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '500',
    },
    totalValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    closeButton: {
      backgroundColor: '#4CAF50',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    elevation: 2,
  },
  actionButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},
editButton: {
  color: '#007BFF',
  marginRight: 10,
},
deleteButton: {
  color: '#FF0000',
},
saveButton: {
  backgroundColor: '#4CAF50',
  padding: 10,
  borderRadius: 10,
  marginTop: 20,
},
saveButtonText: {
  color: '#fff',
  textAlign: 'center',
  fontSize: 16,
},
input: {
  borderWidth: 1,
  borderColor: '#ddd',
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
},

});