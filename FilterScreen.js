import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';

export default function FilterScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [budget, setBudget] = useState(200);
  const [days, setDays] = useState(2);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [distance, setDistance] = useState(50);

  const moods = [
    { id: 'relaxing', emoji: '🌊', label: 'Relaxing', color: '#4A90E2' },
    { id: 'adventurous', emoji: '🏔️', label: 'Adventurous', color: '#51CF66' },
    { id: 'cultural', emoji: '🎨', label: 'Cultural', color: '#FF6B6B' },
    { id: 'foodie', emoji: '🍔', label: 'Foodie', color: '#FFA500' },
    { id: 'nature', emoji: '🌳', label: 'Nature', color: '#51CF66' },
    { id: 'social', emoji: '🎉', label: 'Social', color: '#9B59B6' },
    { id: 'urban', emoji: '🏛️', label: 'Urban Explorer', color: '#34495E' },
  ];

  // Handle quick filters from home screen
  React.useEffect(() => {
    if (route.params?.quickFilter === 'weekend') {
      setDays(2);
    } else if (route.params?.quickFilter === 'budget') {
      setBudget(200);
    } else if (route.params?.mood) {
      setSelectedMoods([route.params.mood]);
    }
  }, [route.params]);

  const toggleMood = (moodId) => {
    if (selectedMoods.includes(moodId)) {
      setSelectedMoods(selectedMoods.filter(id => id !== moodId));
    } else {
      setSelectedMoods([...selectedMoods, moodId]);
    }
  };

  const handleSearch = () => {
    // Navigate to trip results (we'll create this later)
    // For now, navigate to trip details with sample data
    navigation.navigate('TripDetails', {
      filters: {
        budget,
        days,
        moods: selectedMoods,
        distance,
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plan Your Staycation</Text>
        <Text style={styles.headerSubtitle}>
          Tell us what you're looking for and we'll find the perfect escape
        </Text>
      </View>

      {/* Budget Slider */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Budget</Text>
          <Text style={styles.value}>${Math.round(budget)}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={50}
          maximumValue={1000}
          step={50}
          value={budget}
          onValueChange={setBudget}
          minimumTrackTintColor="#4A90E2"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#4A90E2"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>$50</Text>
          <Text style={styles.sliderLabel}>$1000+</Text>
        </View>
      </View>

      {/* Days Slider */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Days Available</Text>
          <Text style={styles.value}>{days} {days === 1 ? 'day' : 'days'}</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={7}
          step={1}
          value={days}
          onValueChange={setDays}
          minimumTrackTintColor="#4A90E2"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#4A90E2"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>1 day</Text>
          <Text style={styles.sliderLabel}>7 days</Text>
        </View>
      </View>

      {/* Distance Slider */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.value}>{Math.round(distance)} miles</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={200}
          step={10}
          value={distance}
          onValueChange={setDistance}
          minimumTrackTintColor="#4A90E2"
          maximumTrackTintColor="#ddd"
          thumbTintColor="#4A90E2"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>10 miles</Text>
          <Text style={styles.sliderLabel}>200 miles</Text>
        </View>
      </View>

      {/* Mood Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>What's Your Mood?</Text>
        <Text style={styles.sectionDescription}>
          Select one or more moods that match what you're looking for
        </Text>
        <View style={styles.moodGrid}>
          {moods.map((mood) => {
            const isSelected = selectedMoods.includes(mood.id);
            return (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodCard,
                  isSelected && { backgroundColor: mood.color, borderColor: mood.color },
                ]}
                onPress={() => toggleMood(mood.id)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    isSelected && styles.moodLabelSelected,
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Search Button */}
      <TouchableOpacity
        style={[
          styles.searchButton,
          selectedMoods.length === 0 && styles.searchButtonDisabled,
        ]}
        onPress={handleSearch}
        disabled={selectedMoods.length === 0}
        activeOpacity={0.8}
      >
        <Text style={styles.searchButtonText}>
          {selectedMoods.length === 0
            ? 'Select at least one mood'
            : 'Find My Staycation'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          We'll suggest destinations and activities based on your preferences
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 25,
    paddingTop: Platform.OS === 'ios' ? 20 : 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  moodCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: '#fff',
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 12,
    margin: 15,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});