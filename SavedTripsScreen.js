import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@moodmiles_saved_trips';

export default function SavedTripsScreen() {
  const navigation = useNavigation();
  const [savedTrips, setSavedTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSavedTrips = async () => {
    try {
      setIsLoading(true);
      const tripsJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (tripsJson) {
        const trips = JSON.parse(tripsJson);
        // Format trips for display
        const formattedTrips = trips.map(trip => ({
          id: trip.id,
          destination: trip.destination,
          days: trip.days,
          numPeople: trip.numPeople,
          budget: trip.budget,
          currency: trip.currency || '₹',
          startDate: trip.startDate,
          endDate: trip.endDate,
          moods: trip.moods || [],
        }));
        setSavedTrips(formattedTrips);
      } else {
        setSavedTrips([]);
      }
    } catch (error) {
      console.error('Error loading saved trips:', error);
      setSavedTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTrip = async (tripId) => {
    try {
      // Get existing trips
      const tripsJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (tripsJson) {
        const trips = JSON.parse(tripsJson);
        // Remove the trip with matching ID
        const updatedTrips = trips.filter(trip => trip.id !== tripId);
        // Save updated trips
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips));
        // Reload trips to update UI
        await loadSavedTrips();
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      Alert.alert('Error', 'Failed to delete trip. Please try again.');
    }
  };

  const handleDeleteTrip = (tripId, destination) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete your ${destination} trip?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTrip(tripId)
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Load trips on mount
  useEffect(() => {
    loadSavedTrips();
  }, []);

  // Reload trips when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSavedTrips();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your trips...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {savedTrips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>✈️</Text>
          <Text style={styles.emptyStateTitle}>No Trips Saved Yet</Text>
          <Text style={styles.emptyStateText}>
            Start planning your first trip and save your favorite trips here!
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.ctaButtonGradient}
            >
              <Text style={styles.ctaButtonText}>Plan My First Trip</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.tripsList}>
          {savedTrips.map((trip) => {
            const startDate = new Date(trip.startDate);
            const endDate = new Date(trip.endDate);

            return (
              <View key={trip.id} style={styles.tripCardWrapper}>
                <TouchableOpacity
                  style={styles.tripCard}
                  onPress={() => {
                    navigation.navigate('TripDetails', {
                      filters: {
                        destination: trip.destination,
                        startDate: trip.startDate,
                        endDate: trip.endDate,
                        days: trip.days,
                        numPeople: trip.numPeople,
                        budget: trip.budget,
                        moods: trip.moods || [],
                        currency: trip.currency === '₹' ? 'INR' : 'USD',
                      }
                    });
                  }}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.tripCardGradient}
                  >
                    <View style={styles.tripCardHeader}>
                      <View style={styles.tripCardContent}>
                        <Text style={styles.tripCardDestination}>{trip.destination}</Text>
                        <Text style={styles.tripCardDate}>
                          {formatDate(startDate)} - {formatDate(endDate)}
                        </Text>
                        <View style={styles.tripCardInfo}>
                          <Text style={styles.tripCardBudget}>
                            {trip.currency || '₹'}{trip.budget?.toLocaleString() || '0'}
                          </Text>
                          <Text style={styles.tripCardDays}>{trip.days} days</Text>
                        </View>
                        {trip.numPeople && (
                          <Text style={styles.tripCardPeople}>
                            👥 {trip.numPeople} {trip.numPeople === 1 ? 'person' : 'people'}
                          </Text>
                        )}
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={styles.tripCardActions}>
                  <TouchableOpacity
                    style={styles.editTripButton}
                    onPress={() => {
                      navigation.navigate('Home', {
                        editTrip: {
                          destination: trip.destination,
                          startDate: trip.startDate,
                          endDate: trip.endDate,
                          days: trip.days,
                          numPeople: trip.numPeople,
                          budget: trip.budget,
                          moods: trip.moods || [],
                          currency: trip.currency === '₹' ? 'INR' : 'USD',
                        }
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editTripIcon}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteTripButton}
                    onPress={() => handleDeleteTrip(trip.id, trip.destination)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteTripIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    maxWidth: 300,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaButtonGradient: {
    padding: 18,
    paddingHorizontal: 30,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tripsList: {
    gap: 20,
  },
  tripCardWrapper: {
    position: 'relative',
  },
  tripCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  tripCardGradient: {
    padding: 24,
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripCardContent: {
    flex: 1,
  },
  tripCardDestination: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tripCardDate: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  tripCardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripCardBudget: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  tripCardDays: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  tripCardPeople: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  tripCardActions: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    gap: 10,
    zIndex: 10,
  },
  editTripButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  editTripIcon: {
    fontSize: 18,
  },
  deleteTripButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteTripIcon: {
    fontSize: 20,
  },
});