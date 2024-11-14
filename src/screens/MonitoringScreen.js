import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const MonitoringScreen = () => {
  const [selectedDay, setSelectedDay] = useState('Hari 1');
  const [showDayPicker, setShowDayPicker] = useState(false);

  // Sample data organized by days
  const monitoringData = {
    'Hari 1': {
      temperature: [25, 26, 28, 30, 29, 27, 20, 25, 26, 28, 30, 29],
      humidity: [65, 68, 70, 72, 70, 69, 67, 65, 68, 70, 72, 70],
      times: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', 
              '14:00', '16:00', '18:00', '20:00', '22:00']
    },
    'Hari 2': {
      temperature: [24, 25, 27, 29, 30, 28, 26, 25, 24, 26, 28, 27],
      humidity: [63, 65, 68, 70, 72, 71, 69, 67, 66, 68, 70, 69],
      times: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', 
              '14:00', '16:00', '18:00', '20:00', '22:00']
    },
    'Hari 3': {
      temperature: [23, 24, 26, 28, 29, 27, 25, 24, 23, 25, 27, 26],
      humidity: [62, 64, 67, 69, 71, 70, 68, 66, 65, 67, 69, 68],
      times: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', 
              '14:00', '16:00', '18:00', '20:00', '22:00']
    }
  };

  const DayPicker = () => (
    <View style={styles.dayPickerContainer}>
      <TouchableOpacity 
        style={styles.daySelector}
        onPress={() => setShowDayPicker(!showDayPicker)}
      >
        <Text style={styles.selectedDayText}>{selectedDay}</Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>
      
      {showDayPicker && (
        <View style={styles.dropdownList}>
          {Object.keys(monitoringData).map((day) => (
            <TouchableOpacity
              key={day}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedDay(day);
                setShowDayPicker(false);
              }}
            >
              <Text style={[
                styles.dropdownItemText,
                selectedDay === day && styles.selectedDropdownItem
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const SimpleGraph = ({ data, maxValue, color, title }) => {
    const barWidth = 40;
    const height = 150;
    const padding = 20;
    const totalWidth = barWidth * data.length;

    return (
      <View style={styles.card}>
        <Text style={styles.graphTitle}>{title}</Text>
        <View style={[styles.graphContainer, { height }]}>
          <View style={styles.yAxis}>
            <Text style={styles.axisLabel}>{maxValue}</Text>
            <Text style={styles.axisLabel}>{maxValue / 2}</Text>
            <Text style={styles.axisLabel}>0</Text>
          </View>

          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={true}
            style={styles.graphScrollView}
          >
            <View style={[styles.graph, { width: totalWidth }]}>
              {data.map((value, index) => (
                <View key={index} style={[styles.barContainer, { width: barWidth }]}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: (value / maxValue) * (height - padding * 2),
                        backgroundColor: color 
                      }
                    ]} 
                  />
                  <Text style={styles.xLabel}>
                    {monitoringData[selectedDay].times[index]}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
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
            <Text style={styles.headerTitle}>Monitoring Pupuk</Text>
            <Text style={styles.headerSubtitle}>Pantau proses fermentasi pupuk</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Day Picker */}
        <DayPicker />

        {/* Current Reading Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pembacaan Saat Ini</Text>
          <View style={styles.readingsContainer}>
            <View style={styles.readingItem}>
              <Text style={styles.readingLabel}>Suhu</Text>
              <Text style={styles.readingValue}>
                {monitoringData[selectedDay].temperature[
                  monitoringData[selectedDay].temperature.length - 1
                ]}°C
              </Text>
            </View>
            <View style={styles.readingSeparator} />
            <View style={styles.readingItem}>
              <Text style={styles.readingLabel}>Kelembaban</Text>
              <Text style={styles.readingValue}>
                {monitoringData[selectedDay].humidity[
                  monitoringData[selectedDay].humidity.length - 1
                ]}%
              </Text>
            </View>
          </View>
        </View>

        {/* Temperature Graph */}
        <SimpleGraph 
          data={monitoringData[selectedDay].temperature}
          maxValue={40}
          color="#FF6B6B"
          title="Grafik Suhu (°C)"
        />

        {/* Humidity Graph */}
        <SimpleGraph 
          data={monitoringData[selectedDay].humidity}
          maxValue={100}
          color="#4CACBC"
          title="Grafik Kelembaban (%)"
        />

        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status Fermentasi</Text>
          <View style={styles.statusContainer}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.statusIndicator}
            >
              <Text style={styles.statusText}>Normal</Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  contentContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  readingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  readingItem: {
    alignItems: 'center',
    flex: 1,
  },
  readingSeparator: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15,
  },
  readingLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  readingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  dayPickerContainer: {
    marginBottom: 20,
    zIndex: 1000,
  },
  daySelector: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  selectedDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#666',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownItem: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  graphScrollView: {
    flex: 1,
  },
  yAxis: {
    width: 40,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  axisLabel: {
    fontSize: 12,
    color: '#666',
  },
  graph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    paddingBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  xLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIndicator: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MonitoringScreen;