import { db } from './FirebaseConfig';
import { ref, set, get, update, push, remove } from 'firebase/database';

// Fungsi untuk menambahkan setoran
export const addSetoran = async (setoranData) => {
  try {
    const setoranListRef = ref(db, 'setoran');
    const newSetoranRef = push(setoranListRef);
    
    await set(newSetoranRef, {
      nasabahId: setoranData.nasabahId,
      namaNasabah: setoranData.namaNasabah,
      jenisSampah: setoranData.jenisSampah,
      berat: setoranData.berat,
      tanggal: new Date().toISOString(),
    });
    
    await updateTotalSetoran(setoranData.nasabahId, setoranData.berat);
    
    console.log("Setoran berhasil ditambahkan");
    return true;
  } catch (error) {
    console.error("Error adding setoran:", error);
    throw error;
  }
};

// Fungsi untuk mengupdate total setoran nasabah
const updateTotalSetoran = async (nasabahId, deltaBerat) => {
  try {
    const nasabahRef = ref(db, `nasabah/${nasabahId}`);
    const nasabahSnapshot = await get(nasabahRef);

    if (nasabahSnapshot.exists()) {
      const nasabahData = nasabahSnapshot.val();
      const totalSetoranSaatIni = nasabahData.totalSetoran || 0;
      const totalSetoranBaru = totalSetoranSaatIni + deltaBerat;

      // Update total setoran dengan nilai baru
      await update(nasabahRef, {
        totalSetoran: totalSetoranBaru >= 0 ? totalSetoranBaru : 0 // Pastikan total tidak negatif
      });
    } else {
      console.log("Nasabah not found");
    }
  } catch (error) {
    console.error("Error updating total setoran:", error);
  }
};
// Fungsi untuk mendapatkan daftar setoran
export const getSetoranList = async () => {
  try {
    const snapshot = await get(ref(db, 'setoran'));
    if (snapshot.exists()) {
      const setoranData = [];
      snapshot.forEach(childSnapshot => {
        const setoran = childSnapshot.val();
        setoranData.push({
          id: childSnapshot.key,
          ...setoran
        });
      });
      return setoranData;
    } else {
      console.log("No setoran data available");
      return [];
    }
  } catch (error) {
    console.error("Error fetching setoran data:", error);
    throw error;
  }
};

// Fungsi untuk mendapatkan setoran berdasarkan nasabah
export const getSetoranByNasabah = async (nasabahId) => {
  try {
    const snapshot = await get(ref(db, 'setoran'));
    if (snapshot.exists()) {
      const setoranData = [];
      snapshot.forEach(childSnapshot => {
        const setoran = childSnapshot.val();
        if (setoran.nasabahId === nasabahId) {
          setoranData.push({
            id: childSnapshot.key,
            ...setoran
          });
        }
      });
      return setoranData;
    }
    return [];
  } catch (error) {
    console.error("Error fetching setoran by nasabah:", error);
    throw error;
  }
};

// Fungsi untuk mendapatkan daftar nasabah
export const getNasabahList = async () => {
  try {
    const snapshot = await get(ref(db, 'nasabah'));
    if (snapshot.exists()) {
      const nasabahData = [];
      snapshot.forEach(childSnapshot => {
        const nasabah = childSnapshot.val();
        nasabahData.push({
          id: childSnapshot.key,
          ...nasabah
        });
      });
      return nasabahData;
    } else {
      console.log("No nasabah data available");
      return [];
    }
  } catch (error) {
    console.error("Error fetching nasabah data:", error);
    throw error;
  }
};

export const deleteNasabah = async (nasabahId) => {
  try {
    // Get reference to nasabah and setoran
    const nasabahRef = ref(db, `nasabah/${nasabahId}`);
    const setoranRef = ref(db, 'setoran');
    
    // Get all setoran data first
    const setoranSnapshot = await get(setoranRef);
    const deletionPromises = [];
    
    // Find and delete all setoran records for this nasabah
    if (setoranSnapshot.exists()) {
      setoranSnapshot.forEach((childSnapshot) => {
        const setoran = childSnapshot.val();
        if (setoran.nasabahId === nasabahId) {
          // Add deletion promise to array
          const setoranItemRef = ref(db, `setoran/${childSnapshot.key}`);
          deletionPromises.push(remove(setoranItemRef));
        }
      });
    }
    
    // Add nasabah deletion to promises array
    deletionPromises.push(remove(nasabahRef));
    
    // Execute all deletions concurrently
    await Promise.all(deletionPromises);
    
    console.log(`Nasabah with ID ${nasabahId} and all associated setoran records successfully deleted`);
    return true;
  } catch (error) {
    console.error("Error deleting nasabah and setoran records:", error.message);
    throw error;
  }
};
export const updateNasabah = async (nasabahId, nasabahData) => {
  try {
    const nasabahRef = ref(db, `nasabah/${nasabahId}`);
    await update(nasabahRef, nasabahData);  // Update data di node yang sesuai dengan nasabahId
    console.log(`Nasabah dengan ID ${nasabahId} berhasil diperbarui`);
    return true;
  } catch (error) {
    console.error("Error updating nasabah:", error.message);
    throw error;
  }
};



export const addNasabah = async (nasabahData) => {
  try {
    // Membuat ID unik untuk nasabah baru
    const nasabahRef = push(ref(db, 'nasabah'));
    const nasabahId = nasabahRef.key;

    // Tambahkan data nasabah dengan ID yang baru dibuat
    await set(nasabahRef, {
      ...nasabahData,
      nasabahId, // Simpan nasabahId dalam data nasabah untuk referensi di masa depan
    });

    console.log("Nasabah berhasil ditambahkan");
    return nasabahId;
  } catch (error) {
    console.error("Error adding nasabah:", error);
    throw error;
  }
};

export const deleteSetoran = async (id) => {
  try {
    const setoranRef = ref(db, `setoran/${id}`);
    const setoranSnapshot = await get(setoranRef);

    if (setoranSnapshot.exists()) {
      const setoranData = setoranSnapshot.val();
      const nasabahId = setoranData.nasabahId;
      const berat = setoranData.berat;

      console.log(`Deleting setoran with ID ${id} for nasabah ${nasabahId}, berat: ${berat}`);

      // Hapus setoran
      await remove(setoranRef);

      // Perbarui total setoran nasabah
      await updateTotalSetoran(nasabahId, -berat);
      console.log('Setoran deleted successfully and total setoran updated!');
    } else {
      console.warn(`Setoran with ID ${id} not found in the database.`);
    }
  } catch (error) {
    console.error('Error deleting setoran:', error);
  }
};

export const updateSetoran = async (id, updatedData) => {
  try {
    const setoranRef = ref(db, `setoran/${id}`);
    const setoranSnapshot = await get(setoranRef);

    if (setoranSnapshot.exists()) {
      const oldData = setoranSnapshot.val();
      const nasabahId = oldData.nasabahId;
      const beratLama = oldData.berat;
      const beratBaru = updatedData.berat || beratLama;
      const deltaBerat = beratBaru - beratLama;

      console.log(`Updating setoran with ID ${id} for nasabah ${nasabahId}, old berat: ${beratLama}, new berat: ${beratBaru}`);

      // Update setoran dengan data baru
      await update(setoranRef, updatedData);

      // Perbarui total setoran nasabah
      await updateTotalSetoran(nasabahId, deltaBerat);
      console.log('Setoran updated successfully and total setoran adjusted!');
    } else {
      console.warn(`Setoran with ID ${id} not found in the database.`);
    }
  } catch (error) {
    console.error('Error updating setoran:', error);
  }
};
