import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
  ImageBackground,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Currency mapping based on country
const CURRENCY_MAP = {
  US: { symbol: '$', code: 'USD', name: 'US Dollar' },
  CA: { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
  GB: { symbol: '£', code: 'GBP', name: 'British Pound' },
  AU: { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
  EU: { symbol: '€', code: 'EUR', name: 'Euro' },
  IN: { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  JP: { symbol: '¥', code: 'JPY', name: 'Japanese Yen' },
  CN: { symbol: '¥', code: 'CNY', name: 'Chinese Yuan' },
  MX: { symbol: '$', code: 'MXN', name: 'Mexican Peso' },
  BR: { symbol: 'R$', code: 'BRL', name: 'Brazilian Real' },
  DEFAULT: { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
};

const getCurrencyFromCountry = (countryCode) => {
  return CURRENCY_MAP[countryCode] || CURRENCY_MAP.DEFAULT;
};

// Global destinations database - supports worldwide locations
const GLOBAL_DESTINATIONS = {
  // Popular destinations worldwide
  'philippines': [
    { id: 'manila', name: 'Manila', distance: 'Capital', image: 'https://images.unsplash.com/photo-1555993536-48e913588e64?w=600&h=600&fit=crop', description: 'Historic capital city' },
    { id: 'boracay', name: 'Boracay', distance: '350 km', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=600&fit=crop', description: 'World-famous beach paradise' },
    { id: 'palawan', name: 'Palawan', distance: '580 km', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', description: 'Island paradise with lagoons' },
    { id: 'cebu', name: 'Cebu', distance: '570 km', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=600&fit=crop', description: 'Cultural and beach destination' }
  ],
  'dubai': [
    { id: 'dubai-city', name: 'Dubai', distance: 'City', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=600&fit=crop', description: 'Modern metropolis with luxury' },
    { id: 'burj-khalifa', name: 'Burj Khalifa Area', distance: 'Downtown', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=600&fit=crop', description: 'Iconic skyscraper district' },
    { id: 'palm-jumeirah', name: 'Palm Jumeirah', distance: '25 km', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=600&fit=crop', description: 'Artificial island paradise' },
    { id: 'desert-safari', name: 'Desert Safari', distance: '50 km', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', description: 'Desert adventure experience' }
  ],
  'thailand': [
    { id: 'bangkok', name: 'Bangkok', distance: 'Capital', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=600&fit=crop', description: 'Vibrant capital city' },
    { id: 'phuket', name: 'Phuket', distance: '860 km', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=600&fit=crop', description: 'Tropical beach paradise' },
    { id: 'chiang-mai', name: 'Chiang Mai', distance: '700 km', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', description: 'Mountain city with temples' },
    { id: 'krabi', name: 'Krabi', distance: '800 km', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&h=600&fit=crop', description: 'Stunning limestone cliffs' }
  ],
  'singapore': [
    { id: 'singapore-city', name: 'Singapore', distance: 'City', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=600&fit=crop', description: 'Modern city-state' },
    { id: 'marina-bay', name: 'Marina Bay', distance: 'Downtown', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=600&fit=crop', description: 'Iconic waterfront area' },
    { id: 'sentosa', name: 'Sentosa Island', distance: '5 km', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=600&fit=crop', description: 'Resort island getaway' }
  ],
  'malaysia': [
    { id: 'kuala-lumpur', name: 'Kuala Lumpur', distance: 'Capital', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&h=600&fit=crop', description: 'Modern capital with Petronas Towers' },
    { id: 'langkawi', name: 'Langkawi', distance: '500 km', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=600&fit=crop', description: 'Tropical island paradise' },
    { id: 'penang', name: 'Penang', distance: '350 km', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=600&fit=crop', description: 'Food and culture hub' }
  ],
  'indonesia': [
    { id: 'bali', name: 'Bali', distance: 'Island', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=600&fit=crop', description: 'Tropical paradise with temples' },
    { id: 'jakarta', name: 'Jakarta', distance: 'Capital', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=600&fit=crop', description: 'Bustling capital city' },
    { id: 'yogyakarta', name: 'Yogyakarta', distance: '550 km', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=600&fit=crop', description: 'Cultural heart of Java' }
  ],
  'japan': [
    { id: 'tokyo', name: 'Tokyo', distance: 'Capital', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=600&fit=crop', description: 'Modern metropolis' },
    { id: 'kyoto', name: 'Kyoto', distance: '370 km', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=600&fit=crop', description: 'Ancient temples and gardens' },
    { id: 'osaka', name: 'Osaka', distance: '400 km', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=600&fit=crop', description: 'Food and entertainment hub' }
  ],
  'south korea': [
    { id: 'seoul', name: 'Seoul', distance: 'Capital', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=600&fit=crop', description: 'Modern capital city' },
    { id: 'busan', name: 'Busan', distance: '325 km', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=600&fit=crop', description: 'Coastal city with beaches' }
  ],
  'vietnam': [
    { id: 'ho-chi-minh', name: 'Ho Chi Minh City', distance: 'City', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=600&fit=crop', description: 'Vibrant southern city' },
    { id: 'hanoi', name: 'Hanoi', distance: 'Capital', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&h=600&fit=crop', description: 'Historic capital' },
    { id: 'halong-bay', name: 'Ha Long Bay', distance: '170 km', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', description: 'UNESCO World Heritage site' }
  ],
  'australia': [
    { id: 'sydney', name: 'Sydney', distance: 'City', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', description: 'Harbor city with Opera House' },
    { id: 'melbourne', name: 'Melbourne', distance: '870 km', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=600&fit=crop', description: 'Cultural capital' },
    { id: 'gold-coast', name: 'Gold Coast', distance: '900 km', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=600&fit=crop', description: 'Beach and theme parks' }
  ],
  'france': [
    { id: 'paris', name: 'Paris', distance: 'Capital', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=600&fit=crop', description: 'City of Light' },
    { id: 'nice', name: 'Nice', distance: '930 km', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=600&fit=crop', description: 'French Riviera beauty' }
  ],
  'italy': [
    { id: 'rome', name: 'Rome', distance: 'Capital', image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=600&h=600&fit=crop', description: 'Eternal City' },
    { id: 'venice', name: 'Venice', distance: '525 km', image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=600&h=600&fit=crop', description: 'Floating city' },
    { id: 'florence', name: 'Florence', distance: '275 km', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=600&fit=crop', description: 'Renaissance art city' }
  ],
  'spain': [
    { id: 'barcelona', name: 'Barcelona', distance: 'City', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=600&fit=crop', description: 'Architectural marvel' },
    { id: 'madrid', name: 'Madrid', distance: 'Capital', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&h=600&fit=crop', description: 'Royal capital' }
  ],
  'united kingdom': [
    { id: 'london', name: 'London', distance: 'Capital', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=600&fit=crop', description: 'Historic capital' },
    { id: 'edinburgh', name: 'Edinburgh', distance: '650 km', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', description: 'Scottish capital' }
  ],
  'usa': [
    { id: 'new-york', name: 'New York', distance: 'City', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=600&fit=crop', description: 'The Big Apple' },
    { id: 'los-angeles', name: 'Los Angeles', distance: '4,500 km', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=600&fit=crop', description: 'Entertainment capital' },
    { id: 'san-francisco', name: 'San Francisco', distance: '4,200 km', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', description: 'Golden Gate city' }
  ],
  'canada': [
    { id: 'toronto', name: 'Toronto', distance: 'City', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=600&fit=crop', description: 'Multicultural metropolis' },
    { id: 'vancouver', name: 'Vancouver', distance: '3,400 km', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop', description: 'Coastal mountain city' }
  ],
  // India destinations (fallback)
  'india': [
    { id: 'goa', name: 'Goa', distance: '450 km', image: 'https://assets.serenity.co.uk/58000-58999/58779/1296x864.jpg', description: 'Beach paradise' },
    { id: 'kerala', name: 'Kerala', distance: '600 km', image: 'https://media.cntravellerme.com/photos/65f7d2fe6dc13f3de7946c00/16:9/w_2560%2Cc_limit/GettyImages-110051777.jpg', description: 'Gods own country' },
    { id: 'rajasthan', name: 'Rajasthan', distance: '500 km', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&h=600&fit=crop', description: 'Land of kings' },
    { id: 'himachal', name: 'Himachal Pradesh', distance: '700 km', image: 'https://t3.ftcdn.net/jpg/04/09/57/16/360_F_409571615_KEsl0FOjDX23T805YsCUVqJyhjy6iRJt.jpg', description: 'Mountain paradise' }
  ]
};

// Get nearby destinations based on actual location or country
const getNearbyDestinations = (city, countryCode) => {
  // First, try to match by country code
  const countryMap = {
    'PH': 'philippines',
    'AE': 'dubai',
    'TH': 'thailand',
    'SG': 'singapore',
    'MY': 'malaysia',
    'ID': 'indonesia',
    'JP': 'japan',
    'KR': 'south korea',
    'VN': 'vietnam',
    'AU': 'australia',
    'FR': 'france',
    'IT': 'italy',
    'ES': 'spain',
    'GB': 'united kingdom',
    'US': 'usa',
    'CA': 'canada',
    'IN': 'india'
  };

  const countryKey = countryMap[countryCode] || 'india';

  // Return destinations for the detected country
  if (GLOBAL_DESTINATIONS[countryKey]) {
    return GLOBAL_DESTINATIONS[countryKey];
  }

  // Fallback to popular destinations
  return GLOBAL_DESTINATIONS['india'];
};

// Get all popular destinations for the destinations modal
const getAllPopularDestinations = () => {
  const allDestinations = [];
  Object.values(GLOBAL_DESTINATIONS).forEach(countryDestinations => {
    countryDestinations.forEach(dest => {
      if (!allDestinations.find(d => d.id === dest.id)) {
        allDestinations.push(dest);
      }
    });
  });
  return allDestinations;
};

// Helper functions for date handling (defined outside component)
const formatDateInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const filtersRef = useRef(null);
  const [savedTrips, setSavedTrips] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [countryCode, setCountryCode] = useState('IN');
  const [userCity, setUserCity] = useState('');
  const [nearbyDestinations, setNearbyDestinations] = useState([]);
  const [currency, setCurrency] = useState(CURRENCY_MAP.IN);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showFilters, setShowFilters] = useState(false);
  const [showDestinationsModal, setShowDestinationsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    mobile: '',
    email: '',
    concern: ''
  });

  // Filter states - Updated for itinerary generation
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(10000);
  const [numPeople, setNumPeople] = useState(2);
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [showStartDateDropdown, setShowStartDateDropdown] = useState(false);
  const [showEndDateDropdown, setShowEndDateDropdown] = useState(false);

  // Initialize dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(tomorrow);

  // Calendar view state
  const [startCalendarMonth, setStartCalendarMonth] = useState(today.getMonth());
  const [startCalendarYear, setStartCalendarYear] = useState(today.getFullYear());
  const [endCalendarMonth, setEndCalendarMonth] = useState(tomorrow.getMonth());
  const [endCalendarYear, setEndCalendarYear] = useState(tomorrow.getFullYear());
  const [startDateText, setStartDateText] = useState(() => {
    const today = new Date();
    return formatDateInput(today);
  });
  const [endDateText, setEndDateText] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateInput(tomorrow);
  });

  const moods = [
    { id: 'relaxing', emoji: '🌊', label: 'Relaxing', color: '#10B981', gradient: ['#10B981', '#059669'] },
    { id: 'adventurous', emoji: '🏔️', label: 'Adventurous', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    { id: 'cultural', emoji: '🎨', label: 'Cultural', color: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
    { id: 'foodie', emoji: '🍔', label: 'Foodie', color: '#F97316', gradient: ['#F97316', '#EA580C'] },
    { id: 'nature', emoji: '🌳', label: 'Nature', color: '#22C55E', gradient: ['#22C55E', '#16A34A'] },
    { id: 'social', emoji: '🎉', label: 'Social', color: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
    { id: 'urban', emoji: '🏛️', label: 'Urban', color: '#6B7280', gradient: ['#6B7280', '#4B5563'] },
  ];

  const STORAGE_KEY = '@moodmiles_saved_trips';
  const AUTH_STORAGE_KEY = '@moodmiles_auth';
  const route = useRoute();
  const editTripProcessedRef = useRef(false);

  useEffect(() => {
    checkAuthentication();
    getLocationAndCurrency();
    animateScreen();
    loadSavedTrips();
  }, []);

  const checkAuthentication = async () => {
    try {
      const authData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!authData) {
        navigation.replace('Login');
        return;
      }
      const { isAuthenticated } = JSON.parse(authData);
      if (!isAuthenticated) {
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      navigation.replace('Login');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Handle edit trip params - pre-populate filters and open modal
  useFocusEffect(
    React.useCallback(() => {
      const editTrip = route.params?.editTrip;
      if (editTrip && !editTripProcessedRef.current) {
        // Pre-populate all filter fields
        setDestination(editTrip.destination || '');
        setBudget(editTrip.budget || 10000);
        setNumPeople(editTrip.numPeople || 2);
        setSelectedMoods(editTrip.moods || []);

        // Set dates
        if (editTrip.startDate) {
          const start = new Date(editTrip.startDate);
          setStartDate(start);
          setStartDateText(formatDateInput(start));
          setStartCalendarMonth(start.getMonth());
          setStartCalendarYear(start.getFullYear());
        }
        if (editTrip.endDate) {
          const end = new Date(editTrip.endDate);
          setEndDate(end);
          setEndDateText(formatDateInput(end));
          setEndCalendarMonth(end.getMonth());
          setEndCalendarYear(end.getFullYear());
        }

        // Open filters modal
        setShowFilters(true);

        // Mark as processed
        editTripProcessedRef.current = true;
      } else if (!editTrip) {
        // Reset the ref when there's no edit trip
        editTripProcessedRef.current = false;
      }
    }, [route.params?.editTrip])
  );

  // Reload trips when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSavedTrips();
    }, [])
  );

  // Set header right button (hamburger menu)
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerMenuContainer}>
          <TouchableOpacity
            style={styles.headerMenuButton}
            onPress={() => setShowMenuDropdown(prev => !prev)}
            activeOpacity={0.8}
          >
            <View style={styles.headerMenuIcon}>
              <View style={styles.headerMenuLine} />
              <View style={styles.headerMenuLine} />
              <View style={styles.headerMenuLine} />
            </View>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const loadSavedTrips = async () => {
    try {
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

  const animateScreen = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getLocationAndCurrency = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrency(CURRENCY_MAP.IN);
        setCountryCode('IN');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(location);

      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const country = geocode[0].isoCountryCode || 'IN';
        const city = geocode[0].city || geocode[0].subAdministrativeArea || geocode[0].name || '';
        setCountryCode(country);
        setUserCity(city);
        const userCurrency = getCurrencyFromCountry(country);
        setCurrency(userCurrency);

        // Set nearby destinations based on detected country
        const destinations = getNearbyDestinations(city, country);
        setNearbyDestinations(destinations);
      } else {
        setCurrency(CURRENCY_MAP.IN);
        setCountryCode('IN');
        setNearbyDestinations(getNearbyDestinations('', 'IN'));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setCurrency(CURRENCY_MAP.IN);
      setCountryCode('IN');
      setNearbyDestinations(getNearbyDestinations('', 'IN'));
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for date handling (formatDateInput already defined above)

  const parseDateInput = (dateString) => {
    if (!dateString) return new Date();
    const parts = dateString.split('-');
    if (parts.length !== 3) return new Date();
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };

  // Calendar helper functions
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = (month, year) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDateSelect = (day, isStartDate) => {
    if (!day) return;

    const month = isStartDate ? startCalendarMonth : endCalendarMonth;
    const year = isStartDate ? startCalendarYear : endCalendarYear;
    const selectedDate = new Date(year, month, day);

    if (isStartDate) {
      setStartDate(selectedDate);
      setStartDateText(formatDateInput(selectedDate));
      setShowStartDateDropdown(false);

      // Auto-adjust end date if needed
      if (selectedDate >= endDate) {
        const newEnd = new Date(selectedDate);
        newEnd.setDate(selectedDate.getDate() + 1);
        setEndDate(newEnd);
        setEndDateText(formatDateInput(newEnd));
        setEndCalendarMonth(newEnd.getMonth());
        setEndCalendarYear(newEnd.getFullYear());
      }
    } else {
      if (selectedDate > startDate) {
        setEndDate(selectedDate);
        setEndDateText(formatDateInput(selectedDate));
        setShowEndDateDropdown(false);
      } else {
        alert('End date must be after start date');
      }
    }
  };

  const changeMonth = (direction, isStartDate) => {
    if (isStartDate) {
      let newMonth = startCalendarMonth + direction;
      let newYear = startCalendarYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }

      setStartCalendarMonth(newMonth);
      setStartCalendarYear(newYear);
    } else {
      let newMonth = endCalendarMonth + direction;
      let newYear = endCalendarYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }

      setEndCalendarMonth(newMonth);
      setEndCalendarYear(newYear);
    }
  };

  const formatDate = (date) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDays = () => {
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 1;
    }
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end date
  };

  const handleMoodPress = (mood) => {
    if (selectedMoods.includes(mood.id)) {
      setSelectedMoods(selectedMoods.filter(id => id !== mood.id));
    } else {
      setSelectedMoods([...selectedMoods, mood.id]);
    }
  };

  const handleQuickFilterPress = (filterType) => {
    setShowFilters(true);
    if (filterType === 'weekend') {
      const today = new Date();
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + (6 - today.getDay()));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      setStartDate(saturday);
      setStartDateText(formatDateInput(saturday));
      setStartCalendarMonth(saturday.getMonth());
      setStartCalendarYear(saturday.getFullYear());
      setEndDate(sunday);
      setEndDateText(formatDateInput(sunday));
      setEndCalendarMonth(sunday.getMonth());
      setEndCalendarYear(sunday.getFullYear());
      setNumPeople(2);
      setSelectedMoods(['relaxing']);
    } else if (filterType === 'budget') {
      setBudget(10000);
      setSelectedMoods(['relaxing']);
    } else if (filterType === 'relaxing') {
      setSelectedMoods(['relaxing']);
    }
  };

  const handleSearch = () => {
    if (!destination.trim()) {
      alert('Please enter a destination (e.g., Lonavala, Mumbai, Goa)');
      return;
    }

    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert('Please select valid dates');
      return;
    }

    if (endDate <= startDate) {
      alert('End date must be after start date');
      return;
    }

    if (selectedMoods.length === 0) {
      setSelectedMoods(['relaxing']); // Default mood
    }

    setShowFilters(false);

    // Navigate to TripDetails with all filter data
    try {
      navigation.navigate('TripDetails', {
        filters: {
          destination: destination.trim(),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          budget: budget,
          numPeople: numPeople,
          days: calculateDays(),
          moods: selectedMoods.length > 0 ? selectedMoods : ['relaxing'],
          currency: currency.code,
        },
      });
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Error navigating. Please try again.');
    }
  };

  const handleDestinationSelect = (destinationName) => {
    setDestination(destinationName);
    setShowFilters(true);
  };

  const handleQuickSearch = () => {
    console.log('handleQuickSearch called - showFilters currently:', showFilters);
    setShowFilters(true);
    console.log('showFilters set to true');
    // Force a re-render check
    setTimeout(() => {
      console.log('After timeout, showFilters is:', showFilters);
    }, 100);
  };

  const handleContactSubmit = async () => {
    // Validate form
    if (!contactForm.name || !contactForm.email || !contactForm.concern) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      // In a real app, you would send this to your backend API
      // For now, we'll show a success message and log the form data
      console.log('Contact Form Submitted:', {
        ...contactForm,
        timestamp: new Date().toISOString(),
        recipientEmail: 'niddhisachdeowork@gmail.com'
      });

      Alert.alert(
        'Message Sent!',
        'Thank you for contacting us. We will get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setContactForm({ name: '', mobile: '', email: '', concern: '' });
              setShowContactModal(false);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again later.');
    }
  };

  const updateContactForm = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  // Scenic background image
  // To use your local scene.jpg image:
  // 1. In Expo Snack, click the "+" button to add a file
  // 2. Create a folder named "assets" (if it doesn't exist)
  // 3. Upload your scene.jpg file to the assets folder
  // 4. Then change the line below to: const backgroundImage = require('../assets/scene.jpg');

  // High-quality scenic background image for travel app
  const backgroundImage = {
    uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=95&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  };

  // After uploading scene.jpg to assets/ folder, uncomment this line and comment out the uri line above:
  // const backgroundImage = require('../assets/scene.jpg');

  return (
    <View style={styles.container}>
      {/* Menu Dropdown Modal */}
      <Modal
        visible={showMenuDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenuDropdown(false)}
      >
        <View style={styles.menuModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowMenuDropdown(false)}
          />
          <View style={styles.headerMenuDropdown}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenuDropdown(false);
                setTimeout(() => {
                  navigation.navigate('Profile');
                }, 100);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>👤</Text>
              <Text style={styles.menuItemText}>My Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenuDropdown(false);
                setTimeout(() => {
                  navigation.navigate('SavedTrips');
                }, 100);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>✈️</Text>
              <Text style={styles.menuItemText}>My Trips</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenuDropdown(false);
                setTimeout(() => {
                  handleLogout();
                }, 100);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={[styles.menuItemText, styles.menuItemLogout]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      >
        <View style={styles.overlayGradient}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.4)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </View>
      </ImageBackground>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        bounces={true}
        nestedScrollEnabled={true}
        alwaysBounceVertical={true}
      >
            {/* Modern Hero Section */}
            <Animated.View
              style={[
                styles.heroContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.heroContent}>

                <View
                  style={styles.heroBadge}
                >
                  <Text style={styles.heroBadgeText}>✨ Trips that match your vibe</Text>
                </View>

                <Text style={styles.heroTitle}>MoodMiles</Text>
                <Text style={styles.heroSubtitle}>
                  Trips that match your vibe
                </Text>
              </View>
            </Animated.View>

            {/* Modern CTA Button */}
            <Animated.View
              style={[
                styles.ctaWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.modernCtaButton}
                onPress={() => {
                  const newValue = !showFilters;
                  console.log('Button pressed! Setting showFilters to:', newValue);
                  setShowFilters(newValue);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.ctaGradient}>
                  <Text style={styles.ctaIcon}>✨</Text>
                  <Text style={styles.ctaText}>
                    {showFilters ? 'Close Filters' : (destination.trim() && selectedMoods.length > 0
                      ? 'Generate Itinerary'
                      : 'Plan My Trip')}
                  </Text>
                  <Text style={styles.ctaArrow}>→</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {/* Filters Section - Modal Popup */}
            <Modal
              visible={showFilters}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowFilters(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <ScrollView
                    style={styles.modalScrollView}
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={true}
                  >
                    <View ref={filtersRef} style={styles.modernFiltersContainer}>
                <View style={styles.modernFiltersHeader}>
                  <View>
                    <Text style={styles.modernFiltersTitle}>Plan Your Trip</Text>
                    <Text style={styles.modernFiltersSubtitle}>Create detailed itinerary</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Close button pressed');
                      setShowFilters(false);
                    }}
                    style={styles.modernCloseButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modernCloseIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Destination Input */}
                <View style={styles.modernFilterCard}>
                  <Text style={styles.modernFilterLabel}>📍 Destination</Text>
                  <Text style={styles.modernFilterDescription}>
                    Where do you want to go? (e.g., Lonavala, Mumbai, Goa)
                  </Text>
                  <TextInput
                    style={styles.destinationInput}
                    placeholder="Enter destination name"
                    placeholderTextColor="#9CA3AF"
                    value={destination}
                    onChangeText={setDestination}
                    autoCapitalize="words"
                  />
                </View>

                {/* Date Selection */}
                <View style={styles.modernFilterCard}>
                  <Text style={styles.modernFilterLabel}>📅 Travel Dates</Text>
                  <View style={styles.dateRow}>
                    <View style={styles.datePickerContainer}>
                      <Text style={styles.dateLabel}>Start Date</Text>
                      <TouchableOpacity
                        style={styles.datePickerBox}
                        onPress={() => {
                          if (!showStartDateDropdown) {
                            // Sync calendar view with current selected date
                            setStartCalendarMonth(startDate.getMonth());
                            setStartCalendarYear(startDate.getFullYear());
                          }
                          setShowStartDateDropdown(!showStartDateDropdown);
                          setShowEndDateDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.datePickerText}>
                          {formatDate(startDate)}
                        </Text>
                        <Text style={styles.datePickerArrow}>
                          {showStartDateDropdown ? '▲' : '▼'}
                        </Text>
                      </TouchableOpacity>
                      <Modal
                        visible={showStartDateDropdown}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setShowStartDateDropdown(false)}
                      >
                        <View style={styles.datePickerModalOverlay}>
                          <View style={styles.datePickerModalContent}>
                            <View style={styles.datePickerModalHeader}>
                              <Text style={styles.datePickerModalTitle}>Select Start Date</Text>
                              <TouchableOpacity
                                onPress={() => setShowStartDateDropdown(false)}
                                style={styles.datePickerModalClose}
                              >
                                <Text style={styles.datePickerModalCloseText}>×</Text>
                              </TouchableOpacity>
                            </View>

                            <View style={styles.calendarDropdownContainer}>
                              {/* Calendar Header */}
                              <View style={styles.calendarHeader}>
                                <TouchableOpacity
                                  onPress={() => changeMonth(-1, true)}
                                  style={styles.calendarNavButton}
                                >
                                  <Text style={styles.calendarNavText}>‹</Text>
                                </TouchableOpacity>
                                <Text style={styles.calendarMonthYear}>
                                  {new Date(startCalendarYear, startCalendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => changeMonth(1, true)}
                                  style={styles.calendarNavButton}
                                >
                                  <Text style={styles.calendarNavText}>›</Text>
                                </TouchableOpacity>
                              </View>

                              {/* Calendar Week Days */}
                              <View style={styles.calendarWeekDays}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                  <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
                                ))}
                              </View>

                              {/* Calendar Days Grid */}
                              <View style={styles.calendarDaysGrid}>
                                {generateCalendarDays(startCalendarMonth, startCalendarYear).map((day, index) => {
                                  if (day === null) {
                                    return <View key={`empty-${index}`} style={styles.calendarDayEmpty} />;
                                  }

                                  const cellDate = new Date(startCalendarYear, startCalendarMonth, day);
                                  const isToday = cellDate.toDateString() === new Date().toDateString();
                                  const isSelected = cellDate.toDateString() === startDate.toDateString();
                                  const isPast = cellDate < new Date().setHours(0, 0, 0, 0);

                                  return (
                                    <TouchableOpacity
                                      key={day}
                                      style={[
                                        styles.calendarDay,
                                        isSelected && styles.calendarDaySelected,
                                        isToday && !isSelected && styles.calendarDayToday,
                                        isPast && styles.calendarDayPast,
                                      ]}
                                      onPress={() => !isPast && handleDateSelect(day, true)}
                                      disabled={isPast}
                                    >
                                      <Text style={[
                                        styles.calendarDayText,
                                        isSelected && styles.calendarDayTextSelected,
                                        isPast && styles.calendarDayTextPast,
                                      ]}>
                                        {day}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            </View>
                          </View>
                        </View>
                      </Modal>
                    </View>

                    <Text style={styles.dateArrow}>→</Text>

                    <View style={styles.datePickerContainer}>
                      <Text style={styles.dateLabel}>End Date</Text>
                      <TouchableOpacity
                        style={styles.datePickerBox}
                        onPress={() => {
                          if (!showEndDateDropdown) {
                            // Sync calendar view with current selected date
                            setEndCalendarMonth(endDate.getMonth());
                            setEndCalendarYear(endDate.getFullYear());
                          }
                          setShowEndDateDropdown(!showEndDateDropdown);
                          setShowStartDateDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.datePickerText}>
                          {formatDate(endDate)}
                        </Text>
                        <Text style={styles.datePickerArrow}>
                          {showEndDateDropdown ? '▲' : '▼'}
                        </Text>
                      </TouchableOpacity>
                      <Modal
                        visible={showEndDateDropdown}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setShowEndDateDropdown(false)}
                      >
                        <View style={styles.datePickerModalOverlay}>
                          <View style={styles.datePickerModalContent}>
                            <View style={styles.datePickerModalHeader}>
                              <Text style={styles.datePickerModalTitle}>Select End Date</Text>
                              <TouchableOpacity
                                onPress={() => setShowEndDateDropdown(false)}
                                style={styles.datePickerModalClose}
                              >
                                <Text style={styles.datePickerModalCloseText}>×</Text>
                              </TouchableOpacity>
                            </View>

                            <View style={styles.calendarDropdownContainer}>
                              {/* Calendar Header */}
                              <View style={styles.calendarHeader}>
                                <TouchableOpacity
                                  onPress={() => changeMonth(-1, false)}
                                  style={styles.calendarNavButton}
                                >
                                  <Text style={styles.calendarNavText}>‹</Text>
                                </TouchableOpacity>
                                <Text style={styles.calendarMonthYear}>
                                  {new Date(endCalendarYear, endCalendarMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => changeMonth(1, false)}
                                  style={styles.calendarNavButton}
                                >
                                  <Text style={styles.calendarNavText}>›</Text>
                                </TouchableOpacity>
                              </View>

                              {/* Calendar Week Days */}
                              <View style={styles.calendarWeekDays}>
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                  <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
                                ))}
                              </View>

                              {/* Calendar Days Grid */}
                              <View style={styles.calendarDaysGrid}>
                                {generateCalendarDays(endCalendarMonth, endCalendarYear).map((day, index) => {
                                  if (day === null) {
                                    return <View key={`empty-${index}`} style={styles.calendarDayEmpty} />;
                                  }

                                  const cellDate = new Date(endCalendarYear, endCalendarMonth, day);
                                  const isToday = cellDate.toDateString() === new Date().toDateString();
                                  const isSelected = cellDate.toDateString() === endDate.toDateString();
                                  const isBeforeStart = cellDate <= startDate;

                                  return (
                                    <TouchableOpacity
                                      key={day}
                                      style={[
                                        styles.calendarDay,
                                        isSelected && styles.calendarDaySelected,
                                        isToday && !isSelected && styles.calendarDayToday,
                                        isBeforeStart && styles.calendarDayPast,
                                      ]}
                                      onPress={() => !isBeforeStart && handleDateSelect(day, false)}
                                      disabled={isBeforeStart}
                                    >
                                      <Text style={[
                                        styles.calendarDayText,
                                        isSelected && styles.calendarDayTextSelected,
                                        isBeforeStart && styles.calendarDayTextPast,
                                      ]}>
                                        {day}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            </View>
                          </View>
                        </View>
                      </Modal>
                    </View>
                  </View>
                  <Text style={styles.daysInfo}>
                    {calculateDays()} day{calculateDays() > 1 ? 's' : ''} trip
                  </Text>
                </View>


                {/* Budget Filter */}
                <View style={styles.modernFilterCard}>
                  <Text style={styles.modernFilterLabel}>💰 Budget</Text>
                  <Text style={styles.modernFilterDescription}>
                    Select your total budget
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={budget}
                      onValueChange={(itemValue) => setBudget(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label={`${currency.symbol}1,000`} value={1000} />
                      <Picker.Item label={`${currency.symbol}5,000`} value={5000} />
                      <Picker.Item label={`${currency.symbol}10,000`} value={10000} />
                      <Picker.Item label={`${currency.symbol}15,000`} value={15000} />
                      <Picker.Item label={`${currency.symbol}20,000`} value={20000} />
                      <Picker.Item label={`${currency.symbol}25,000`} value={25000} />
                      <Picker.Item label={`${currency.symbol}30,000`} value={30000} />
                      <Picker.Item label={`${currency.symbol}40,000`} value={40000} />
                      <Picker.Item label={`${currency.symbol}50,000`} value={50000} />
                      <Picker.Item label={`${currency.symbol}75,000`} value={75000} />
                      <Picker.Item label={`${currency.symbol}100,000+`} value={100000} />
                    </Picker>
                  </View>
                </View>

                {/* Number of People */}
                <View style={styles.modernFilterCard}>
                  <Text style={styles.modernFilterLabel}>👥 Number of People</Text>
                  <Text style={styles.modernFilterDescription}>
                    How many people are traveling?
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={numPeople}
                      onValueChange={(itemValue) => setNumPeople(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="1 person" value={1} />
                      <Picker.Item label="2 people" value={2} />
                      <Picker.Item label="3 people" value={3} />
                      <Picker.Item label="4 people" value={4} />
                      <Picker.Item label="5 people" value={5} />
                      <Picker.Item label="6 people" value={6} />
                      <Picker.Item label="7 people" value={7} />
                      <Picker.Item label="8 people" value={8} />
                      <Picker.Item label="9 people" value={9} />
                      <Picker.Item label="10 people" value={10} />
                    </Picker>
                  </View>
                </View>

                {/* Mood Selection */}
                <View style={styles.modernFilterCard}>
                  <Text style={styles.modernFilterLabel}>Select Your Mood</Text>
                  <Text style={styles.modernFilterDescription}>
                    Choose one or more moods that match your vibe
                  </Text>
                  <View style={styles.modernMoodGrid}>
                    {moods.map((mood) => {
                      const isSelected = selectedMoods.includes(mood.id);
                      return (
                        <TouchableOpacity
                          key={mood.id}
                          style={[
                            styles.modernFilterMoodCard,
                            isSelected && styles.modernFilterMoodCardSelected,
                          ]}
                          onPress={() => handleMoodPress(mood)}
                          activeOpacity={0.8}
                        >
                          {isSelected ? (
                            <LinearGradient
                              colors={mood.gradient}
                              style={styles.filterMoodGradient}
                            >
                              <Text style={styles.modernFilterMoodEmoji}>{mood.emoji}</Text>
                              <Text style={styles.modernFilterMoodLabelSelected}>{mood.label}</Text>
                            </LinearGradient>
                          ) : (
                            <>
                              <Text style={styles.modernFilterMoodEmoji}>{mood.emoji}</Text>
                              <Text style={styles.modernFilterMoodLabel}>{mood.label}</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Generate Button */}
                <TouchableOpacity
                  style={styles.modernSearchButton}
                  onPress={handleSearch}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.searchButtonGradient}
                  >
                    <Text style={styles.modernSearchButtonText}>
                      {destination.trim()
                        ? `Generate Itinerary for ${destination}`
                        : 'Enter destination to generate itinerary'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Destinations Modal */}
            <Modal
              visible={showDestinationsModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowDestinationsModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <ScrollView
                    style={styles.modalScrollView}
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={true}
                  >
                    <View style={styles.modernFiltersContainer}>
                      <View style={styles.modernFiltersHeader}>
                        <View>
                          <Text style={styles.modernFiltersTitle}>Popular Destinations</Text>
                          <Text style={styles.modernFiltersSubtitle}>Discover amazing places to visit</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setShowDestinationsModal(false)}
                          style={styles.modernCloseButton}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.modernCloseIcon}>✕</Text>
                        </TouchableOpacity>
                      </View>

                      {/* All Destinations Grid */}
                      <View style={styles.allDestinationsGrid}>
                        {getAllPopularDestinations().map((destination) => (
                          <TouchableOpacity
                            key={destination.id}
                            style={styles.destinationModalCard}
                            onPress={() => {
                              handleDestinationSelect(destination.name);
                              setShowDestinationsModal(false);
                              setShowFilters(true);
                            }}
                            activeOpacity={0.8}
                          >
                            <ImageBackground
                              source={{ uri: destination.image }}
                              style={styles.destinationModalImage}
                              imageStyle={styles.destinationModalImageStyle}
                            >
                              <LinearGradient
                                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                                style={styles.destinationModalOverlay}
                              >
                                <View style={styles.destinationModalInfo}>
                                  <Text style={styles.destinationModalName}>{destination.name}</Text>
                                  <Text style={styles.destinationModalDistance}>{destination.distance}</Text>
                                  <Text style={styles.destinationModalDescription}>{destination.description}</Text>
                                </View>
                              </LinearGradient>
                            </ImageBackground>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Action Button */}
                      <TouchableOpacity
                        style={styles.modernSearchButton}
                        onPress={() => {
                          setShowDestinationsModal(false);
                          setShowFilters(true);
                        }}
                        activeOpacity={0.9}
                      >
                        <LinearGradient
                          colors={['#10B981', '#059669']}
                          style={styles.searchButtonGradient}
                        >
                          <Text style={styles.modernSearchButtonText}>
                            Plan Your Trip
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Contact Us Modal */}
            <Modal
              visible={showContactModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowContactModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <ScrollView
                    style={styles.modalScrollView}
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={true}
                  >
                    <View style={styles.modernFiltersContainer}>
                      <View style={styles.modernFiltersHeader}>
                        <View>
                          <Text style={styles.modernFiltersTitle}>Contact Us</Text>
                          <Text style={styles.modernFiltersSubtitle}>We'd love to hear from you!</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setShowContactModal(false)}
                          style={styles.modernCloseButton}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.modernCloseIcon}>✕</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Name Input */}
                      <View style={styles.modernFilterCard}>
                        <Text style={styles.modernFilterLabel}>👤 Full Name *</Text>
                        <TextInput
                          style={styles.destinationInput}
                          placeholder="Enter your full name"
                          placeholderTextColor="#9CA3AF"
                          value={contactForm.name}
                          onChangeText={(text) => updateContactForm('name', text)}
                          autoCapitalize="words"
                        />
                      </View>

                      {/* Mobile Number */}
                      <View style={styles.modernFilterCard}>
                        <Text style={styles.modernFilterLabel}>📱 Mobile Number</Text>
                        <TextInput
                          style={styles.destinationInput}
                          placeholder="Enter your mobile number"
                          placeholderTextColor="#9CA3AF"
                          value={contactForm.mobile}
                          onChangeText={(text) => updateContactForm('mobile', text)}
                          keyboardType="phone-pad"
                        />
                      </View>

                      {/* Email */}
                      <View style={styles.modernFilterCard}>
                        <Text style={styles.modernFilterLabel}>📧 Email Address *</Text>
                        <TextInput
                          style={styles.destinationInput}
                          placeholder="Enter your email address"
                          placeholderTextColor="#9CA3AF"
                          value={contactForm.email}
                          onChangeText={(text) => updateContactForm('email', text)}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>

                      {/* Concern */}
                      <View style={styles.modernFilterCard}>
                        <Text style={styles.modernFilterLabel}>💭 Your Message *</Text>
                        <Text style={styles.modernFilterDescription}>
                          Tell us about your question, suggestion, or how we can help you
                        </Text>
                        <TextInput
                          style={[styles.destinationInput, styles.concernInput]}
                          placeholder="Type your message here..."
                          placeholderTextColor="#9CA3AF"
                          value={contactForm.concern}
                          onChangeText={(text) => updateContactForm('concern', text)}
                          multiline={true}
                          numberOfLines={4}
                          textAlignVertical="top"
                        />
                      </View>

                      {/* Send Button */}
                      <TouchableOpacity
                        style={styles.modernSearchButton}
                        onPress={handleContactSubmit}
                        activeOpacity={0.9}
                      >
                        <LinearGradient
                          colors={['#10B981', '#059669']}
                          style={styles.searchButtonGradient}
                        >
                          <Text style={styles.modernSearchButtonText}>
                            Send Message
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <Text style={styles.contactFormNote}>
                        * Required fields. We'll get back to you within 24 hours.
                      </Text>
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Nearby Destinations */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {userCity ? `Near ${userCity}` : 'Popular Destinations'}
                </Text>
                <TouchableOpacity
                  style={styles.sectionBadge}
                  activeOpacity={0.8}
                  onPress={() => setShowDestinationsModal(true)}
                >
                  <Text style={styles.sectionBadgeText}>Explore</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.destinationsGrid}>
                {nearbyDestinations && nearbyDestinations.length > 0 ? nearbyDestinations.map((destination) => (
                  <TouchableOpacity
                    key={destination.id}
                    style={styles.destinationCard}
                    onPress={() => handleDestinationSelect(destination.name)}
                    activeOpacity={0.8}
                  >
                    <ImageBackground
                      source={{ uri: destination.image }}
                      style={styles.destinationImage}
                      imageStyle={styles.destinationImageStyle}
                    >
                      <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
                        style={styles.destinationOverlay}
                      >
                        <View style={styles.destinationInfo}>
                          <Text style={styles.destinationName}>{destination.name}</Text>
                          <Text style={styles.destinationDistance}>{destination.distance}</Text>
                          <Text style={styles.destinationDescription}>{destination.description}</Text>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </TouchableOpacity>
                )) : (
                  <View style={styles.emptyDestinationsContainer}>
                    <Text style={styles.emptyDestinationsText}>
                      Loading nearby destinations based on your location...
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Mood Selection */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>What's Your Mood?</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowFilters(true)}
                >
                  <Text style={styles.sectionHint}>Tap to select →</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.moodScrollContent}
              >
                {moods.map((mood) => {
                  const isSelected = selectedMoods.includes(mood.id);
                  return (
                    <TouchableOpacity
                      key={mood.id}
                      style={[
                        styles.modernMoodCard,
                        isSelected && styles.modernMoodCardSelected,
                      ]}
                      onPress={() => handleMoodPress(mood)}
                      activeOpacity={0.8}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={mood.gradient}
                          style={styles.moodGradient}
                        >
                          <Text style={styles.modernMoodEmoji}>{mood.emoji}</Text>
                          <Text style={styles.modernMoodLabelSelected}>{mood.label}</Text>
                          <Text style={styles.selectedBadge}>✓</Text>
                        </LinearGradient>
                      ) : (
                        <View style={styles.moodCardContent}>
                          <View style={styles.moodIconContainer}>
                            <Text style={styles.modernMoodEmoji}>{mood.emoji}</Text>
                          </View>
                          <Text style={styles.modernMoodLabel}>{mood.label}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {selectedMoods.length > 0 && (
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={() => setShowFilters(true)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.continueButtonText}>
                    Continue with {selectedMoods.length} mood{selectedMoods.length > 1 ? 's' : ''} →
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Saved Trips */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Trips</Text>
                {savedTrips.length > 0 && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('SavedTrips')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.seeAllText}>See All →</Text>
                  </TouchableOpacity>
                )}
              </View>

              {savedTrips.length === 0 ? (
                <TouchableOpacity
                  style={styles.modernEmptyState}
                  onPress={() => setShowFilters(true)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                    style={styles.emptyStateGradient}
                  >
                    <View style={styles.emptyStateIconContainer}>
                      <Text style={styles.emptyStateEmoji}>✈️</Text>
                    </View>
                    <Text style={styles.modernEmptyStateTitle}>No trips saved yet</Text>
                    <Text style={styles.modernEmptyStateText}>
                      Start planning your first trip and create amazing memories!
                    </Text>
                    <View style={styles.modernEmptyStateButton}>
                      <Text style={styles.modernEmptyStateButtonText}>Get Started →</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tripsScrollContent}
                >
                  {savedTrips.slice(0, 3).map((trip) => {
                    const startDate = new Date(trip.startDate);
                    const endDate = new Date(trip.endDate);
                    const formatDate = (date) => {
                      return date.toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short'
                      });
                    };

                    return (
                      <View key={trip.id} style={styles.modernTripCardWrapper}>
                        <TouchableOpacity
                          style={styles.modernTripCard}
                          onPress={() => {
                            // Reload the trip with original filters
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
                                <Text style={styles.modernTripDestination}>{trip.destination}</Text>
                                <Text style={styles.modernTripDistance}>
                                  {formatDate(startDate)} - {formatDate(endDate)}
                                </Text>
                                <View style={styles.modernTripFooter}>
                                  <Text style={styles.modernTripBudget}>
                                    {trip.currency || currency.symbol}{trip.budget?.toLocaleString() || '0'}
                                  </Text>
                                  <Text style={styles.modernTripDays}>{trip.days} days</Text>
                                </View>
                              </View>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteTripButton}
                          onPress={() => handleDeleteTrip(trip.id, trip.destination)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.deleteTripIcon}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Features Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Why MoodMiles?</Text>
                <Text style={styles.sectionSubtitle}>Trips that match your vibe</Text>
              </View>
              <View style={styles.modernFeaturesGrid}>
                <View style={styles.modernFeatureCard}>
                  <View style={styles.modernFeatureIcon}>
                    <Text style={styles.modernFeatureEmoji}>🎯</Text>
                  </View>
                  <Text style={styles.modernFeatureTitle}>Smart Filters</Text>
                  <Text style={styles.modernFeatureDescription}>
                    Filter by budget, mood, and days off
                  </Text>
                </View>

                <View style={styles.modernFeatureCard}>
                  <View style={styles.modernFeatureIcon}>
                    <Text style={styles.modernFeatureEmoji}>📍</Text>
                  </View>
                  <Text style={styles.modernFeatureTitle}>Location-Based</Text>
                  <Text style={styles.modernFeatureDescription}>
                    Discover nearby destinations
                  </Text>
                </View>

                <View style={styles.modernFeatureCard}>
                  <View style={styles.modernFeatureIcon}>
                    <Text style={styles.modernFeatureEmoji}>💰</Text>
                  </View>
                  <Text style={styles.modernFeatureTitle}>Budget-Conscious</Text>
                  <Text style={styles.modernFeatureDescription}>
                    See cost breakdowns in {currency.code}
                  </Text>
                </View>

                <View style={styles.modernFeatureCard}>
                  <View style={styles.modernFeatureIcon}>
                    <Text style={styles.modernFeatureEmoji}>📅</Text>
                  </View>
                  <Text style={styles.modernFeatureTitle}>Time-Optimized</Text>
                  <Text style={styles.modernFeatureDescription}>
                    Perfect itineraries
                  </Text>
                </View>
              </View>
            </View>

            {/* Contact Us Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Get in Touch</Text>
                <Text style={styles.sectionSubtitle}>We'd love to hear from you</Text>
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactDescription}>
                  Have questions, suggestions, or need help planning your perfect trip? Our team is here to assist you!
                </Text>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => setShowContactModal(true)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.contactButtonGradient}
                  >
                    <Text style={styles.contactButtonIcon}>💬</Text>
                    <Text style={styles.contactButtonText}>Contact Us</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <View style={styles.contactInfo}>
                  <View style={styles.contactItem}>
                    <Text style={styles.contactEmoji}>⏰</Text>
                    <Text style={styles.contactText}>24/7 Support Available</Text>
                  </View>
                </View>
              </View>
            </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  overlayGradient: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingBottom: 150,
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    minHeight: height * 2.5,
  },
  heroContainer: {
    marginBottom: -20,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    paddingBottom: 30,
    paddingHorizontal: 25,
    position: 'relative',
    width: '100%',
  },
  headerMenuContainer: {
    position: 'relative',
    marginRight: 10,
  },
  headerMenuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  headerMenuIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  headerMenuLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
    marginVertical: 2.5,
  },
  headerMenuDropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  menuItemLogout: {
    color: '#EF4444',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 25,
    textAlign: 'center',
    opacity: 0.95,
    fontWeight: '400',
    lineHeight: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  currencyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 25,
    padding: 16,
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  currencyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 4,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  refreshIcon: {
    fontSize: 18,
    color: '#fff',
  },
  currencyCardText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  ctaWrapper: {
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  modernCtaButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    alignSelf: 'center',
    maxWidth: 280,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#000',
  },
  ctaIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  ctaText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ctaArrow: {
    color: '#fff',
    fontSize: 24,
    marginLeft: 12,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 25,
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sectionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  sectionHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  seeAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  destinationCard: {
    width: '48%',
    height: 200,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationImageStyle: {
    borderRadius: 20,
  },
  destinationOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  destinationInfo: {
    alignItems: 'flex-start',
  },
  destinationName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  destinationDistance: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 6,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  destinationDescription: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.95,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  allDestinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  destinationModalCard: {
    width: '48%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 12,
  },
  destinationModalImage: {
    width: '100%',
    height: '100%',
  },
  destinationModalImageStyle: {
    borderRadius: 16,
  },
  destinationModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  destinationModalInfo: {
    alignItems: 'flex-start',
  },
  destinationModalName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  destinationModalDistance: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  destinationModalDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.95,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  contactContent: {
    alignItems: 'center',
  },
  contactDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  contactButton: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  contactButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  contactInfo: {
    alignItems: 'center',
    gap: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contactEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  contactText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  concernInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  contactFormNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  moodScrollContent: {
    paddingRight: 25,
  },
  modernMoodCard: {
    marginRight: 12,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modernMoodCardSelected: {
    shadowColor: '#10B981',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  moodGradient: {
    padding: 20,
    alignItems: 'center',
    minWidth: 110,
    position: 'relative',
  },
  moodCardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    alignItems: 'center',
    minWidth: 110,
  },
  moodIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modernMoodEmoji: {
    fontSize: 34,
  },
  modernMoodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modernMoodLabelSelected: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: 'center',
    lineHeight: 26,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 16,
    borderRadius: 18,
    marginTop: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  modernFiltersContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 0,
    marginBottom: 0,
    marginTop: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    minHeight: 300,
    width: '100%',
    alignSelf: 'center',
  },
  modernFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  modernFiltersTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  modernFiltersSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  modernCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernCloseIcon: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  modernFilterCard: {
    marginBottom: 28,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modernFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modernFilterLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modernFilterValueContainer: {
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
  },
  modernFilterValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  modernSlider: {
    width: '100%',
    height: 8,
  },
  modernSliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modernSliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  modernFilterDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 22,
  },
  destinationInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginTop: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  datePickerContainer: {
    flex: 1,
  },
  datePickerBox: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  datePickerText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
  },
  datePickerArrow: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  calendarDropdownContainer: {
    backgroundColor: '#fff',
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavText: {
    fontSize: 20,
    color: '#111827',
    fontWeight: 'bold',
  },
  calendarMonthYear: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 8,
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  calendarDayEmpty: {
    width: '14.28%',
    height: 44,
  },
  calendarDay: {
    width: '14.28%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 4,
  },
  calendarDayToday: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  calendarDaySelected: {
    backgroundColor: '#10B981',
  },
  calendarDayPast: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  calendarDayTextPast: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    marginTop: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  dateArrow: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
  },
  daysInfo: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  budgetHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  modernMoodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  modernFilterMoodCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  modernFilterMoodCardSelected: {
    borderWidth: 0,
    overflow: 'hidden',
  },
  filterMoodGradient: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  modernFilterMoodEmoji: {
    fontSize: 34,
    marginBottom: 10,
  },
  modernFilterMoodLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  modernFilterMoodLabelSelected: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  modernSearchButton: {
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  searchButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  modernSearchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modernEmptyState: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: 55,
    alignItems: 'center',
  },
  emptyStateIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emptyStateEmoji: {
    fontSize: 55,
  },
  modernEmptyStateTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modernEmptyStateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
    maxWidth: 300,
  },
  modernEmptyStateButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modernEmptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  tripsScrollContent: {
    paddingRight: 25,
  },
  modernTripCardWrapper: {
    marginRight: 15,
    position: 'relative',
  },
  modernTripCard: {
    width: 250,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  tripCardGradient: {
    padding: 28,
    minHeight: 190,
    justifyContent: 'space-between',
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tripCardContent: {
    flex: 1,
  },
  deleteTripButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  deleteTripIcon: {
    fontSize: 18,
  },
  modernTripDestination: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 10,
  },
  modernTripDistance: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 24,
  },
  modernTripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  modernTripBudget: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
  },
  modernTripDays: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '600',
  },
  modernFeaturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  modernFeatureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 28,
    borderRadius: 28,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  modernFeatureIcon: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  modernFeatureEmoji: {
    fontSize: 34,
  },
  modernFeatureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  modernFeatureDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalScrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  datePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  datePickerModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  datePickerModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModalCloseText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  datePickerModalButtons: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  datePickerModalButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  datePickerModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDestinationsContainer: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDestinationsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});