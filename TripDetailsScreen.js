import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share } from 'react-native';

// Currency mapping
const CURRENCY_MAP = {
  USD: { symbol: '$', name: 'US Dollar' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  DEFAULT: { symbol: '₹', name: 'Indian Rupee' },
};

// Location-specific money saving tips
const getMoneySavingTips = (destination, mainCity) => {
  const dest = (destination || '').toLowerCase().trim();
  const city = (mainCity || dest).toLowerCase().trim();

  // Goa-specific tips
  if (dest.includes('goa') || city.includes('goa')) {
    return [
      '✔ Rent a scooter/bike instead of taxis - much cheaper for exploring beaches.',
      '✔ Eat at local shacks and beachside cafes - authentic Goan food at great prices.',
      '✔ Buy alcohol from local wine shops, not restaurants - save 50% on drinks.',
      '✔ Visit free beaches like Anjuna, Baga, Calangute - no entry fees.',
      '✔ Shop at Mapusa Market for souvenirs - better prices than tourist shops.',
      '✔ Stay in North Goa for budget options or South Goa for quieter, affordable stays.',
    ];
  }

  // Rajasthan-specific tips
  if (dest.includes('rajasthan') || city.includes('jaipur') || city.includes('udaipur') || city.includes('jodhpur') || city.includes('jaisalmer')) {
    return [
      '✔ Use auto-rickshaws or shared buses for local transport - very affordable.',
      '✔ Eat at local dhabas and street food stalls - authentic Rajasthani cuisine at low prices.',
      '✔ Buy handicrafts directly from artisans in markets - avoid middlemen.',
      '✔ Visit monuments early morning or late evening - better lighting and fewer crowds.',
      '✔ Stay in heritage havelis converted to hotels - unique experience, reasonable prices.',
      '✔ Carry water bottles and snacks - saves money on tourist site vendors.',
    ];
  }

  // Kerala-specific tips
  if (dest.includes('kerala') || city.includes('kochi') || city.includes('munnar') || city.includes('alleppey')) {
    return [
      '✔ Use local buses and ferries for transport - scenic and budget-friendly.',
      '✔ Eat at local toddy shops and small restaurants - authentic Kerala food.',
      '✔ Book houseboats in advance during off-season - better rates.',
      '✔ Visit spice plantations and tea gardens - many offer free tours.',
      '✔ Stay in homestays instead of hotels - authentic experience, lower cost.',
      '✔ Buy spices and tea directly from plantations - better quality and prices.',
    ];
  }

  // Mumbai-specific tips
  if (dest.includes('mumbai') || city.includes('mumbai')) {
    return [
      '✔ Use local trains and BEST buses - cheapest way to travel Mumbai.',
      '✔ Eat at street food stalls and local restaurants - vada pav, pav bhaji are budget-friendly.',
      '✔ Visit free attractions like Marine Drive, Gateway of India, Juhu Beach.',
      '✔ Shop at Colaba Causeway and Linking Road - bargain for better prices.',
      '✔ Stay in suburbs like Andheri or Bandra - more affordable than South Mumbai.',
      '✔ Use ride-sharing apps during off-peak hours - better rates.',
    ];
  }

  // Delhi-specific tips
  if (dest.includes('delhi') || city.includes('delhi') || city.includes('new delhi')) {
    return [
      '✔ Use Delhi Metro - cheapest and fastest way to travel.',
      '✔ Eat at Old Delhi street food stalls - parathas, chaat at great prices.',
      '✔ Visit free attractions like India Gate, Lotus Temple, Lodhi Gardens.',
      '✔ Shop at Sarojini Nagar and Janpath - bargain for best deals.',
      '✔ Stay in Paharganj or Karol Bagh - budget-friendly accommodation options.',
      '✔ Use auto-rickshaws with meters or negotiate fares upfront.',
    ];
  }

  // Dubai-specific tips
  if (dest.includes('dubai') || city.includes('dubai')) {
    return [
      '✔ Use Dubai Metro and buses - cost-effective public transport.',
      '✔ Eat at local restaurants in Deira and Bur Dubai - authentic and affordable.',
      '✔ Visit free attractions like Dubai Fountain, JBR Beach, Dubai Marina.',
      '✔ Shop at Gold Souk and Spice Souk - bargain for better prices.',
      '✔ Stay in Deira or Bur Dubai - more budget-friendly than Downtown.',
      '✔ Book activities and tours online in advance - better deals than walk-in.',
    ];
  }

  // Generic tips for other locations
  return [
    '✔ Cook light meals/snacks at accommodation if kitchen is available.',
    '✔ Visit free/low-cost attractions and parks first.',
    '✔ Use public transport or shared vehicles instead of private taxis.',
    '✔ Buy local snacks and souvenirs from markets, not tourist shops.',
    '✔ Eat at local restaurants and street food stalls - authentic and affordable.',
    '✔ Book accommodation in advance and compare prices online.',
  ];
};

// Location-specific accommodation data
// Generate generic accommodations for any destination
const generateGenericAccommodations = (destination, perPersonBudget) => {
  const destName = destination.split(',')[0].trim(); // Get main city name
  const encodedDest = encodeURIComponent(destination);
  return [
    {
      name: `Luxury Hotel - ${destName}`,
      type: 'Hotel',
      location: 'City Center',
      price: perPersonBudget * 0.9,
      rating: 4.7,
      bookingLink: `https://www.booking.com/searchresults.html?ss=${encodedDest}`,
      googleMaps: `https://maps.google.com/?q=${encodedDest}`,
    },
    {
      name: `Boutique Hotel - ${destName}`,
      type: 'Hotel',
      location: 'Downtown Area',
      price: perPersonBudget * 0.75,
      rating: 4.5,
      bookingLink: `https://www.booking.com/searchresults.html?ss=${encodedDest}`,
      googleMaps: `https://maps.google.com/?q=${encodedDest}`,
    },
    {
      name: `Resort - ${destName}`,
      type: 'Resort',
      location: 'Scenic Location',
      price: perPersonBudget * 0.8,
      rating: 4.6,
      bookingLink: `https://www.booking.com/searchresults.html?ss=${encodedDest}`,
      googleMaps: `https://maps.google.com/?q=${encodedDest}+resort`,
    },
    {
      name: `Airbnb - ${destName}`,
      type: 'Airbnb',
      location: 'Residential Area',
      price: perPersonBudget * 0.6,
      rating: 4.4,
      bookingLink: `https://www.airbnb.com/s/${encodedDest}`,
      googleMaps: `https://maps.google.com/?q=${encodedDest}`,
    },
    {
      name: `Budget Hotel - ${destName}`,
      type: 'Hotel',
      location: 'City Area',
      price: perPersonBudget * 0.5,
      rating: 4.2,
      bookingLink: `https://www.booking.com/searchresults.html?ss=${encodedDest}`,
      googleMaps: `https://maps.google.com/?q=${encodedDest}`,
    },
    {
      name: `Apartment Rental - ${destName}`,
      type: 'Apartment',
      location: 'Central Location',
      price: perPersonBudget * 0.65,
      rating: 4.3,
      bookingLink: `https://www.booking.com/searchresults.html?ss=${encodedDest}`,
      googleMaps: `https://maps.google.com/?q=${encodedDest}`,
    },
  ];
};

const getAccommodations = (destination, days, numPeople, budget, currency) => {
  const perPersonBudget = budget / numPeople;
  // Normalize destination - handle country names, city names, and variations
  const dest = destination.toLowerCase().trim();
  // Extract main city/country name (before comma if exists)
  const mainDest = dest.split(',')[0].trim();

  // Comprehensive accommodations database
  const accommodations = {
    'goa': [
      {
        name: 'Taj Exotica Resort & Spa',
        type: 'Resort',
        location: 'Benaulim Beach',
        price: perPersonBudget * 0.9,
        rating: 4.8,
        bookingLink: 'https://www.tajhotels.com/en-in/taj/taj-exotica-goa/',
        googleMaps: 'https://maps.google.com/?q=Taj+Exotica+Goa',
      },
      {
        name: 'Beach Villa Airbnb - Calangute',
        type: 'Airbnb',
        location: 'Calangute Beach',
        price: perPersonBudget * 0.6,
        rating: 4.6,
        bookingLink: 'https://www.airbnb.com/rooms/plus/calangute-beach-villa-goa',
        googleMaps: 'https://maps.google.com/?q=Calangute+Beach+Goa',
      },
      {
        name: 'The Leela Goa',
        type: 'Resort',
        location: 'Cavelossim Beach',
        price: perPersonBudget * 0.85,
        rating: 4.7,
        bookingLink: 'https://www.theleela.com/hotels-in-goa/the-leela-goa/',
        googleMaps: 'https://maps.google.com/?q=Leela+Goa',
      },
      {
        name: 'Luxury Villa - Anjuna',
        type: 'Villa',
        location: 'Anjuna',
        price: perPersonBudget * 0.7,
        rating: 4.5,
        bookingLink: 'https://www.booking.com/hotel/in/luxury-villa-anjuna-goa.html',
        googleMaps: 'https://maps.google.com/?q=Anjuna+Goa',
      },
      {
        name: 'Hotel Park Hyatt Goa',
        type: 'Hotel',
        location: 'Arossim Beach',
        price: perPersonBudget * 0.8,
        rating: 4.6,
        bookingLink: 'https://www.hyatt.com/en-US/hotel/india/park-hyatt-goa-resort-and-spa/goap',
        googleMaps: 'https://maps.google.com/?q=Park+Hyatt+Goa',
      },
      {
        name: 'Budget Hotel - Baga',
        type: 'Hotel',
        location: 'Baga Beach',
        price: perPersonBudget * 0.5,
        rating: 4.2,
        bookingLink: 'https://www.booking.com/hotel/in/baga-beach-resort.html',
        googleMaps: 'https://maps.google.com/?q=Baga+Beach+Goa',
      },
    ],
    'lonavala': [
      {
        name: 'StayMaticc Villas – Near Bhushi Dam',
        type: 'Villa',
        location: 'Near Bhushi Dam / Misty Meadow',
        price: perPersonBudget * 0.7,
        rating: 4.5,
        bookingLink: 'https://www.booking.com/hotel/in/staymaticc-villas-lonavala.html',
        googleMaps: 'https://maps.google.com/?q=Bhushi+Dam+Lonavala',
      },
      {
        name: 'Aqua Villa Luxury Home Stay',
        type: 'Villa',
        location: 'Tungarli',
        price: perPersonBudget * 0.8,
        rating: 4.7,
        bookingLink: 'https://www.booking.com/hotel/in/aqua-villa-luxury-home-stay-lonavala.html',
        googleMaps: 'https://maps.google.com/?q=Tungarli+Lonavala',
      },
      {
        name: 'Tara - The Luxe Villa Lonavala',
        type: 'Villa',
        location: 'Peaceful location',
        price: perPersonBudget * 0.9,
        rating: 4.6,
        bookingLink: 'https://www.booking.com/hotel/in/tara-the-luxe-villa-lonavala.html',
        googleMaps: 'https://maps.google.com/?q=Luxury+Villa+Lonavala',
      },
      {
        name: 'Deena Villa',
        type: 'Villa',
        location: 'Spacious option',
        price: perPersonBudget * 0.65,
        rating: 4.4,
        bookingLink: 'https://www.booking.com/hotel/in/deena-villa-lonavala.html',
        googleMaps: 'https://maps.google.com/?q=Deena+Villa+Lonavala',
      },
      {
        name: 'Matoshri Villa',
        type: 'Villa',
        location: 'Central area',
        price: perPersonBudget * 0.7,
        rating: 4.5,
        bookingLink: 'https://www.booking.com/hotel/in/matoshri-villa-lonavala.html',
        googleMaps: 'https://maps.google.com/?q=Matoshri+Villa+Lonavala',
      },
    ],
    'mumbai': [
      {
        name: 'Taj Mahal Palace',
        type: 'Hotel',
        location: 'Colaba',
        price: perPersonBudget * 0.9,
        rating: 4.8,
        bookingLink: 'https://www.tajhotels.com/en-in/taj/taj-mahal-palace-mumbai/',
        googleMaps: 'https://maps.google.com/?q=Taj+Mahal+Palace+Mumbai',
      },
      {
        name: 'Luxury Apartment Airbnb - Bandra',
        type: 'Airbnb',
        location: 'Bandra West',
        price: perPersonBudget * 0.6,
        rating: 4.5,
        bookingLink: 'https://www.airbnb.com/rooms/plus/luxury-apartment-bandra-mumbai',
        googleMaps: 'https://maps.google.com/?q=Bandra+Mumbai',
      },
      {
        name: 'The Oberoi Mumbai',
        type: 'Hotel',
        location: 'Nariman Point',
        price: perPersonBudget * 0.85,
        rating: 4.7,
        bookingLink: 'https://www.oberoihotels.com/hotels-in-mumbai',
        googleMaps: 'https://maps.google.com/?q=Oberoi+Mumbai',
      },
      {
        name: 'Budget Hotel - Andheri',
        type: 'Hotel',
        location: 'Andheri East',
        price: perPersonBudget * 0.5,
        rating: 4.0,
        bookingLink: 'https://www.booking.com/hotel/in/budget-hotel-andheri-mumbai.html',
        googleMaps: 'https://maps.google.com/?q=Andheri+Mumbai',
      },
    ],
    // Removed hardcoded Pune data - using generateGenericAccommodations instead
    'kerala': [
      {
        name: 'Backwater Resort - Alleppey',
        type: 'Resort',
        location: 'Alleppey',
        price: perPersonBudget * 0.8,
        rating: 4.7,
        bookingLink: 'https://www.booking.com/hotel/in/backwater-resort-alleppey-kerala.html',
        googleMaps: 'https://maps.google.com/?q=Alleppey+Kerala',
      },
      {
        name: 'Tree House Resort - Munnar',
        type: 'Resort',
        location: 'Munnar',
        price: perPersonBudget * 0.75,
        rating: 4.6,
        bookingLink: 'https://www.booking.com/hotel/in/tree-house-resort-munnar-kerala.html',
        googleMaps: 'https://maps.google.com/?q=Munnar+Kerala',
      },
      {
        name: 'Beach Resort - Kovalam',
        type: 'Resort',
        location: 'Kovalam',
        price: perPersonBudget * 0.7,
        rating: 4.5,
        bookingLink: 'https://www.booking.com/hotel/in/beach-resort-kovalam-kerala.html',
        googleMaps: 'https://maps.google.com/?q=Kovalam+Kerala',
      },
    ],
    // Philippines destinations
    'philippines': generateGenericAccommodations('Philippines', perPersonBudget),
    'manila': generateGenericAccommodations('Manila, Philippines', perPersonBudget),
    'boracay': generateGenericAccommodations('Boracay, Philippines', perPersonBudget),
    'palawan': generateGenericAccommodations('Palawan, Philippines', perPersonBudget),
    'cebu': generateGenericAccommodations('Cebu, Philippines', perPersonBudget),
    // Dubai destinations
    'dubai': generateGenericAccommodations('Dubai, UAE', perPersonBudget),
    // Thailand destinations
    'thailand': generateGenericAccommodations('Thailand', perPersonBudget),
    'bangkok': generateGenericAccommodations('Bangkok, Thailand', perPersonBudget),
    'phuket': generateGenericAccommodations('Phuket, Thailand', perPersonBudget),
    'chiang mai': generateGenericAccommodations('Chiang Mai, Thailand', perPersonBudget),
    // Singapore
    'singapore': generateGenericAccommodations('Singapore', perPersonBudget),
    // Malaysia
    'malaysia': generateGenericAccommodations('Malaysia', perPersonBudget),
    'kuala lumpur': generateGenericAccommodations('Kuala Lumpur, Malaysia', perPersonBudget),
    'langkawi': generateGenericAccommodations('Langkawi, Malaysia', perPersonBudget),
    // Indonesia
    'indonesia': generateGenericAccommodations('Indonesia', perPersonBudget),
    'bali': generateGenericAccommodations('Bali, Indonesia', perPersonBudget),
    'jakarta': generateGenericAccommodations('Jakarta, Indonesia', perPersonBudget),
    // Japan
    'japan': generateGenericAccommodations('Japan', perPersonBudget),
    'tokyo': generateGenericAccommodations('Tokyo, Japan', perPersonBudget),
    'kyoto': generateGenericAccommodations('Kyoto, Japan', perPersonBudget),
    // Other popular destinations
    'vietnam': generateGenericAccommodations('Vietnam', perPersonBudget),
    'ho chi minh': generateGenericAccommodations('Ho Chi Minh City, Vietnam', perPersonBudget),
    'hanoi': generateGenericAccommodations('Hanoi, Vietnam', perPersonBudget),
    'australia': generateGenericAccommodations('Australia', perPersonBudget),
    'sydney': generateGenericAccommodations('Sydney, Australia', perPersonBudget),
    'melbourne': generateGenericAccommodations('Melbourne, Australia', perPersonBudget),
    'france': generateGenericAccommodations('France', perPersonBudget),
    'paris': generateGenericAccommodations('Paris, France', perPersonBudget),
    'italy': generateGenericAccommodations('Italy', perPersonBudget),
    'rome': generateGenericAccommodations('Rome, Italy', perPersonBudget),
    'venice': generateGenericAccommodations('Venice, Italy', perPersonBudget),
    'spain': generateGenericAccommodations('Spain', perPersonBudget),
    'barcelona': generateGenericAccommodations('Barcelona, Spain', perPersonBudget),
    'united kingdom': generateGenericAccommodations('United Kingdom', perPersonBudget),
    'london': generateGenericAccommodations('London, UK', perPersonBudget),
    'usa': generateGenericAccommodations('USA', perPersonBudget),
    'new york': generateGenericAccommodations('New York, USA', perPersonBudget),
    'los angeles': generateGenericAccommodations('Los Angeles, USA', perPersonBudget),
    'canada': generateGenericAccommodations('Canada', perPersonBudget),
    'toronto': generateGenericAccommodations('Toronto, Canada', perPersonBudget),
  };

  // Check if we have specific accommodations for this destination
  // Try full destination first, then main city/country name
  if (accommodations[dest]) {
    return accommodations[dest];
  }
  if (accommodations[mainDest]) {
    return accommodations[mainDest];
  }

  // Generate generic accommodations for any destination
  return generateGenericAccommodations(destination, perPersonBudget);
};

// Google Places API Configuration
// IMPORTANT: To use this feature, you need to:
// 1. Get a Google Places API key from: https://console.cloud.google.com/google/maps-apis
// 2. Enable "Places API" and "Places API (New)" in your Google Cloud Console
// 3. Replace 'YOUR_GOOGLE_PLACES_API_KEY' below with your actual API key
// 4. Make sure to restrict your API key to prevent unauthorized use
const GOOGLE_PLACES_API_KEY = 'AIzaSyDKlOxUNHBffh_ow-V5dyxF3XEqTs2ehjo'; // Google Places API key
const GOOGLE_PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';

// Global variable to store API errors for display in UI
// NOTE: This is used in async functions, state is updated in component
let apiErrors = [];
let setApiErrorsState = null; // Will be set by component

// Fetch places dynamically from Google Places API with detailed information
const fetchPlacesFromGoogle = async (query, type = '', maxResults = 10) => {
  // Check if API key is configured
  if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
    // Even without API key, we can use Google Maps search URLs as fallback
    return [];
  }

  try {
    // Use Text Search API which doesn't require coordinates
    const searchQuery = type ? `${query} ${type}` : query;
    const url = `${GOOGLE_PLACES_API_BASE}/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}`;

    // Add timeout to prevent hanging (increased to 30s for React Native/mobile networks)
    const timeoutMs = 30000; // 30 seconds timeout (increased from 12s for mobile networks)

    // Check if AbortController is available (React Native might not support it)
    let controller;
    let timeoutId;
    try {
      controller = new AbortController();
      timeoutId = setTimeout(() => {
        try {
          controller.abort();
        } catch (e) {
          console.warn('⚠️ AbortController not supported, using timeout fallback');
        }
      }, timeoutMs);
    } catch (e) {
      console.warn('⚠️ AbortController not available, proceeding without timeout');
      controller = null;
    }

    let response;
    try {
      // Add headers for React Native compatibility
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      };

      // Only add signal if AbortController is available
      if (controller) {
        fetchOptions.signal = controller.signal;
      }

      console.log(`🔍 DEBUG fetchPlacesFromGoogle: Making request to: ${url.substring(0, 100)}...`);
      response = await fetch(url, fetchOptions);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // DEBUG: Log response status
      console.log(`🔍 DEBUG fetchPlacesFromGoogle: Response status for "${searchQuery}":`, response.status);

      if (!response.ok) {
        console.warn(`⚠️ DEBUG: Response not OK: ${response.status} ${response.statusText}`);
      }
    } catch (fetchError) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      console.error(`❌ DEBUG fetchPlacesFromGoogle: Fetch error for "${searchQuery}":`, {
        name: fetchError.name,
        message: fetchError.message,
        stack: fetchError.stack
      });
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
        console.warn(`⚠️ DEBUG: Request timeout for "${searchQuery}"`);
        return [];
      }
      // Don't throw - return empty array so other queries can still proceed
      console.warn(`⚠️ DEBUG: Fetch failed for "${searchQuery}", returning empty array`);
      return [];
    }

    const data = await response.json();

    // Log API response for debugging
    // Check for API errors and store them
    if (data.status !== 'OK') {
      const errorInfo = {
        status: data.status,
        message: data.error_message || 'Unknown error',
        query: searchQuery,
        timestamp: new Date().toISOString(),
      };

      // Store error (keep last 5 errors)
      apiErrors.push(errorInfo);
      if (apiErrors.length > 5) apiErrors.shift();

      // Update state if available
      if (setApiErrorsState) {
        setApiErrorsState([...apiErrors]);
      }

      // DEBUG: Log API errors to help identify issues
      console.warn(`⚠️ API Error for query "${searchQuery}":`, data.status, data.error_message);
      console.warn(`⚠️ Full error info:`, errorInfo);

      // Return empty array on error (don't throw, let caller handle it)
      return [];
    }

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const places = data.results.slice(0, maxResults);

      // Fetch detailed information for each place (including reviews and photos)
      // Optimized: Limit to first 3 places to prevent timeout, fetch details in parallel with timeout
      const placesToDetail = places.slice(0, 3); // Limit to 3 to prevent timeout
      const detailedPlaces = await Promise.all(
        placesToDetail.map(async (place) => {
          try {
            // Get place details for more information (with timeout)
            const detailsUrl = `${GOOGLE_PLACES_API_BASE}/details/json?place_id=${place.place_id}&fields=name,formatted_address,rating,user_ratings_total,types,opening_hours,price_level,reviews,photos,geometry&key=${GOOGLE_PLACES_API_KEY}`;

            // Add timeout for details API call (increased to 20s for React Native/mobile networks)
            const detailsController = new AbortController();
            const detailsTimeoutId = setTimeout(() => detailsController.abort(), 20000); // 20s timeout (increased from 8s)

            let detailsResponse;
            try {
              detailsResponse = await fetch(detailsUrl, { signal: detailsController.signal });
              clearTimeout(detailsTimeoutId);
            } catch (detailsError) {
              clearTimeout(detailsTimeoutId);
              if (detailsError.name === 'AbortError') {
                // Return basic info without details
                return {
                  name: place.name,
                  address: place.formatted_address,
                  rating: place.rating || 0,
                  ratingCount: place.user_ratings_total || 0,
                  types: place.types || [],
                  placeId: place.place_id,
                  estimatedCost: 300,
                  googleMaps: `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + place.formatted_address)}`,
                  location: {
                    lat: place.geometry?.location?.lat,
                    lng: place.geometry?.location?.lng,
                  }
                };
              }
              throw detailsError;
            }

            const detailsData = await detailsResponse.json();

            if (detailsData.status === 'OK' && detailsData.result) {
              const details = detailsData.result;
              return {
                name: details.name,
                address: details.formatted_address,
                rating: details.rating || 0,
                ratingCount: details.user_ratings_total || 0,
                types: details.types || [],
                placeId: place.place_id,
                priceLevel: details.price_level || null, // 0-4 scale
                openingHours: details.opening_hours?.weekday_text || [],
                reviews: details.reviews?.slice(0, 2).map(r => ({
                  text: r.text,
                  rating: r.rating,
                  author: r.author_name
                })) || [],
                googleMaps: `https://maps.google.com/?q=${encodeURIComponent(details.name + ' ' + details.formatted_address)}`,
                location: {
                  lat: details.geometry?.location?.lat,
                  lng: details.geometry?.location?.lng,
                },
                // Estimate cost based on price level (0=free, 1=₹, 2=₹₹, 3=₹₹₹, 4=₹₹₹₹)
                estimatedCost: details.price_level === 0 ? 0 :
                              details.price_level === 1 ? 200 :
                              details.price_level === 2 ? 500 :
                              details.price_level === 3 ? 1000 :
                              details.price_level === 4 ? 2000 : 300,
              };
            }
            } catch (err) {
              // Silent fail, use basic info
            }

          // Fallback to basic info if details fetch fails
          return {
            name: place.name,
            address: place.formatted_address,
            rating: place.rating || 0,
            ratingCount: place.user_ratings_total || 0,
            types: place.types || [],
            placeId: place.place_id,
            estimatedCost: 300,
            googleMaps: `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + place.formatted_address)}`,
            location: {
              lat: place.geometry?.location?.lat,
              lng: place.geometry?.location?.lng,
            }
          };
        })
      );

      // Add remaining places without detailed info to prevent data loss
      const remainingPlaces = places.slice(5).map(place => ({
        name: place.name,
        address: place.formatted_address,
        rating: place.rating || 0,
        ratingCount: place.user_ratings_total || 0,
        types: place.types || [],
        placeId: place.place_id,
        estimatedCost: 300,
        googleMaps: `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + place.formatted_address)}`,
        location: {
          lat: place.geometry?.location?.lat,
          lng: place.geometry?.location?.lng,
        }
      }));

      return [...detailedPlaces, ...remainingPlaces];
    }
    // DEBUG: Log when no results found
    console.warn(`⚠️ No results found for query: "${searchQuery}"`);
    return [];
  } catch (error) {
    console.error('Error fetching places from Google:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      query: searchQuery,
      stack: error.stack
    });

    // Store fetch errors
    const errorInfo = {
      status: 'FETCH_ERROR',
      message: error.message || 'Network error',
      query: searchQuery,
      timestamp: new Date().toISOString(),
    };
    apiErrors.push(errorInfo);
    if (apiErrors.length > 5) apiErrors.shift();
    if (setApiErrorsState) {
      setApiErrorsState([...apiErrors]);
    }

    return [];
  }
};

// Determine main city/airport for a destination
const getMainCityForDestination = async (destination) => {
  // For countries, find the main city/airport
  const countryToCityMap = {
    'philippines': 'Manila',
    'palawan': 'Palawan',
    'thailand': 'Bangkok',
    'singapore': 'Singapore',
    'malaysia': 'Kuala Lumpur',
    'indonesia': 'Jakarta',
    'japan': 'Tokyo',
    'vietnam': 'Ho Chi Minh City',
    'australia': 'Sydney',
    'france': 'Paris',
    'italy': 'Rome',
    'spain': 'Barcelona',
    'united kingdom': 'London',
    'uk': 'London',
    'usa': 'New York',
    'canada': 'Toronto',
    'dubai': 'Dubai',
    'uae': 'Dubai',
    'india': 'Mumbai',
    'goa': 'Goa',
    'rajasthan': 'Rajasthan',
    'mumbai': 'Mumbai',
    'pune': 'Pune',
    'delhi': 'Delhi',
    'bangalore': 'Bangalore',
    'kerala': 'Kochi',
    'lonavala': 'Lonavala',
  };

  const destLower = destination.toLowerCase().trim();

  // Check if it's a known country/city
  if (countryToCityMap[destLower]) {
    console.log(`📍 City mapping: "${destination}" → "${countryToCityMap[destLower]}"`);
    return countryToCityMap[destLower];
  }

  // If it's already a city name (common Indian cities), return as is
  // This prevents incorrect city detection for places like Goa, Pune, etc.
  const commonCities = ['goa', 'pune', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'kerala', 'lonavala'];
  if (commonCities.includes(destLower)) {
    console.log(`📍 Recognized city: "${destination}" → returning as-is`);
    return destination.charAt(0).toUpperCase() + destination.slice(1);
  }

  // For other destinations, try to fetch the main city from Google
  try {
    console.log(`📍 Fetching city for: "${destination}"`);
    const places = await fetchPlacesFromGoogle(`${destination} airport`);
    if (places.length > 0) {
      // Extract city name from airport address
      const address = places[0].address;
      const cityMatch = address.match(/([^,]+),/);
      const detectedCity = cityMatch ? cityMatch[1].trim() : destination;
      console.log(`📍 Detected city: "${destination}" → "${detectedCity}"`);
      return detectedCity;
    }
  } catch (error) {
    console.error('Error determining main city:', error);
  }

  console.log(`📍 Using destination as city: "${destination}"`);
  return destination;
};

// Fetch popular attractions/sightseeing places with cultural context
const fetchAttractions = async (destination, city, mood = '') => {
  // Build queries based on mood - use destination to ensure location-specific results
  // Combine city and destination for better accuracy
  const locationQuery = city && city.toLowerCase() !== destination.toLowerCase()
    ? `${city}, ${destination}`
    : destination;

  let queries = [];

  // Enhanced mood-based queries
  if (mood === 'cultural' || mood.includes('cultural')) {
    queries = [
      `museums ${locationQuery}`,
      `historical sites ${locationQuery}`,
      `cultural landmarks ${locationQuery}`,
      `churches ${locationQuery}`,
      `temples ${locationQuery}`,
      `heritage sites ${locationQuery}`,
      `art galleries ${locationQuery}`,
    ];
  } else if (mood === 'social' || mood.includes('social')) {
    queries = [
      `nightlife ${locationQuery}`,
      `clubs ${locationQuery}`,
      `bars ${locationQuery}`,
      `entertainment ${locationQuery}`,
      `popular places ${locationQuery}`,
      `happening places ${locationQuery}`,
      `shopping malls ${locationQuery}`,
    ];
  } else if (mood === 'food' || mood.includes('food') || mood.includes('foodie')) {
    queries = [
      `restaurants ${locationQuery}`,
      `cafes ${locationQuery}`,
      `bars ${locationQuery}`,
      `food places ${locationQuery}`,
      `popular restaurants ${locationQuery}`,
      `local food ${locationQuery}`,
    ];
  } else if (mood === 'nature' || mood.includes('nature')) {
    queries = [
      `parks ${locationQuery}`,
      `beaches ${locationQuery}`,
      `nature attractions ${locationQuery}`,
      `wildlife sanctuary ${locationQuery}`,
      `waterfalls ${locationQuery}`,
      `scenic viewpoints ${locationQuery}`,
    ];
  } else if (mood === 'urban' || mood.includes('urban')) {
    queries = [
      `shopping malls ${locationQuery}`,
      `city center ${locationQuery}`,
      `downtown ${locationQuery}`,
      `urban attractions ${locationQuery}`,
      `markets ${locationQuery}`,
    ];
  } else if (mood === 'relaxation' || mood.includes('relaxation') || mood === 'relaxing' || mood.includes('relaxing')) {
    queries = [
      `spas ${locationQuery}`,
      `beaches ${locationQuery}`,
      `parks ${locationQuery}`,
      `resorts ${locationQuery}`,
      `scenic viewpoints ${locationQuery}`,
      `peaceful places ${locationQuery}`,
    ];
  } else {
    queries = [
      `tourist attractions ${locationQuery}`,
      `must visit places ${locationQuery}`,
      `popular sights ${locationQuery}`,
      `museums ${locationQuery}`,
      `historical sites ${locationQuery}`,
    ];
  }

  const allPlaces = [];
  // Optimized: Use 3 queries max, 6 results per query to prevent timeout
  // Fetch queries sequentially with timeout protection
  for (const query of queries.slice(0, 3)) {
    try {
      const places = await fetchPlacesFromGoogle(query, '', 6);
      if (places && places.length > 0) {
        allPlaces.push(...places);
      }
      // If we already have enough places, break early
      if (allPlaces.length >= 15) break;
    } catch (error) {
      console.warn(`Error fetching places for query "${query}":`, error);
      // Continue with next query instead of failing completely
      continue;
    }
  }

  // Remove duplicates and return top rated
  const uniquePlaces = Array.from(
    new Map(allPlaces.map(p => [p.placeId, p])).values()
  );

  // Return optimized number (15-20) for better variety without timeout
  return uniquePlaces
    .sort((a, b) => {
      // Sort by rating count first (more popular), then by rating
      if (b.ratingCount !== a.ratingCount) {
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      }
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 20); // Return 20 options for variety (reduced from 30 to prevent timeout)
};

// Fetch restaurants with budget considerations
const fetchRestaurants = async (destination, city, mealType = '', budget = 'medium') => {
  // Use destination to ensure location-specific results
  // Combine city and destination for better accuracy
  const locationQuery = city && city.toLowerCase() !== destination.toLowerCase()
    ? `${city}, ${destination}`
    : destination;

  // Adjust queries based on meal type and budget
  let queries = [];

  if (mealType === 'lunch') {
    queries = [
      `affordable restaurants ${locationQuery}`,
      `local food ${locationQuery}`,
      `popular lunch ${locationQuery}`,
      `street food ${locationQuery}`,
      `budget restaurants ${locationQuery}`,
      `cafes ${locationQuery}`,
    ];
  } else if (mealType === 'dinner') {
    queries = [
      `best restaurants ${locationQuery}`,
      `popular restaurants ${locationQuery}`,
      `dinner ${locationQuery}`,
      `local cuisine ${locationQuery}`,
      `fine dining ${locationQuery}`,
      `bars ${locationQuery}`,
    ];
  } else {
    queries = [
      `best restaurants ${locationQuery}`,
      `popular restaurants ${locationQuery}`,
      `local food ${locationQuery}`,
      `cafes ${locationQuery}`,
      `bars ${locationQuery}`,
    ];
  }

  const allPlaces = [];
  // Optimized: Use 3 queries max, 6 results per query to prevent timeout
  // Fetch queries sequentially with timeout protection
  for (const query of queries.slice(0, 3)) {
    try {
      const places = await fetchPlacesFromGoogle(query, '', 6);
      if (places && places.length > 0) {
        allPlaces.push(...places);
      }
      // If we already have enough places, break early
      if (allPlaces.length >= 12) break;
    } catch (error) {
      console.warn(`Error fetching restaurants for query "${query}":`, error);
      // Continue with next query instead of failing completely
      continue;
    }
  }

  // Filter for restaurants and food places
  const restaurants = allPlaces.filter(p =>
    p.types.some(t =>
      t.includes('restaurant') ||
      t.includes('food') ||
      t.includes('meal') ||
      t.includes('cafe') ||
      t.includes('meal_takeaway')
    )
  );

  // Remove duplicates
  const uniqueRestaurants = Array.from(
    new Map(restaurants.map(r => [r.placeId, r])).values()
  );

  // Sort by rating and filter by budget if needed
  let sorted = uniqueRestaurants.sort((a, b) => {
    // For lunch, prefer affordable (lower price level)
    if (mealType === 'lunch') {
      const aPrice = a.priceLevel || 2;
      const bPrice = b.priceLevel || 2;
      if (aPrice !== bPrice) return aPrice - bPrice;
    }
    // Then sort by rating count and rating
    if (b.ratingCount !== a.ratingCount) {
      return (b.ratingCount || 0) - (a.ratingCount || 0);
    }
    return (b.rating || 0) - (a.rating || 0);
  });

  // Return optimized number (15) for better variety without timeout
  return sorted.slice(0, 15);
};

// Fetch shopping areas and markets
const fetchShoppingAreas = async (destination, city) => {
  // Use destination to ensure location-specific results
  const locationQuery = city && city.toLowerCase() !== destination.toLowerCase()
    ? `${city}, ${destination}`
    : destination;

  const queries = [
    `shopping malls ${locationQuery}`,
    `markets ${locationQuery}`,
    `shopping streets ${locationQuery}`,
    `local markets ${locationQuery}`,
    `night markets ${locationQuery}`,
  ];

  const allPlaces = [];
  // Optimized: Use 2 queries max, 4 results per query to prevent timeout
  for (const query of queries.slice(0, 2)) {
    try {
      const places = await fetchPlacesFromGoogle(query, '', 4);
      if (places && places.length > 0) {
        allPlaces.push(...places);
      }
      if (allPlaces.length >= 6) break; // Early exit if enough results
    } catch (error) {
      console.warn(`Error fetching shopping for query "${query}":`, error);
      continue;
    }
  }

  // Filter for shopping-related places
  const shoppingPlaces = allPlaces.filter(p =>
    p.types.some(t =>
      t.includes('shopping') ||
      t.includes('store') ||
      t.includes('market') ||
      t.includes('shopping_mall')
    )
  );

  const uniquePlaces = Array.from(
    new Map(shoppingPlaces.map(p => [p.placeId, p])).values()
  );

  return uniquePlaces
    .sort((a, b) => {
      // Prefer markets and local shopping over malls for cultural experience
      const aIsMarket = a.types.some(t => t.includes('market'));
      const bIsMarket = b.types.some(t => t.includes('market'));
      if (aIsMarket && !bIsMarket) return -1;
      if (!aIsMarket && bIsMarket) return 1;
      return (b.ratingCount || 0) - (a.ratingCount || 0);
    })
    .slice(0, 8);
};

// Fetch parks and gardens
const fetchParks = async (destination, city) => {
  // Use destination to ensure location-specific results
  const locationQuery = city && city.toLowerCase() !== destination.toLowerCase()
    ? `${city}, ${destination}`
    : destination;

  const queries = [
    `parks ${locationQuery}`,
    `gardens ${locationQuery}`,
    `public parks ${locationQuery}`,
  ];

  const allPlaces = [];
  // Optimized: Use 2 queries max, 4 results per query to prevent timeout
  for (const query of queries.slice(0, 2)) {
    try {
      const places = await fetchPlacesFromGoogle(query, '', 4);
      if (places && places.length > 0) {
        allPlaces.push(...places);
      }
      if (allPlaces.length >= 6) break; // Early exit if enough results
    } catch (error) {
      console.warn(`Error fetching parks for query "${query}":`, error);
      continue;
    }
  }

  // Filter for parks
  const parks = allPlaces.filter(p =>
    p.types.some(t => t.includes('park') || t.includes('garden'))
  );

  const uniqueParks = Array.from(
    new Map(parks.map(p => [p.placeId, p])).values()
  );

  return uniqueParks
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);
};

// Fetch scenic viewpoints
const fetchViewpoints = async (destination, city) => {
  // Use destination to ensure location-specific results
  const locationQuery = city && city.toLowerCase() !== destination.toLowerCase()
    ? `${city}, ${destination}`
    : destination;

  const queries = [
    `viewpoints ${locationQuery}`,
    `observation deck ${locationQuery}`,
    `scenic spots ${locationQuery}`,
    `sunset point ${locationQuery}`,
  ];

  const allPlaces = [];
  // Optimized: Use 2 queries max, 4 results per query to prevent timeout
  for (const query of queries.slice(0, 2)) {
    try {
      const places = await fetchPlacesFromGoogle(query, '', 4);
      if (places && places.length > 0) {
        allPlaces.push(...places);
      }
      if (allPlaces.length >= 6) break; // Early exit if enough results
    } catch (error) {
      console.warn(`Error fetching viewpoints for query "${query}":`, error);
      continue;
    }
  }

  // Filter for viewpoints or high-rated scenic places
  const viewpoints = allPlaces.filter(p =>
    p.types.some(t => t.includes('point_of_interest') || t.includes('establishment')) ||
    (p.rating && p.rating >= 4.0)
  );

  const uniqueViewpoints = Array.from(
    new Map(viewpoints.map(v => [v.placeId, v])).values()
  );

  return uniqueViewpoints
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);
};

// Legacy hardcoded database (kept as fallback, will be removed once API is working)
const DESTINATION_PLACES_DB_LEGACY = {
  // Philippines
  'philippines': {
    restaurants: {
      lunch: [
        { name: 'Manila Hotel - The Champagne Room', location: 'Manila', googleMaps: 'https://maps.google.com/?q=Manila+Hotel+Champagne+Room' },
        { name: 'Cafe Adriatico', location: 'Malate, Manila', googleMaps: 'https://maps.google.com/?q=Cafe+Adriatico+Manila' },
        { name: 'Aristocrat Restaurant', location: 'Roxas Boulevard, Manila', googleMaps: 'https://maps.google.com/?q=Aristocrat+Restaurant+Manila' },
        { name: 'Cafe Ilang-Ilang', location: 'Manila Hotel', googleMaps: 'https://maps.google.com/?q=Cafe+Ilang-Ilang+Manila' },
      ],
      dinner: [
        { name: 'Spiral Restaurant', location: 'Sofitel Philippine Plaza', googleMaps: 'https://maps.google.com/?q=Spiral+Restaurant+Manila' },
        { name: 'Antonio\'s Restaurant', location: 'Tagaytay', googleMaps: 'https://maps.google.com/?q=Antonios+Restaurant+Tagaytay' },
        { name: 'Barbara\'s Heritage Restaurant', location: 'Intramuros, Manila', googleMaps: 'https://maps.google.com/?q=Barbaras+Heritage+Restaurant+Manila' },
        { name: 'Sarsa Kitchen + Bar', location: 'BGC, Taguig', googleMaps: 'https://maps.google.com/?q=Sarsa+Kitchen+Bar+Manila' },
      ],
    },
    parks: [
      { name: 'Rizal Park (Luneta Park)', description: 'Historic urban park', googleMaps: 'https://maps.google.com/?q=Rizal+Park+Manila' },
      { name: 'Manila Ocean Park', description: 'Oceanarium and marine park', googleMaps: 'https://maps.google.com/?q=Manila+Ocean+Park' },
      { name: 'Quezon Memorial Circle', description: 'Large urban park', googleMaps: 'https://maps.google.com/?q=Quezon+Memorial+Circle' },
      { name: 'Ayala Triangle Gardens', description: 'Modern urban park', googleMaps: 'https://maps.google.com/?q=Ayala+Triangle+Gardens+Manila' },
    ],
    viewpoints: [
      { name: 'Manila Baywalk', description: 'Scenic waterfront promenade', googleMaps: 'https://maps.google.com/?q=Manila+Baywalk' },
      { name: 'Tagaytay Ridge', description: 'Panoramic view of Taal Volcano', googleMaps: 'https://maps.google.com/?q=Tagaytay+Ridge' },
      { name: 'Intramuros Walls', description: 'Historic city walls with views', googleMaps: 'https://maps.google.com/?q=Intramuros+Walls+Manila' },
      { name: 'Sky Deck at SM Mall of Asia', description: 'Rooftop viewing deck', googleMaps: 'https://maps.google.com/?q=SM+Mall+of+Asia+Sky+Deck' },
    ],
  },
  'boracay': {
    restaurants: {
      lunch: [
        { name: 'D\'Talipapa Seafood Market', location: 'Station 2, Boracay', googleMaps: 'https://maps.google.com/?q=DTalipapa+Seafood+Market+Boracay' },
        { name: 'Aria Restaurant', location: 'D\'Mall, Boracay', googleMaps: 'https://maps.google.com/?q=Aria+Restaurant+Boracay' },
        { name: 'Jonah\'s Fruit Shake & Snack Bar', location: 'White Beach, Boracay', googleMaps: 'https://maps.google.com/?q=Jonahs+Fruit+Shake+Boracay' },
        { name: 'Smoke Restaurant', location: 'D\'Mall, Boracay', googleMaps: 'https://maps.google.com/?q=Smoke+Restaurant+Boracay' },
      ],
      dinner: [
        { name: 'Kasbah Restaurant', location: 'Station 1, Boracay', googleMaps: 'https://maps.google.com/?q=Kasbah+Restaurant+Boracay' },
        { name: 'Lemoni Cafe & Restaurant', location: 'Station 1, Boracay', googleMaps: 'https://maps.google.com/?q=Lemoni+Cafe+Boracay' },
        { name: 'Cyma Greek Taverna', location: 'D\'Mall, Boracay', googleMaps: 'https://maps.google.com/?q=Cyma+Greek+Taverna+Boracay' },
        { name: 'Plato D\'Boracay', location: 'Station 2, Boracay', googleMaps: 'https://maps.google.com/?q=Plato+DBoracay' },
      ],
    },
    parks: [
      { name: 'White Beach', description: '4km pristine white sand beach', googleMaps: 'https://maps.google.com/?q=White+Beach+Boracay' },
      { name: 'Puka Shell Beach', description: 'Secluded beach with shells', googleMaps: 'https://maps.google.com/?q=Puka+Shell+Beach+Boracay' },
      { name: 'Bulabog Beach', description: 'Windsurfing and kitesurfing beach', googleMaps: 'https://maps.google.com/?q=Bulabog+Beach+Boracay' },
    ],
    viewpoints: [
      { name: 'Mount Luho Viewing Deck', description: 'Highest point with panoramic views', googleMaps: 'https://maps.google.com/?q=Mount+Luho+Boracay' },
      { name: 'Ilig-Iligan Beach Viewpoint', description: 'Scenic cliffside views', googleMaps: 'https://maps.google.com/?q=Ilig+Iligan+Beach+Boracay' },
      { name: 'Diniwid Beach Sunset Point', description: 'Best sunset viewing spot', googleMaps: 'https://maps.google.com/?q=Diniwid+Beach+Boracay' },
    ],
  },
  'palawan': {
    restaurants: {
      lunch: [
        { name: 'Ka Lui Restaurant', location: 'Puerto Princesa', googleMaps: 'https://maps.google.com/?q=Ka+Lui+Restaurant+Puerto+Princesa' },
        { name: 'Kalui Restaurant', location: 'Puerto Princesa', googleMaps: 'https://maps.google.com/?q=Kalui+Restaurant+Palawan' },
        { name: 'Badjao Seafront Restaurant', location: 'Puerto Princesa', googleMaps: 'https://maps.google.com/?q=Badjao+Seafront+Restaurant+Palawan' },
      ],
      dinner: [
        { name: 'La Terrasse Restaurant', location: 'El Nido', googleMaps: 'https://maps.google.com/?q=La+Terrasse+Restaurant+El+Nido' },
        { name: 'Trattoria Altrove', location: 'El Nido', googleMaps: 'https://maps.google.com/?q=Trattoria+Altrove+El+Nido' },
        { name: 'Artcafe', location: 'El Nido', googleMaps: 'https://maps.google.com/?q=Artcafe+El+Nido' },
      ],
    },
    parks: [
      { name: 'Puerto Princesa Subterranean River National Park', description: 'UNESCO World Heritage underground river', googleMaps: 'https://maps.google.com/?q=Puerto+Princesa+Underground+River' },
      { name: 'El Nido Marine Reserve', description: 'Protected marine sanctuary', googleMaps: 'https://maps.google.com/?q=El+Nido+Marine+Reserve' },
      { name: 'Nagtabon Beach', description: 'Secluded beach paradise', googleMaps: 'https://maps.google.com/?q=Nagtabon+Beach+Palawan' },
    ],
    viewpoints: [
      { name: 'Taraw Cliff Viewpoint', description: 'Panoramic view of El Nido', googleMaps: 'https://maps.google.com/?q=Taraw+Cliff+El+Nido' },
      { name: 'Nacpan Beach Twin Beaches Viewpoint', description: 'Stunning twin beach views', googleMaps: 'https://maps.google.com/?q=Nacpan+Beach+Palawan' },
      { name: 'Las Cabanas Beach Sunset Deck', description: 'Best sunset spot in El Nido', googleMaps: 'https://maps.google.com/?q=Las+Cabanas+Beach+El+Nido' },
    ],
  },
  // Dubai
  'dubai': {
    restaurants: {
      lunch: [
        { name: 'At.mosphere Burj Khalifa', location: 'Burj Khalifa, 122nd Floor', googleMaps: 'https://maps.google.com/?q=Atmosphere+Burj+Khalifa+Dubai' },
        { name: 'Zuma Dubai', location: 'DIFC, Dubai', googleMaps: 'https://maps.google.com/?q=Zuma+Dubai' },
        { name: 'Al Fanar Restaurant', location: 'Dubai Festival City', googleMaps: 'https://maps.google.com/?q=Al+Fanar+Restaurant+Dubai' },
        { name: 'Ravi Restaurant', location: 'Satwa, Dubai', googleMaps: 'https://maps.google.com/?q=Ravi+Restaurant+Dubai' },
      ],
      dinner: [
        { name: 'Pierchic', location: 'Al Qasr Hotel, Madinat Jumeirah', googleMaps: 'https://maps.google.com/?q=Pierchic+Dubai' },
        { name: 'Al Hadheerah', location: 'Bab Al Shams Desert Resort', googleMaps: 'https://maps.google.com/?q=Al+Hadheerah+Dubai' },
        { name: 'Nobu Dubai', location: 'Atlantis The Palm', googleMaps: 'https://maps.google.com/?q=Nobu+Dubai' },
        { name: 'Al Dawaar Revolving Restaurant', location: 'Hyatt Regency Dubai', googleMaps: 'https://maps.google.com/?q=Al+Dawaar+Restaurant+Dubai' },
      ],
    },
    parks: [
      { name: 'Dubai Miracle Garden', description: 'World\'s largest natural flower garden', googleMaps: 'https://maps.google.com/?q=Dubai+Miracle+Garden' },
      { name: 'Dubai Creek Park', description: 'Large waterfront park', googleMaps: 'https://maps.google.com/?q=Dubai+Creek+Park' },
      { name: 'Safa Park', description: 'Popular urban park', googleMaps: 'https://maps.google.com/?q=Safa+Park+Dubai' },
      { name: 'Zabeel Park', description: 'Modern park with lake', googleMaps: 'https://maps.google.com/?q=Zabeel+Park+Dubai' },
    ],
    viewpoints: [
      { name: 'Burj Khalifa Observation Deck', description: 'World\'s tallest building viewing deck', googleMaps: 'https://maps.google.com/?q=Burj+Khalifa+Observation+Deck' },
      { name: 'Dubai Frame', description: 'Iconic frame with panoramic views', googleMaps: 'https://maps.google.com/?q=Dubai+Frame' },
      { name: 'Palm Jumeirah Viewpoint', description: 'View of the palm-shaped island', googleMaps: 'https://maps.google.com/?q=Palm+Jumeirah+Viewpoint' },
      { name: 'Al Seef Waterfront', description: 'Scenic Dubai Creek views', googleMaps: 'https://maps.google.com/?q=Al+Seef+Dubai' },
    ],
  },
  // Thailand
  'bangkok': {
    restaurants: {
      lunch: [
        { name: 'Thip Samai Pad Thai', location: 'Old City, Bangkok', googleMaps: 'https://maps.google.com/?q=Thip+Samai+Pad+Thai+Bangkok' },
        { name: 'Jay Fai', location: 'Mahachai Road, Bangkok', googleMaps: 'https://maps.google.com/?q=Jay+Fai+Bangkok' },
        { name: 'Somboon Seafood', location: 'Multiple locations', googleMaps: 'https://maps.google.com/?q=Somboon+Seafood+Bangkok' },
        { name: 'Baan Khanitha', location: 'Sukhumvit, Bangkok', googleMaps: 'https://maps.google.com/?q=Baan+Khanitha+Bangkok' },
      ],
      dinner: [
        { name: 'Sirocco Sky Bar', location: 'Lebua State Tower', googleMaps: 'https://maps.google.com/?q=Sirocco+Sky+Bar+Bangkok' },
        { name: 'Nahm', location: 'COMO Metropolitan Bangkok', googleMaps: 'https://maps.google.com/?q=Nahm+Restaurant+Bangkok' },
        { name: 'Baan Phadthai', location: 'Charoen Krung Road', googleMaps: 'https://maps.google.com/?q=Baan+Phadthai+Bangkok' },
        { name: 'The Local by Oam Thong Thai Cuisine', location: 'Sukhumvit, Bangkok', googleMaps: 'https://maps.google.com/?q=The+Local+Bangkok' },
      ],
    },
    parks: [
      { name: 'Lumpini Park', description: 'Central Bangkok\'s largest park', googleMaps: 'https://maps.google.com/?q=Lumpini+Park+Bangkok' },
      { name: 'Chatuchak Park', description: 'Large public park', googleMaps: 'https://maps.google.com/?q=Chatuchak+Park+Bangkok' },
      { name: 'Benjakitti Park', description: 'Modern park with lake', googleMaps: 'https://maps.google.com/?q=Benjakitti+Park+Bangkok' },
      { name: 'Suan Luang Rama IX Park', description: 'Royal park with gardens', googleMaps: 'https://maps.google.com/?q=Suan+Luang+Rama+IX+Park+Bangkok' },
    ],
    viewpoints: [
      { name: 'Wat Arun (Temple of Dawn)', description: 'Iconic temple with river views', googleMaps: 'https://maps.google.com/?q=Wat+Arun+Bangkok' },
      { name: 'Golden Mount (Wat Saket)', description: 'Temple hill with city views', googleMaps: 'https://maps.google.com/?q=Golden+Mount+Bangkok' },
      { name: 'Mahanakhon SkyWalk', description: 'Glass skywalk with 360° views', googleMaps: 'https://maps.google.com/?q=Mahanakhon+SkyWalk+Bangkok' },
      { name: 'Baiyoke Sky Tower', description: 'Tallest building observation deck', googleMaps: 'https://maps.google.com/?q=Baiyoke+Sky+Tower+Bangkok' },
    ],
  },
  'phuket': {
    restaurants: {
      lunch: [
        { name: 'Baan Rim Pa', location: 'Kalim Beach, Phuket', googleMaps: 'https://maps.google.com/?q=Baan+Rim+Pa+Phuket' },
        { name: 'Blue Elephant Phuket', location: 'Phuket Town', googleMaps: 'https://maps.google.com/?q=Blue+Elephant+Phuket' },
        { name: 'Raya Restaurant', location: 'Phuket Old Town', googleMaps: 'https://maps.google.com/?q=Raya+Restaurant+Phuket' },
      ],
      dinner: [
        { name: 'Breeze Restaurant', location: 'Cape Panwa Hotel', googleMaps: 'https://maps.google.com/?q=Breeze+Restaurant+Phuket' },
        { name: 'Ka Jok See', location: 'Phuket Old Town', googleMaps: 'https://maps.google.com/?q=Ka+Jok+See+Phuket' },
        { name: 'La Gritta', location: 'Amari Phuket', googleMaps: 'https://maps.google.com/?q=La+Gritta+Phuket' },
      ],
    },
    parks: [
      { name: 'Sirinat National Park', description: 'Marine national park', googleMaps: 'https://maps.google.com/?q=Sirinat+National+Park+Phuket' },
      { name: 'Khao Phra Thaeo National Park', description: 'Tropical rainforest park', googleMaps: 'https://maps.google.com/?q=Khao+Phra+Thaeo+National+Park' },
      { name: 'Phuket Botanic Garden', description: 'Tropical botanical gardens', googleMaps: 'https://maps.google.com/?q=Phuket+Botanic+Garden' },
    ],
    viewpoints: [
      { name: 'Karon Viewpoint', description: 'Panoramic view of three beaches', googleMaps: 'https://maps.google.com/?q=Karon+Viewpoint+Phuket' },
      { name: 'Big Buddha Phuket', description: 'Giant Buddha statue with views', googleMaps: 'https://maps.google.com/?q=Big+Buddha+Phuket' },
      { name: 'Promthep Cape', description: 'Best sunset viewpoint in Phuket', googleMaps: 'https://maps.google.com/?q=Promthep+Cape+Phuket' },
      { name: 'Windmill Viewpoint', description: 'Scenic hilltop views', googleMaps: 'https://maps.google.com/?q=Windmill+Viewpoint+Phuket' },
    ],
  },
  // Singapore
  'singapore': {
    restaurants: {
      lunch: [
        { name: 'Hawker Chan', location: 'Chinatown Complex', googleMaps: 'https://maps.google.com/?q=Hawker+Chan+Singapore' },
        { name: 'Tian Tian Hainanese Chicken Rice', location: 'Maxwell Food Centre', googleMaps: 'https://maps.google.com/?q=Tian+Tian+Chicken+Rice+Singapore' },
        { name: 'Din Tai Fung', location: 'Marina Bay Sands', googleMaps: 'https://maps.google.com/?q=Din+Tai+Fung+Singapore' },
        { name: 'Lau Pa Sat', location: 'Financial District', googleMaps: 'https://maps.google.com/?q=Lau+Pa+Sat+Singapore' },
      ],
      dinner: [
        { name: 'Jumbo Seafood', location: 'East Coast Seafood Centre', googleMaps: 'https://maps.google.com/?q=Jumbo+Seafood+Singapore' },
        { name: 'Candlenut', location: 'Dempsey Hill', googleMaps: 'https://maps.google.com/?q=Candlenut+Singapore' },
        { name: 'Odette', location: 'National Gallery Singapore', googleMaps: 'https://maps.google.com/?q=Odette+Restaurant+Singapore' },
        { name: 'Waku Ghin', location: 'Marina Bay Sands', googleMaps: 'https://maps.google.com/?q=Waku+Ghin+Singapore' },
      ],
    },
    parks: [
      { name: 'Gardens by the Bay', description: 'Futuristic nature park', googleMaps: 'https://maps.google.com/?q=Gardens+by+the+Bay+Singapore' },
      { name: 'Singapore Botanic Gardens', description: 'UNESCO World Heritage site', googleMaps: 'https://maps.google.com/?q=Singapore+Botanic+Gardens' },
      { name: 'East Coast Park', description: 'Beachfront park', googleMaps: 'https://maps.google.com/?q=East+Coast+Park+Singapore' },
      { name: 'MacRitchie Reservoir Park', description: 'Nature reserve with trails', googleMaps: 'https://maps.google.com/?q=MacRitchie+Reservoir+Park+Singapore' },
    ],
    viewpoints: [
      { name: 'Marina Bay Sands SkyPark', description: 'Rooftop infinity pool and views', googleMaps: 'https://maps.google.com/?q=Marina+Bay+Sands+SkyPark' },
      { name: 'Singapore Flyer', description: 'Giant observation wheel', googleMaps: 'https://maps.google.com/?q=Singapore+Flyer' },
      { name: 'Mount Faber Park', description: 'Hilltop park with city views', googleMaps: 'https://maps.google.com/?q=Mount+Faber+Park+Singapore' },
      { name: 'Henderson Waves', description: 'Pedestrian bridge with views', googleMaps: 'https://maps.google.com/?q=Henderson+Waves+Singapore' },
    ],
  },
  // Malaysia
  'kuala lumpur': {
    restaurants: {
      lunch: [
        { name: 'Jalan Alor Food Street', location: 'Bukit Bintang', googleMaps: 'https://maps.google.com/?q=Jalan+Alor+Kuala+Lumpur' },
        { name: 'Madam Kwan\'s', location: 'KLCC', googleMaps: 'https://maps.google.com/?q=Madam+Kwans+Kuala+Lumpur' },
        { name: 'Nasi Lemak Wanjo', location: 'Kampung Baru', googleMaps: 'https://maps.google.com/?q=Nasi+Lemak+Wanjo+Kuala+Lumpur' },
      ],
      dinner: [
        { name: 'Nobu Kuala Lumpur', location: 'KLCC', googleMaps: 'https://maps.google.com/?q=Nobu+Kuala+Lumpur' },
        { name: 'Bijan Restaurant', location: 'Bukit Bintang', googleMaps: 'https://maps.google.com/?q=Bijan+Restaurant+Kuala+Lumpur' },
        { name: 'Fuego at Troika Sky Dining', location: 'Troika Sky Dining', googleMaps: 'https://maps.google.com/?q=Fuego+Troika+Kuala+Lumpur' },
      ],
    },
    parks: [
      { name: 'KLCC Park', description: 'Park beneath Petronas Towers', googleMaps: 'https://maps.google.com/?q=KLCC+Park+Kuala+Lumpur' },
      { name: 'Perdana Botanical Gardens', description: 'Large botanical gardens', googleMaps: 'https://maps.google.com/?q=Perdana+Botanical+Gardens+Kuala+Lumpur' },
      { name: 'Taman Tasik Titiwangsa', description: 'Lake garden park', googleMaps: 'https://maps.google.com/?q=Taman+Tasik+Titiwangsa' },
    ],
    viewpoints: [
      { name: 'Petronas Twin Towers Skybridge', description: 'Skybridge between towers', googleMaps: 'https://maps.google.com/?q=Petronas+Towers+Skybridge' },
      { name: 'KL Tower Observation Deck', description: 'Tallest tower viewing deck', googleMaps: 'https://maps.google.com/?q=KL+Tower+Observation+Deck' },
      { name: 'Heli Lounge Bar', description: 'Rooftop bar with city views', googleMaps: 'https://maps.google.com/?q=Heli+Lounge+Bar+Kuala+Lumpur' },
    ],
  },
  // Indonesia
  'bali': {
    restaurants: {
      lunch: [
        { name: 'Warung Mak Beng', location: 'Sanur', googleMaps: 'https://maps.google.com/?q=Warung+Mak+Beng+Bali' },
        { name: 'Bebek Bengil', location: 'Ubud', googleMaps: 'https://maps.google.com/?q=Bebek+Bengil+Bali' },
        { name: 'Naughty Nuri\'s Warung', location: 'Ubud', googleMaps: 'https://maps.google.com/?q=Naughty+Nuris+Warung+Bali' },
      ],
      dinner: [
        { name: 'Locavore', location: 'Ubud', googleMaps: 'https://maps.google.com/?q=Locavore+Restaurant+Bali' },
        { name: 'Mozaic Restaurant', location: 'Ubud', googleMaps: 'https://maps.google.com/?q=Mozaic+Restaurant+Bali' },
        { name: 'Merah Putih Restaurant', location: 'Seminyak', googleMaps: 'https://maps.google.com/?q=Merah+Putih+Restaurant+Bali' },
        { name: 'Rock Bar Bali', location: 'Ayana Resort', googleMaps: 'https://maps.google.com/?q=Rock+Bar+Bali' },
      ],
    },
    parks: [
      { name: 'Bali Safari & Marine Park', description: 'Wildlife park and conservation', googleMaps: 'https://maps.google.com/?q=Bali+Safari+Marine+Park' },
      { name: 'Bali Botanic Garden', description: 'Tropical botanical gardens', googleMaps: 'https://maps.google.com/?q=Bali+Botanic+Garden' },
      { name: 'Taman Ayun Temple Gardens', description: 'Royal temple gardens', googleMaps: 'https://maps.google.com/?q=Taman+Ayun+Temple+Bali' },
    ],
    viewpoints: [
      { name: 'Tegallalang Rice Terraces', description: 'Iconic rice terrace views', googleMaps: 'https://maps.google.com/?q=Tegallalang+Rice+Terraces+Bali' },
      { name: 'Mount Batur Sunrise Viewpoint', description: 'Volcano sunrise views', googleMaps: 'https://maps.google.com/?q=Mount+Batur+Sunrise+Bali' },
      { name: 'Uluwatu Temple Cliff', description: 'Temple on dramatic cliffs', googleMaps: 'https://maps.google.com/?q=Uluwatu+Temple+Bali' },
      { name: 'Campuhan Ridge Walk', description: 'Scenic walking trail', googleMaps: 'https://maps.google.com/?q=Campuhan+Ridge+Walk+Bali' },
    ],
  },
  // Japan
  'tokyo': {
    restaurants: {
      lunch: [
        { name: 'Tsukiji Outer Market', location: 'Tsukiji', googleMaps: 'https://maps.google.com/?q=Tsukiji+Outer+Market+Tokyo' },
        { name: 'Ichiran Ramen', location: 'Shibuya', googleMaps: 'https://maps.google.com/?q=Ichiran+Ramen+Tokyo' },
        { name: 'Sukiyabashi Jiro', location: 'Ginza', googleMaps: 'https://maps.google.com/?q=Sukiyabashi+Jiro+Tokyo' },
        { name: 'Tempura Kondo', location: 'Ginza', googleMaps: 'https://maps.google.com/?q=Tempura+Kondo+Tokyo' },
      ],
      dinner: [
        { name: 'Narisawa', location: 'Minami Aoyama', googleMaps: 'https://maps.google.com/?q=Narisawa+Tokyo' },
        { name: 'Sukiyabashi Jiro Honten', location: 'Ginza', googleMaps: 'https://maps.google.com/?q=Sukiyabashi+Jiro+Tokyo' },
        { name: 'Robot Restaurant', location: 'Shinjuku', googleMaps: 'https://maps.google.com/?q=Robot+Restaurant+Tokyo' },
        { name: 'Gonpachi Shibuya', location: 'Shibuya', googleMaps: 'https://maps.google.com/?q=Gonpachi+Shibuya+Tokyo' },
      ],
    },
    parks: [
      { name: 'Ueno Park', description: 'Large public park with museums', googleMaps: 'https://maps.google.com/?q=Ueno+Park+Tokyo' },
      { name: 'Shinjuku Gyoen National Garden', description: 'Beautiful traditional gardens', googleMaps: 'https://maps.google.com/?q=Shinjuku+Gyoen+Tokyo' },
      { name: 'Yoyogi Park', description: 'Popular urban park', googleMaps: 'https://maps.google.com/?q=Yoyogi+Park+Tokyo' },
      { name: 'Hamarikyu Gardens', description: 'Traditional Japanese gardens', googleMaps: 'https://maps.google.com/?q=Hamarikyu+Gardens+Tokyo' },
    ],
    viewpoints: [
      { name: 'Tokyo Skytree Observation Deck', description: 'Tallest tower in Japan', googleMaps: 'https://maps.google.com/?q=Tokyo+Skytree+Observation+Deck' },
      { name: 'Tokyo Tower', description: 'Iconic red tower with views', googleMaps: 'https://maps.google.com/?q=Tokyo+Tower' },
      { name: 'Shibuya Sky', description: 'Rooftop observation deck', googleMaps: 'https://maps.google.com/?q=Shibuya+Sky+Tokyo' },
      { name: 'Tokyo Metropolitan Government Building', description: 'Free observation decks', googleMaps: 'https://maps.google.com/?q=Tokyo+Metropolitan+Government+Building' },
    ],
  },
  'kyoto': {
    restaurants: {
      lunch: [
        { name: 'Nishiki Market', location: 'Downtown Kyoto', googleMaps: 'https://maps.google.com/?q=Nishiki+Market+Kyoto' },
        { name: 'Kikunoi', location: 'Gion District', googleMaps: 'https://maps.google.com/?q=Kikunoi+Kyoto' },
        { name: 'Omen', location: 'Gion District', googleMaps: 'https://maps.google.com/?q=Omen+Restaurant+Kyoto' },
      ],
      dinner: [
        { name: 'Kikunoi Restaurant', location: 'Gion', googleMaps: 'https://maps.google.com/?q=Kikunoi+Restaurant+Kyoto' },
        { name: 'Ganko Sushi', location: 'Gion', googleMaps: 'https://maps.google.com/?q=Ganko+Sushi+Kyoto' },
        { name: 'Ippudo Ramen', location: 'Kawaramachi', googleMaps: 'https://maps.google.com/?q=Ippudo+Ramen+Kyoto' },
      ],
    },
    parks: [
      { name: 'Maruyama Park', description: 'Famous cherry blossom park', googleMaps: 'https://maps.google.com/?q=Maruyama+Park+Kyoto' },
      { name: 'Arashiyama Bamboo Grove', description: 'Famous bamboo forest', googleMaps: 'https://maps.google.com/?q=Arashiyama+Bamboo+Grove+Kyoto' },
      { name: 'Philosopher\'s Path', description: 'Scenic cherry tree-lined path', googleMaps: 'https://maps.google.com/?q=Philosophers+Path+Kyoto' },
    ],
    viewpoints: [
      { name: 'Fushimi Inari Shrine', description: 'Thousands of torii gates', googleMaps: 'https://maps.google.com/?q=Fushimi+Inari+Shrine+Kyoto' },
      { name: 'Kiyomizu-dera Temple', description: 'Wooden temple with city views', googleMaps: 'https://maps.google.com/?q=Kiyomizu+dera+Temple+Kyoto' },
      { name: 'Arashiyama Monkey Park', description: 'Hilltop park with monkey views', googleMaps: 'https://maps.google.com/?q=Arashiyama+Monkey+Park+Kyoto' },
    ],
  },
  // Kyrgyzstan
  'kyrgyzstan': {
    restaurants: {
      lunch: [
        { name: 'Navat Restaurant', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Navat+Restaurant+Bishkek' },
        { name: 'Faiza Restaurant', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Faiza+Restaurant+Bishkek' },
        { name: 'Arzu Restaurant', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Arzu+Restaurant+Bishkek' },
        { name: 'Chaikhana Jalal-Abad', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Chaikhana+Jalal-Abad+Bishkek' },
      ],
      dinner: [
        { name: 'Supara Ethno Complex', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Supara+Ethno+Complex+Bishkek' },
        { name: 'Cafe Faiza', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Cafe+Faiza+Bishkek' },
        { name: 'Arzu Restaurant', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Arzu+Restaurant+Bishkek' },
        { name: 'Navat Restaurant', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Navat+Restaurant+Bishkek' },
      ],
    },
    parks: [
      { name: 'Ala-Too Square', description: 'Central square and park', googleMaps: 'https://maps.google.com/?q=Ala-Too+Square+Bishkek' },
      { name: 'Panfilov Park', description: 'Historic city park', googleMaps: 'https://maps.google.com/?q=Panfilov+Park+Bishkek' },
      { name: 'Oak Park', description: 'Beautiful oak tree park', googleMaps: 'https://maps.google.com/?q=Oak+Park+Bishkek' },
      { name: 'Ala Archa National Park', description: 'Mountain national park', googleMaps: 'https://maps.google.com/?q=Ala+Archa+National+Park+Kyrgyzstan' },
    ],
    viewpoints: [
      { name: 'Ala-Too Square Observation Deck', description: 'City center views', googleMaps: 'https://maps.google.com/?q=Ala-Too+Square+Bishkek' },
      { name: 'Ala Archa Valley Viewpoint', description: 'Mountain valley views', googleMaps: 'https://maps.google.com/?q=Ala+Archa+Valley+Kyrgyzstan' },
      { name: 'Issyk-Kul Lake Viewpoint', description: 'Scenic lake views', googleMaps: 'https://maps.google.com/?q=Issyk-Kul+Lake+Kyrgyzstan' },
      { name: 'Burana Tower', description: 'Historic tower with panoramic views', googleMaps: 'https://maps.google.com/?q=Burana+Tower+Kyrgyzstan' },
    ],
  },
  'bishkek': {
    restaurants: {
      lunch: [
        { name: 'Navat Restaurant', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Navat+Restaurant+Bishkek' },
        { name: 'Faiza Restaurant', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Faiza+Restaurant+Bishkek' },
        { name: 'Arzu Restaurant', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Arzu+Restaurant+Bishkek' },
      ],
      dinner: [
        { name: 'Supara Ethno Complex', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Supara+Ethno+Complex+Bishkek' },
        { name: 'Cafe Faiza', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Cafe+Faiza+Bishkek' },
        { name: 'Navat Restaurant', location: 'Bishkek', googleMaps: 'https://maps.google.com/?q=Navat+Restaurant+Bishkek' },
      ],
    },
    parks: [
      { name: 'Ala-Too Square', description: 'Central square and park', googleMaps: 'https://maps.google.com/?q=Ala-Too+Square+Bishkek' },
      { name: 'Panfilov Park', description: 'Historic city park', googleMaps: 'https://maps.google.com/?q=Panfilov+Park+Bishkek' },
      { name: 'Oak Park', description: 'Beautiful oak tree park', googleMaps: 'https://maps.google.com/?q=Oak+Park+Bishkek' },
    ],
    viewpoints: [
      { name: 'Ala-Too Square Observation Deck', description: 'City center views', googleMaps: 'https://maps.google.com/?q=Ala-Too+Square+Bishkek' },
      { name: 'Victory Square', description: 'Historic square with views', googleMaps: 'https://maps.google.com/?q=Victory+Square+Bishkek' },
    ],
  },
  // India destinations
  'goa': {
    restaurants: {
      lunch: [
        { name: 'Martin\'s Corner', location: 'Betalbatim, Goa', googleMaps: 'https://maps.google.com/?q=Martins+Corner+Goa' },
        { name: 'Fisherman\'s Wharf', location: 'Cavelossim, Goa', googleMaps: 'https://maps.google.com/?q=Fishermans+Wharf+Goa' },
        { name: 'Gunpowder', location: 'Assagao, Goa', googleMaps: 'https://maps.google.com/?q=Gunpowder+Goa' },
        { name: 'Viva Panjim', location: 'Fontainhas, Goa', googleMaps: 'https://maps.google.com/?q=Viva+Panjim+Goa' },
      ],
      dinner: [
        { name: 'The Black Sheep Bistro', location: 'Panjim, Goa', googleMaps: 'https://maps.google.com/?q=Black+Sheep+Bistro+Goa' },
        { name: 'Thalassa', location: 'Vagator, Goa', googleMaps: 'https://maps.google.com/?q=Thalassa+Goa' },
        { name: 'La Plage', location: 'Ashwem Beach, Goa', googleMaps: 'https://maps.google.com/?q=La+Plage+Goa' },
        { name: 'Souza Lobo', location: 'Calangute Beach, Goa', googleMaps: 'https://maps.google.com/?q=Souza+Lobo+Goa' },
      ],
    },
    parks: [
      { name: 'Salim Ali Bird Sanctuary', description: 'Mangrove bird sanctuary', googleMaps: 'https://maps.google.com/?q=Salim+Ali+Bird+Sanctuary+Goa' },
      { name: 'Butterfly Beach', description: 'Secluded beach paradise', googleMaps: 'https://maps.google.com/?q=Butterfly+Beach+Goa' },
      { name: 'Cotigao Wildlife Sanctuary', description: 'Dense forest sanctuary', googleMaps: 'https://maps.google.com/?q=Cotigao+Wildlife+Sanctuary+Goa' },
    ],
    viewpoints: [
      { name: 'Dudhsagar Falls Viewpoint', description: 'Stunning waterfall views', googleMaps: 'https://maps.google.com/?q=Dudhsagar+Falls+Goa' },
      { name: 'Chapora Fort', description: 'Historic fort with beach views', googleMaps: 'https://maps.google.com/?q=Chapora+Fort+Goa' },
      { name: 'Aguada Fort Lighthouse', description: 'Lighthouse with panoramic views', googleMaps: 'https://maps.google.com/?q=Aguada+Fort+Lighthouse+Goa' },
    ],
  },
  'mumbai': {
    restaurants: {
      lunch: [
        { name: 'Trishna Restaurant', location: 'Fort, Mumbai', googleMaps: 'https://maps.google.com/?q=Trishna+Restaurant+Mumbai' },
        { name: 'Bademiya', location: 'Colaba, Mumbai', googleMaps: 'https://maps.google.com/?q=Bademiya+Mumbai' },
        { name: 'Cafe Mondegar', location: 'Colaba, Mumbai', googleMaps: 'https://maps.google.com/?q=Cafe+Mondegar+Mumbai' },
        { name: 'Britannia & Co.', location: 'Ballard Estate, Mumbai', googleMaps: 'https://maps.google.com/?q=Britannia+Co+Mumbai' },
      ],
      dinner: [
        { name: 'The Table', location: 'Colaba, Mumbai', googleMaps: 'https://maps.google.com/?q=The+Table+Mumbai' },
        { name: 'Masala Library', location: 'BKC, Mumbai', googleMaps: 'https://maps.google.com/?q=Masala+Library+Mumbai' },
        { name: 'Wasabi by Morimoto', location: 'Taj Mahal Palace', googleMaps: 'https://maps.google.com/?q=Wasabi+Morimoto+Mumbai' },
        { name: 'Gajalee', location: 'Vile Parle, Mumbai', googleMaps: 'https://maps.google.com/?q=Gajalee+Mumbai' },
      ],
    },
    parks: [
      { name: 'Sanjay Gandhi National Park', description: 'Large national park', googleMaps: 'https://maps.google.com/?q=Sanjay+Gandhi+National+Park+Mumbai' },
      { name: 'Hanging Gardens', description: 'Terraced gardens', googleMaps: 'https://maps.google.com/?q=Hanging+Gardens+Mumbai' },
      { name: 'Jijamata Udyan', description: 'Zoo and botanical garden', googleMaps: 'https://maps.google.com/?q=Jijamata+Udyan+Mumbai' },
    ],
    viewpoints: [
      { name: 'Marine Drive Promenade', description: 'Scenic waterfront walkway', googleMaps: 'https://maps.google.com/?q=Marine+Drive+Mumbai' },
      { name: 'Gateway of India', description: 'Iconic monument with harbor views', googleMaps: 'https://maps.google.com/?q=Gateway+of+India+Mumbai' },
      { name: 'Bandra-Worli Sea Link', description: 'Modern bridge with views', googleMaps: 'https://maps.google.com/?q=Bandra+Worli+Sea+Link+Mumbai' },
    ],
  },
};

// Get specific places for a destination dynamically from Google - NO DATABASE
const getDestinationPlaces = async (destination, moods = [], addLogFn = null) => {
  const addLog = addLogFn || ((msg, type) => console.log(msg));
  // Clear previous errors
  apiErrors = [];
  if (setApiErrorsState) {
    setApiErrorsState([]);
  }

    addLog(`🔍 Starting getDestinationPlaces for "${destination}"`, 'info');
    const apiKeyConfigured = GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY';
    addLog(`🔑 API Key configured: ${apiKeyConfigured ? '✅ Yes' : '❌ No'}`, apiKeyConfigured ? 'success' : 'error');

  try {
    addLog(`🔍 Getting main city...`, 'info');
    const city = await getMainCityForDestination(destination);
    addLog(`📍 Main city: "${city}"`, 'info');
    const moodStr = Array.isArray(moods) ? moods.join(' ') : (moods || '');
    addLog(`🎭 Mood string: "${moodStr}"`, 'info');

    // Check if API key is configured
    const apiKeyConfigured = GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY';

    if (!apiKeyConfigured) {
      // Return null so fallback can handle it
      return null;
    }

    // Ensure city matches destination for known cities (prevent Pune/other city mix-up)
    const destLower = destination.toLowerCase().trim();
    const cityLower = city.toLowerCase().trim();

    // If destination is a known city but city detection returned something else, use destination
    const knownCities = ['goa', 'pune', 'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata'];
    let finalCity = city;

    if (knownCities.includes(destLower) && cityLower !== destLower && !cityLower.includes(destLower)) {
      finalCity = destination.charAt(0).toUpperCase() + destination.slice(1);
    }

    // Fetch places with timeout protection - use Promise.all with individual catch to prevent one failure from blocking all
    // Note: Promise.allSettled is not available in all React Native versions, so we use Promise.all with catch handlers
    addLog(`🚀 Starting 6 API calls for "${destination}"`, 'info');
    addLog(`   City: "${finalCity}"`, 'info');

    const apiCallStartTime = Date.now();

    // Helper function to wrap promises with error handling
    const safePromise = async (promiseFn, name) => {
      try {
        const result = await promiseFn();
        return { status: 'fulfilled', value: result, name };
      } catch (error) {
        addLog(`❌ ${name} failed: ${error.message || error}`, 'error');
        if (error.name) addLog(`   Error type: ${error.name}`, 'error');
        return { status: 'rejected', reason: error, value: [], name };
      }
    };

    // Execute all API calls in parallel with error handling
    const results = await Promise.all([
      safePromise(() => fetchAttractions(destination, finalCity, moodStr), 'attractions'),
      safePromise(() => fetchRestaurants(destination, finalCity, 'lunch', 'budget'), 'lunch'),
      safePromise(() => fetchRestaurants(destination, finalCity, 'dinner', 'medium'), 'dinner'),
      safePromise(() => fetchShoppingAreas(destination, finalCity), 'shopping'),
      safePromise(() => fetchParks(destination, finalCity), 'parks'),
      safePromise(() => fetchViewpoints(destination, finalCity), 'viewpoints'),
    ]);

    const apiCallEndTime = Date.now();
    const apiCallDuration = apiCallEndTime - apiCallStartTime;
    addLog(`⏱️ API calls completed in ${apiCallDuration}ms`, apiCallDuration > 30000 ? 'warning' : 'success');

    // Extract status and values from results
    const statuses = {
      attractions: results[0].status,
      lunch: results[1].status,
      dinner: results[2].status,
      shopping: results[3].status,
      parks: results[4].status,
      viewpoints: results[5].status
    };

    addLog(`📊 Results:`, 'info');
    Object.entries(statuses).forEach(([name, status]) => {
      addLog(`   • ${name}: ${status === 'fulfilled' ? '✅' : '❌'}`, status === 'fulfilled' ? 'success' : 'error');
    });

    // Extract results, using value from result (which is empty array if rejected)
    const attractions = results[0].value || [];
    const lunchRestaurants = results[1].value || [];
    const dinnerRestaurants = results[2].value || [];
    const shopping = results[3].value || [];
    const parks = results[4].value || [];
    const viewpoints = results[5].value || [];

    // Log rejected promises (already logged in safePromise, but log summary)
    const rejectedCount = results.filter(r => r.status === 'rejected').length;
    if (rejectedCount > 0) {
      addLog(`⚠️ ${rejectedCount} out of 6 API calls failed`, 'warning');
    }

    addLog(`📊 Extracted results - Attractions: ${attractions.length}, Lunch: ${lunchRestaurants.length}, Dinner: ${dinnerRestaurants.length}`, 'info');


    // Process restaurants - use Google data directly
    // DEBUG: Log restaurant data to identify issues
    console.log(`🔍 DEBUG: Lunch restaurants count: ${lunchRestaurants.length}`);
    if (lunchRestaurants.length > 0) {
      console.log(`🔍 DEBUG: First lunch restaurant:`, JSON.stringify({
        name: lunchRestaurants[0].name,
        hasName: !!lunchRestaurants[0].name,
        address: lunchRestaurants[0].address,
        placeId: lunchRestaurants[0].placeId
      }, null, 2));
    }

    console.log(`🔍 DEBUG: Dinner restaurants count: ${dinnerRestaurants.length}`);
    if (dinnerRestaurants.length > 0) {
      console.log(`🔍 DEBUG: First dinner restaurant:`, JSON.stringify({
        name: dinnerRestaurants[0].name,
        hasName: !!dinnerRestaurants[0].name,
        address: dinnerRestaurants[0].address,
        placeId: dinnerRestaurants[0].placeId
      }, null, 2));
    }

    const processedLunch = lunchRestaurants.map(r => {
      // DEBUG: Check if name exists
      if (!r.name) {
        console.warn(`⚠️ Lunch restaurant missing name:`, {
          placeId: r.placeId,
          address: r.address,
          hasName: !!r.name
        });
      }
      return {
        name: r.name || 'Unknown Restaurant', // Ensure name is never undefined
        location: r.address,
        address: r.address, // Add address field explicitly
        googleMaps: r.googleMaps,
        rating: r.rating,
        ratingCount: r.ratingCount,
        estimatedCost: r.estimatedCost,
        priceLevel: r.priceLevel,
        reviews: r.reviews,
        placeId: r.placeId, // Ensure placeId is included
      };
    });

    const processedDinner = dinnerRestaurants.map(r => {
      // DEBUG: Check if name exists
      if (!r.name) {
        console.warn(`⚠️ Dinner restaurant missing name:`, {
          placeId: r.placeId,
          address: r.address,
          hasName: !!r.name
        });
      }
      return {
        name: r.name || 'Unknown Restaurant', // Ensure name is never undefined
        location: r.address,
        address: r.address, // Add address field explicitly
        googleMaps: r.googleMaps,
        rating: r.rating,
        ratingCount: r.ratingCount,
        estimatedCost: r.estimatedCost,
        priceLevel: r.priceLevel,
        reviews: r.reviews,
        placeId: r.placeId, // Ensure placeId is included
      };
    });

    // Process attractions with detailed info
    const processedAttractions = attractions.map(a => {
      // Determine type based on Google types
      let activityType = 'Sightseeing';
      if (a.types.some(t => t.includes('museum'))) activityType = 'Cultural';
      else if (a.types.some(t => t.includes('church') || t.includes('place_of_worship'))) activityType = 'Cultural';
      else if (a.types.some(t => t.includes('park'))) activityType = 'Nature';
      else if (a.types.some(t => t.includes('entertainment'))) activityType = 'Entertainment';

      // Determine moods
      const activityMoods = [];
      if (a.types.some(t => t.includes('museum') || t.includes('church'))) {
        activityMoods.push('cultural', 'historical');
      }
      if (a.types.some(t => t.includes('park'))) {
        activityMoods.push('relaxing', 'nature');
      }
      if (a.types.some(t => t.includes('shopping') || t.includes('entertainment'))) {
        activityMoods.push('social');
      }
      if (activityMoods.length === 0) activityMoods.push('cultural', 'urban');

      return {
        name: a.name,
        type: activityType,
        cost: a.estimatedCost || 0,
        googleMaps: a.googleMaps,
        moods: activityMoods,
        description: a.address,
        rating: a.rating,
        ratingCount: a.ratingCount,
        reviews: a.reviews,
        openingHours: a.openingHours,
      };
    });

    // Check if we got any data
    const hasData = processedAttractions.length > 0 || processedLunch.length > 0 || processedDinner.length > 0;

    addLog(`📊 Final results:`, 'info');
    addLog(`   • Attractions: ${processedAttractions.length}`, processedAttractions.length > 0 ? 'success' : 'warning');
    addLog(`   • Lunch: ${processedLunch.length}`, processedLunch.length > 0 ? 'success' : 'warning');
    addLog(`   • Dinner: ${processedDinner.length}`, processedDinner.length > 0 ? 'success' : 'warning');
    addLog(`   • Has data: ${hasData ? '✅ Yes' : '❌ No'}`, hasData ? 'success' : 'error');

    if (apiErrors.length > 0) {
      addLog(`⚠️ ${apiErrors.length} API errors occurred`, 'error');
      apiErrors.forEach((err, idx) => {
        if (idx < 3) { // Show first 3 errors
          addLog(`   ${idx + 1}. ${err.status}: ${err.message || 'Unknown'}`, 'error');
          if (err.query) addLog(`      Query: "${err.query}"`, 'error');
        }
      });
      if (setApiErrorsState) {
        setApiErrorsState([...apiErrors]);
      }
    }

    // Always return structure, even if empty - this prevents null destPlaces issues
    // The app can still work with empty arrays and show fallback content
    const result = {
      city: finalCity,
      attractions: processedAttractions,
      restaurants: {
        lunch: processedLunch,
        dinner: processedDinner,
      },
      shopping: shopping.map(s => ({
        name: s.name,
        description: s.address,
        googleMaps: s.googleMaps,
        rating: s.rating,
        estimatedCost: s.estimatedCost || 0,
      })),
      parks: parks.map(p => ({
        name: p.name,
        description: p.address,
        googleMaps: p.googleMaps,
        rating: p.rating,
      })),
      viewpoints: viewpoints.map(v => ({
        name: v.name,
        description: v.address,
        googleMaps: v.googleMaps,
        rating: v.rating,
      })),
    };

    if (!hasData) {
      addLog(`⚠️ No data returned - returning empty structure`, 'warning');
      addLog(`⚠️ This might indicate API timeout or network issues`, 'warning');
    }

    return result;
  } catch (error) {
    addLog(`❌ Error in getDestinationPlaces: ${error.message}`, 'error');
    addLog(`❌ Error type: ${error.name}`, 'error');
    // Return empty structure instead of null
    return {
      city: destination,
      attractions: [],
      restaurants: { lunch: [], dinner: [] },
      shopping: [],
      parks: [],
      viewpoints: []
    };
  }
};

// Generate specific activities dynamically from API
const generateGenericActivities = async (destination, moods) => {
  const moodArray = Array.isArray(moods) ? moods : (moods ? [moods] : ['relaxing']);

  try {
    // Pass moods to getDestinationPlaces to filter results by mood
    // This ensures all places are from the specified destination via Google Places API
    const places = await getDestinationPlaces(destination, moodArray);

    if (!places) {
      // Fallback if API fails
      return generateFallbackActivities(destination, moodArray);
    }

    const activities = [];

    // Add attractions - Use the type from processed attractions
    if (places.attractions && places.attractions.length > 0) {
      places.attractions.forEach(attraction => {
        activities.push({
          name: attraction.name,
          type: attraction.type || 'Sightseeing', // Use the type determined from Google types
          cost: attraction.cost || attraction.estimatedCost || 0,
          googleMaps: attraction.googleMaps,
          moods: attraction.moods || ['cultural', 'urban', 'historical'],
          description: attraction.description || attraction.address || `Visit ${attraction.name}`,
          rating: attraction.rating,
          estimatedCost: attraction.cost || attraction.estimatedCost || 0,
        });
      });
    }

    // Add parks
    if (places.parks && places.parks.length > 0) {
      places.parks.forEach(park => {
        activities.push({
          name: park.name,
          type: 'Nature',
          cost: park.estimatedCost || 0,
          googleMaps: park.googleMaps,
          moods: ['relaxing', 'nature'],
          description: park.description || park.address || `Visit ${park.name}`,
          rating: park.rating,
          estimatedCost: park.estimatedCost || 0,
        });
      });
    }

    // Add viewpoints
    if (places.viewpoints && places.viewpoints.length > 0) {
      places.viewpoints.forEach(viewpoint => {
        activities.push({
          name: viewpoint.name,
          type: 'Sightseeing',
          cost: viewpoint.estimatedCost || 0,
          googleMaps: viewpoint.googleMaps,
          moods: ['relaxing', 'nature'],
          description: viewpoint.description || viewpoint.address || `Scenic views from ${viewpoint.name}`,
          rating: viewpoint.rating,
          estimatedCost: viewpoint.estimatedCost || 0,
        });
      });
    }

    // Add shopping areas
    if (places.shopping && places.shopping.length > 0) {
      places.shopping.forEach(shop => {
        activities.push({
          name: shop.name,
          type: 'Shopping',
          cost: shop.estimatedCost || shop.cost || 0,
          googleMaps: shop.googleMaps,
          moods: shop.moods || ['social', 'shopping'],
          description: shop.description || shop.address || `Shop at ${shop.name}`,
          rating: shop.rating,
          estimatedCost: shop.estimatedCost || shop.cost || 0,
        });
      });
    }

    // Add social activities if social mood is selected
    if (moodArray.includes('social') && places.social && places.social.length > 0) {
      places.social.forEach(socialPlace => {
        activities.push({
          name: socialPlace.name,
          type: socialPlace.type || 'Entertainment',
          cost: socialPlace.cost || 0,
          googleMaps: socialPlace.googleMaps,
          moods: socialPlace.moods || ['social'],
          description: socialPlace.description || socialPlace.address || `Visit ${socialPlace.name}`
        });
      });
    }

    // If no activities found, use fallback
    if (activities.length === 0) {
      return generateFallbackActivities(destination, moodArray);
    }

    // Filter by moods if provided
    if (moodArray && moodArray.length > 0) {
      const filtered = activities.filter(activity =>
        activity.moods && activity.moods.some(mood => moodArray.includes(mood))
      );
      // If filtering removes all activities, return all activities (show everything)
      return filtered.length > 0 ? filtered : activities;
    }

    return activities;
  } catch (error) {
    console.error('Error generating activities:', error);
    return generateFallbackActivities(destination, moodArray);
  }
};

// NO HARDCODED DATA - Everything comes from Google Places API
// If API is not available, fallback uses Google Maps search URLs only (no hardcoded place names)

// Fallback activities if API fails - Uses Google Maps search (no hardcoded data)
// NOTE: This fallback does NOT provide specific place names - it only provides search links
// To get specific place names, Google Places API key MUST be configured
const generateFallbackActivities = (destination, moodArray) => {
  const destName = destination.split(',')[0].trim();
  const city = destination.split(',')[0].trim();


  // Generate activities using Google Maps search URLs - no hardcoded data
  // These will show generic categories, not specific place names
  const activities = [];

  if (moodArray.includes('cultural')) {
    activities.push(
      { name: `Historical Sites - ${city}`, type: 'Cultural', cost: 0, googleMaps: `https://maps.google.com/?q=${encodeURIComponent(city + ' historical sites')}`, moods: ['cultural', 'historical'], description: `Explore historical landmarks in ${city}. Use the map link to find specific places.` },
      { name: `Museums - ${city}`, type: 'Cultural', cost: 0, googleMaps: `https://maps.google.com/?q=${encodeURIComponent(city + ' museums')}`, moods: ['cultural'], description: `Visit museums to learn about local culture. Use the map link to find specific museums.` },
      { name: `Churches & Temples - ${city}`, type: 'Cultural', cost: 0, googleMaps: `https://maps.google.com/?q=${encodeURIComponent(city + ' churches')}`, moods: ['cultural'], description: `Experience local religious heritage. Use the map link to find specific places.` },
    );
  }

  if (moodArray.includes('social')) {
    activities.push(
      { name: `Shopping Malls - ${city}`, type: 'Shopping', cost: 0, googleMaps: `https://maps.google.com/?q=${encodeURIComponent(city + ' shopping malls')}`, moods: ['social', 'shopping'], description: `Shop and explore local markets. Use the map link to find specific shopping areas.` },
      { name: `Entertainment Areas - ${city}`, type: 'Entertainment', cost: 0, googleMaps: `https://maps.google.com/?q=${encodeURIComponent(city + ' entertainment')}`, moods: ['social'], description: `Enjoy nightlife and social activities. Use the map link to find specific venues.` },
      { name: `Popular Places - ${city}`, type: 'Sightseeing', cost: 0, googleMaps: `https://maps.google.com/?q=${encodeURIComponent(city + ' popular places')}`, moods: ['social', 'urban'], description: `Visit must-see attractions. Use the map link to find specific places.` },
    );
  }

  if (moodArray.includes('nature') || moodArray.includes('relaxing')) {
    activities.push(
      { name: `Parks - ${city}`, type: 'Nature', cost: 0, googleMaps: `https://maps.google.com/?q=${encodeURIComponent(city + ' parks')}`, moods: ['relaxing', 'nature'], description: `Relax in beautiful parks. Use the map link to find specific parks.` },
      { name: `Scenic Viewpoints - ${city}`, type: 'Sightseeing', cost: 0, googleMaps: `https://maps.google.com/?q=${encodeURIComponent(city + ' viewpoints')}`, moods: ['relaxing', 'nature'], description: `Enjoy scenic views. Use the map link to find specific viewpoints.` },
    );
  }

  // If no specific mood or no activities generated, add general ones
  if (activities.length === 0) {
    activities.push(
      { name: `Tourist Attractions - ${city}`, type: 'Sightseeing', cost: 0, googleMaps: `https://maps.google.com/?q=${encodeURIComponent(city + ' tourist attractions')}`, moods: ['cultural', 'urban'], description: `Explore popular attractions. Use the map link to find specific places.` },
      { name: `Must Visit Places - ${city}`, type: 'Sightseeing', cost: 0, googleMaps: `https://maps.google.com/?q=${encodeURIComponent(city + ' must visit')}`, moods: ['cultural'], description: `Visit top-rated places. Use the map link to find specific places.` },
    );
  }

  return activities;
};

// Location-specific sightseeing activities with mood tags - Now uses API with fallback
const getSightseeingActivities = async (destination, moods) => {
  const moodArray = Array.isArray(moods) ? moods : (moods ? [moods] : []);

  try {
    // Use API to fetch activities dynamically
    const activities = await generateGenericActivities(destination, moods);

    // Always return activities - use fallback if API returns empty
    if (activities && activities.length > 0) {
      return activities;
    }

    // If API returns empty, use fallback
    return generateFallbackActivities(destination, moodArray);
  } catch (error) {
    console.error('Error fetching sightseeing activities:', error);
    // Use fallback instead of empty array
    return generateFallbackActivities(destination, moodArray);
  }

  // REMOVED: All hardcoded activities - NO HARDCODED DATA ALLOWED
  // All activities must come from Google Places API only
  // This entire legacy database has been removed
  // If API fails, use generateFallbackActivities which only provides Google Maps search URLs
  // NO HARDCODED DATA - Function ends here
  // REMOVED: All hardcoded activities database
  // This function now ONLY uses Google Places API via generateGenericActivities
  // No hardcoded data will be returned
};

// Generate itinerary based on filters - Now async and uses API
const generateItinerary = async (filters) => {
  try {
    console.log('🔍 DEBUG generateItinerary: Starting with filters:', filters);

    // Extract all filters with validation
    const {
      destination,
      startDate,
      endDate,
      days,
      numPeople,
      budget,
      moods,
      currency
    } = filters;

    // Validate required fields
    if (!destination || !destination.trim()) {
      throw new Error('Destination is required');
    }

  if (!startDate || !endDate) {
    throw new Error('Start date and end date are required');
  }

  if (!days || days < 1) {
    throw new Error('Days must be at least 1');
  }

  if (!numPeople || numPeople < 1) {
    throw new Error('Number of people must be at least 1');
  }

  if (!budget || budget <= 0) {
    throw new Error('Budget must be greater than 0');
  }

  // Normalize destination - ensure it's a string and trimmed
  const normalizedDestination = String(destination).trim();
  if (!normalizedDestination) {
    throw new Error('Invalid destination');
  }

  // Normalize moods - ensure it's an array
  const normalizedMoods = Array.isArray(moods) ? moods : (moods ? [moods] : ['relaxing']);

  // Currency handling
  const currencyInfo = CURRENCY_MAP[currency] || CURRENCY_MAP.DEFAULT;
  const symbol = currencyInfo.symbol;

  // Date handling - ensure dates are valid
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid dates provided');
  }

  // Calculate per person budget
  const perPersonBudget = budget / numPeople;
  const dest = normalizedDestination.toLowerCase();

  console.log('\n📋 Generating Itinerary with Filters:');
  console.log(`   Destination: ${normalizedDestination}`);
  console.log(`   Days: ${days}`);
  console.log(`   People: ${numPeople}`);
  console.log(`   Budget: ${symbol}${budget.toLocaleString()} (${symbol}${perPersonBudget.toLocaleString()} per person)`);
  console.log(`   Moods: ${normalizedMoods.join(', ')}`);
  console.log(`   Dates: ${start.toDateString()} to ${end.toDateString()}`);

  // Get location-specific data filtered by mood - Now async
  // All data comes from Google APIs using the destination
  const accommodations = getAccommodations(normalizedDestination, days, numPeople, budget, currency);
  let sightseeingOptions = [];
  let destinationPlaces = null;

  // Fetch sightseeing activities from Google Places API - filtered by destination and mood
  try {
    console.log(`\n📍 Fetching sightseeing activities for: ${normalizedDestination} (moods: ${normalizedMoods.join(', ')})`);
    sightseeingOptions = await getSightseeingActivities(normalizedDestination, normalizedMoods);
    if (!Array.isArray(sightseeingOptions)) {
      sightseeingOptions = [];
    }
    console.log(`✅ Found ${sightseeingOptions.length} sightseeing options`);
  } catch (error) {
    console.error('Error fetching sightseeing options:', error);
    sightseeingOptions = [];
  }

  // Fetch destination places for restaurants, shopping, etc. - Pass moods for better filtering
  // This ensures all places are from the specified destination via Google Places API
  // Note: We'll pass addDebugLog function if available, but for now we'll store logs in _debug
  const debugMessages = [];
  const addLog = (msg, type = 'info') => {
    debugMessages.push({ message: msg, type, timestamp: new Date().toLocaleTimeString() });
    console.log(msg);
  };

  try {
    addLog(`📍 Fetching places (restaurants, parks, etc.) for: ${normalizedDestination} (moods: ${normalizedMoods.join(', ')})`, 'info');
    addLog(`🔍 About to call getDestinationPlaces...`, 'info');

    const startTime = Date.now();
    destinationPlaces = await getDestinationPlaces(normalizedDestination, normalizedMoods, addLog);
    const endTime = Date.now();
    const duration = endTime - startTime;

    addLog(`✅ getDestinationPlaces completed in ${duration}ms`, duration > 10000 ? 'warning' : 'success');
    addLog(`📊 destinationPlaces type: ${typeof destinationPlaces}`, 'info');
    addLog(`📊 destinationPlaces is null: ${destinationPlaces === null}`, destinationPlaces === null ? 'error' : 'info');
    addLog(`📊 destinationPlaces is undefined: ${destinationPlaces === undefined}`, destinationPlaces === undefined ? 'error' : 'info');

    if (destinationPlaces) {
      const attCount = destinationPlaces.attractions?.length || 0;
      const lunchCount = destinationPlaces.restaurants?.lunch?.length || 0;
      const dinnerCount = destinationPlaces.restaurants?.dinner?.length || 0;
      addLog(`✅ Found ${attCount} attractions, ${lunchCount} lunch restaurants, ${dinnerCount} dinner restaurants`,
        (attCount > 0 || lunchCount > 0 || dinnerCount > 0) ? 'success' : 'warning');
      addLog(`📊 Full destinationPlaces structure:`, 'info');
      const structureInfo = {
        hasAttractions: !!destinationPlaces.attractions,
        attractionsLength: destinationPlaces.attractions?.length || 0,
        hasRestaurants: !!destinationPlaces.restaurants,
        hasLunch: !!destinationPlaces.restaurants?.lunch,
        lunchLength: destinationPlaces.restaurants?.lunch?.length || 0,
        hasDinner: !!destinationPlaces.restaurants?.dinner,
        dinnerLength: destinationPlaces.restaurants?.dinner?.length || 0,
        hasParks: !!destinationPlaces.parks,
        parksLength: destinationPlaces.parks?.length || 0,
        hasViewpoints: !!destinationPlaces.viewpoints,
        viewpointsLength: destinationPlaces.viewpoints?.length || 0,
      };
      addLog(`   • Attractions: ${structureInfo.attractionsLength}`, structureInfo.attractionsLength > 0 ? 'success' : 'warning');
      addLog(`   • Lunch: ${structureInfo.lunchLength}`, structureInfo.lunchLength > 0 ? 'success' : 'warning');
      addLog(`   • Dinner: ${structureInfo.dinnerLength}`, structureInfo.dinnerLength > 0 ? 'success' : 'warning');
      addLog(`   • Parks: ${structureInfo.parksLength}`, structureInfo.parksLength > 0 ? 'success' : 'warning');
      addLog(`   • Viewpoints: ${structureInfo.viewpointsLength}`, structureInfo.viewpointsLength > 0 ? 'success' : 'warning');

      // DEBUG: Log detailed restaurant info
      if (destinationPlaces.restaurants?.lunch?.length > 0) {
        const firstLunch = destinationPlaces.restaurants.lunch[0];
        addLog(`✅ First lunch: "${firstLunch.name}" (has name: ${!!firstLunch.name})`, 'success');
        if (firstLunch.address) addLog(`   Address: ${firstLunch.address.substring(0, 60)}...`, 'info');
      } else {
        addLog(`⚠️ No lunch restaurants found`, 'warning');
      }

      if (destinationPlaces.restaurants?.dinner?.length > 0) {
        const firstDinner = destinationPlaces.restaurants.dinner[0];
        addLog(`✅ First dinner: "${firstDinner.name}" (has name: ${!!firstDinner.name})`, 'success');
        if (firstDinner.address) addLog(`   Address: ${firstDinner.address.substring(0, 60)}...`, 'info');
      } else {
        addLog(`⚠️ No dinner restaurants found`, 'warning');
      }

      // DEBUG: Log attractions info
      if (destinationPlaces.attractions?.length > 0) {
        addLog(`✅ First attraction: "${destinationPlaces.attractions[0].name}"`, 'success');
      } else {
        addLog(`⚠️ No attractions found`, 'warning');
      }
      if (destinationPlaces.parks?.length > 0) {
        addLog(`✅ First park: "${destinationPlaces.parks[0].name}"`, 'success');
      }
      if (destinationPlaces.viewpoints?.length > 0) {
        addLog(`✅ First viewpoint: "${destinationPlaces.viewpoints[0].name}"`, 'success');
      }
    } else {
      addLog(`❌ ERROR: destinationPlaces is null or undefined`, 'error');
      addLog(`❌ This should not happen - getDestinationPlaces should always return a structure`, 'error');
    }
  } catch (error) {
    addLog(`❌ ERROR fetching destination places: ${error.message}`, 'error');
    addLog(`❌ Error type: ${error.name}`, 'error');
    if (error.stack) {
      addLog(`❌ Stack: ${error.stack.substring(0, 200)}...`, 'error');
    }
    // Return empty structure instead of null
    destinationPlaces = {
      city: normalizedDestination,
      attractions: [],
      restaurants: { lunch: [], dinner: [] },
      shopping: [],
      parks: [],
      viewpoints: []
    };
  }

  // Get main city from API response or use destination as fallback
  const mainCity = destinationPlaces?.city || normalizedDestination;

  // Log for debugging - CRITICAL for troubleshooting

    // Create itinerary structure with all filter data
  const itinerary = {
    destination: normalizedDestination.charAt(0).toUpperCase() + normalizedDestination.slice(1),
    mainCity: mainCity,
    startDate: start,
    endDate: end,
    days: days,
    numPeople: numPeople,
    budget: budget,
    perPersonBudget: perPersonBudget,
    currency: symbol,
    moods: normalizedMoods, // Store moods for reference
    accommodations: accommodations,
    daysPlan: [],
    _debug: {
      destinationPlaces: destinationPlaces, // Store for debug purposes
      sightseeingOptions: sightseeingOptions,
      debugLogs: debugMessages, // Store debug logs for UI display
    },
  };

  // Helper function to get activities by type from filtered options
  const getActivitiesByType = (options, types, count = 1) => {
    return options.filter(opt => types.includes(opt.type)).slice(0, count);
  };

  // Helper function to get specific restaurant - Now async with detailed info
  const getSpecificRestaurant = async (mealType, destination, moodsParam = []) => {
    const places = await getDestinationPlaces(destination, moodsParam);
    if (places && places.restaurants && places.restaurants[mealType] && places.restaurants[mealType].length > 0) {
      const restaurants = places.restaurants[mealType];
      // Select restaurant based on meal type (budget for lunch, better for dinner)
      let selected;
      if (mealType === 'lunch') {
        // For lunch, prefer affordable options
        selected = restaurants.find(r => r.priceLevel <= 2) || restaurants[0];
      } else {
        // For dinner, prefer higher rated
        selected = restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      }

      return {
        name: selected.name,
        location: selected.location,
        googleMaps: selected.googleMaps,
        rating: selected.rating,
        estimatedCost: selected.estimatedCost,
        priceLevel: selected.priceLevel,
      };
    }

    // Fallback: Return null so the code can use generic text with city name
    return null;
  };

  // Generate detailed descriptions for activities
  const generateActivityDescription = (activity, type, mood = '', cityNameParam = null) => {
    if (activity.description && activity.description.length > 50) {
      return activity.description;
    }

    const cityName = cityNameParam || mainCity || destination;

    // Generate contextual descriptions based on type and mood
    if (type === 'Cultural' || activity.type === 'Cultural') {
      if (activity.name.toLowerCase().includes('museum')) {
        return `Explore ${activity.name} - Learn about local history and culture. ${activity.rating ? `Highly rated (${activity.rating}/5)` : ''}`;
      } else if (activity.name.toLowerCase().includes('church') || activity.name.toLowerCase().includes('temple')) {
        return `Visit ${activity.name} - Experience local religious and architectural heritage.`;
      } else {
        return `Discover ${activity.name} - Important cultural landmark showcasing local heritage.`;
      }
    } else if (type === 'Nature' || activity.type === 'Nature') {
      return `Visit ${activity.name} - Beautiful natural space perfect for relaxation and photos.`;
    } else if (type === 'Shopping' || activity.type === 'Shopping') {
      if (activity.name.toLowerCase().includes('market')) {
        return `Explore ${activity.name} - Experience local life, shop for souvenirs, and try street food.`;
      } else {
        return `Shop at ${activity.name} - Popular shopping destination with local and international brands.`;
      }
    } else if (type === 'Entertainment' || activity.type === 'Entertainment') {
      return `Enjoy ${activity.name} - Great place for socializing and experiencing local nightlife.`;
    } else {
      return `Visit ${activity.name} - Must-see attraction in ${cityName}. ${activity.rating ? `Highly rated (${activity.rating}/5)` : ''}`;
    }
  };

  // Helper function to detect area/region from place address or name (e.g., North Goa, South Goa)
  const detectAreaFromAddress = (place, destination) => {
    const address = place.address || place.location || '';
    const name = place.name || '';
    const addressLower = address.toLowerCase();
    const nameLower = name.toLowerCase();
    const destLower = destination.toLowerCase();

    // Goa-specific area detection
    if (destLower.includes('goa')) {
      const northGoaKeywords = ['north goa', 'calangute', 'baga', 'anjuna', 'candolim', 'sinquerim', 'arambol', 'morjim', 'ashwem', 'vagator', 'fort aguada', 'chapora'];
      const southGoaKeywords = ['south goa', 'margao', 'colva', 'benaulim', 'varca', 'cavelossim', 'palolem', 'agonda', 'patnem', 'canacona', 'dudhsagar', 'old goa'];

      const searchText = `${addressLower} ${nameLower}`;

      if (northGoaKeywords.some(keyword => searchText.includes(keyword))) {
        return 'North Goa';
      }
      if (southGoaKeywords.some(keyword => searchText.includes(keyword))) {
        return 'South Goa';
      }
    }

    // Add more destination-specific area detection here
    // For now, return null if area cannot be determined
    return null;
  };

  // Helper function to group places by area
  const groupPlacesByArea = (places, destination) => {
    const grouped = {
      'North Goa': [],
      'South Goa': [],
      'Central': [],
      'Other': []
    };

    places.forEach(place => {
      const area = detectAreaFromAddress(place, destination);
      if (area && grouped[area]) {
        grouped[area].push(place);
      } else {
        grouped['Other'].push(place);
      }
    });

    // Remove empty groups
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });

    return grouped;
  };

  // Helper function to shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Helper function to get places for a specific day (distribute across days with randomization)
  const getPlacesForDay = (allPlaces, dayIndex, totalDays, destination) => {
    if (allPlaces.length === 0) return [];

    // Create a copy and shuffle for variety (but maintain some order for consistency)
    // Use dayIndex as seed for pseudo-randomization to ensure different results per day
    const placesCopy = [...allPlaces];

    // Shuffle with a seed based on dayIndex to get different order each day
    const seed = dayIndex * 7 + 13; // Simple seed for pseudo-randomization
    const shuffledPlaces = placesCopy.sort((a, b) => {
      const hashA = (a.placeId || a.name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hashB = (b.placeId || b.name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return ((hashA + seed) % 1000) - ((hashB + seed) % 1000);
    });

    // Group places by area
    const groupedByArea = groupPlacesByArea(shuffledPlaces, destination);
    const areas = Object.keys(groupedByArea);

    // If we have multiple areas, assign different areas to different days
    if (areas.length > 1 && areas.length <= totalDays) {
      // Assign one area per day (round-robin)
      const areaForDay = areas[dayIndex % areas.length];
      const placesInArea = groupedByArea[areaForDay] || [];

      // Shuffle places within area for variety
      const shuffledAreaPlaces = shuffleArray(placesInArea);

      // Get 4-6 places from this area for the day
      if (shuffledAreaPlaces.length >= 4) {
        return shuffledAreaPlaces.slice(0, 6);
      } else if (shuffledAreaPlaces.length >= 2) {
        // Supplement with a few places from next area if needed
        const nextAreaIndex = (dayIndex + 1) % areas.length;
        const nextArea = areas[nextAreaIndex];
        const nextAreaPlaces = groupedByArea[nextArea] || [];
        const shuffledNextArea = shuffleArray(nextAreaPlaces);
        return [...shuffledAreaPlaces, ...shuffledNextArea.slice(0, 2)].slice(0, 6);
      } else {
        return shuffledAreaPlaces;
      }
    }

    // If no area grouping or more days than areas, distribute places evenly across days
    // This ensures each day gets DIFFERENT places
    // Calculate how many places per day - ensure at least 3-4 places per day
    const totalPlaces = shuffledPlaces.length;
    const placesPerDay = Math.max(4, Math.ceil(totalPlaces / totalDays));

    // Calculate start and end indices for this specific day
    const startIndex = dayIndex * placesPerDay;
    const endIndex = Math.min(startIndex + placesPerDay, totalPlaces);

    // Get unique places for this day (slice ensures different places each day)
    let dayPlaces = shuffledPlaces.slice(startIndex, endIndex);

    // If we don't have enough places for this day, get remaining unused places
    if (dayPlaces.length < 3) {
      // Get places that come after this day's range
      const remainingPlaces = shuffledPlaces.slice(endIndex);
      if (remainingPlaces.length > 0) {
        const needed = Math.min(3 - dayPlaces.length, remainingPlaces.length);
        dayPlaces = [...dayPlaces, ...remainingPlaces.slice(0, needed)];
      }
    }

    // Ensure we return at least some places (even if it means some overlap on last day)
    if (dayPlaces.length === 0 && shuffledPlaces.length > 0) {
      // Last resort: get places starting from a different offset
      const offset = (dayIndex * 3) % shuffledPlaces.length;
      dayPlaces = shuffledPlaces.slice(offset, offset + Math.min(4, shuffledPlaces.length - offset));
    }

    return dayPlaces.slice(0, 6); // Return max 6 places per day
  };

  // Helper function to filter places by mood
  const filterPlacesByMood = (places, moods) => {
    if (!moods || moods.length === 0) return places;

    const moodArray = Array.isArray(moods) ? moods : [moods];

    return places.filter(place => {
      // Check place types against mood
      const placeTypes = place.types || [];
      const placeMoods = place.moods || [];

      // Map moods to place types
      const moodToTypes = {
        'social': ['night_club', 'bar', 'cafe', 'shopping_mall', 'entertainment', 'amusement_park'],
        'food': ['restaurant', 'cafe', 'bar', 'food', 'meal_takeaway', 'bakery'],
        'nature': ['park', 'beach', 'natural_feature', 'zoo', 'aquarium', 'campground'],
        'cultural': ['museum', 'church', 'temple', 'place_of_worship', 'art_gallery', 'library', 'historical_site'],
        'urban': ['shopping_mall', 'city_hall', 'subway_station', 'bus_station', 'shopping_center'],
        'relaxation': ['spa', 'park', 'beach', 'resort', 'hotel', 'natural_feature'],
        'relaxing': ['spa', 'park', 'beach', 'resort', 'hotel', 'natural_feature']
      };

      // Check if place matches any selected mood
      return moodArray.some(mood => {
        const moodLower = mood.toLowerCase();

        // Check place moods
        if (placeMoods.some(pm => pm.toLowerCase().includes(moodLower))) {
          return true;
        }

        // Check place types
        const typesForMood = moodToTypes[moodLower] || [];
        if (typesForMood.some(type => placeTypes.some(pt => pt.includes(type)))) {
          return true;
        }

        // Check place name/description for mood keywords
        const nameLower = (place.name || '').toLowerCase();
        const descLower = (place.description || place.address || '').toLowerCase();

        if (moodLower === 'social' && (nameLower.includes('club') || nameLower.includes('bar') || nameLower.includes('nightlife'))) {
          return true;
        }
        if (moodLower === 'food' && (nameLower.includes('restaurant') || nameLower.includes('cafe') || nameLower.includes('bar') || nameLower.includes('food'))) {
          return true;
        }
        if (moodLower === 'nature' && (nameLower.includes('beach') || nameLower.includes('park') || nameLower.includes('sanctuary') || nameLower.includes('waterfall'))) {
          return true;
        }
        if (moodLower === 'cultural' && (nameLower.includes('museum') || nameLower.includes('temple') || nameLower.includes('church') || nameLower.includes('fort'))) {
          return true;
        }

        return false;
      });
    });
  };

  // Location-specific activity templates - Now async with detailed descriptions
  // Restructured to use section headings: Morning, Lunch, Afternoon, Dinner, etc.
  const getLocationActivities = async (dest, dayType, sightseeingOptions, dayIndex = 0, totalDays = 1, destPlaces = null, selectedMoods = [], usedPlaceIds = new Set(), mainCityParam = null, destinationParam = null) => {
    try {
      const activities = [];
      const destLower = dest.toLowerCase();
      const isCultural = selectedMoods && (selectedMoods.includes('cultural') || selectedMoods.some(m => m.includes('cultural')));
      const isSocial = selectedMoods && (selectedMoods.includes('social') || selectedMoods.some(m => m.includes('social')));

      // Use passed parameters or fallback to destPlaces or dest
      const cityName = mainCityParam || destPlaces?.city || dest || 'the destination';
      const destName = destinationParam || dest || 'the destination';

    if (dayType === 'first') {
      // FIRST DAY FORMAT: Arrive, Check-in, Lunch, Sightseeing/Places to visit, Dinner
      // FIRST DAY FORMAT: Arrive, Check-in, Lunch, Sightseeing/Places to visit, Dinner

      // Section: Morning - Arrive
      activities.push({
        time: 'Morning',
        title: 'Morning',
        description: '',
        type: 'Section',
        cost: 0,
        places: [{
          name: `Arrive ${cityName}`,
          description: `${cityName} airport`,
          googleMaps: `https://maps.google.com/?q=${encodeURIComponent(cityName + ' airport')}`
        }, {
          name: 'Check-in at accommodation',
          description: 'Accommodation',
        }]
      });

      // Add specific lunch restaurant with detailed info (different restaurant each day)
      // Filter out restaurants already used in previous days
      const lunchRestaurants = destPlaces?.restaurants?.lunch || [];
      console.log(`🔍 DEBUG Day ${dayIndex + 1}: Lunch restaurants available: ${lunchRestaurants.length}`);

      if (lunchRestaurants.length > 0) {
        console.log(`🔍 DEBUG: Sample lunch restaurant:`, {
          name: lunchRestaurants[0].name,
          hasName: !!lunchRestaurants[0].name,
          location: lunchRestaurants[0].location,
          address: lunchRestaurants[0].address
        });
      }

      const unusedLunchRestaurants = lunchRestaurants.filter(r => {
        const restaurantId = r.placeId || r.name;
        return !usedPlaceIds.has(restaurantId);
      });
      // Use unused restaurants first, then fall back to all restaurants if needed
      const availableLunch = unusedLunchRestaurants.length > 0 ? unusedLunchRestaurants : lunchRestaurants;

      // Select restaurant by day index directly (no shuffle) to match API order
      // For day 1 (dayIndex 0), use first restaurant from API; for day 2, use second, etc.
      // This ensures the displayed restaurant matches what's in destPlaces
      // IMPORTANT: Use dayIndex directly to ensure first day gets first restaurant from API
      let lunchRestaurant = availableLunch[dayIndex] || availableLunch[0];

      // If selected restaurant doesn't have a name, try to find one that does
      if (!lunchRestaurant || !lunchRestaurant.name || lunchRestaurant.name.trim() === '') {
        lunchRestaurant = availableLunch.find(r => r && r.name && r.name.trim() !== '') ||
                         lunchRestaurants.find(r => r && r.name && r.name.trim() !== '');
      }

      console.log(`🔍 DEBUG Day ${dayIndex + 1}: Selected lunch restaurant:`, {
        name: lunchRestaurant?.name,
        hasName: !!lunchRestaurant?.name,
        location: lunchRestaurant?.location,
        address: lunchRestaurant?.address,
        fromArray: lunchRestaurants.length > 0 ? 'yes' : 'no'
      });

      // Section: Lunch - Add multiple restaurant options
      const lunchPlaces = [];
      if (lunchRestaurant && lunchRestaurant.name && lunchRestaurant.name.trim() !== '') {
        const cost = lunchRestaurant.estimatedCost || 250;
        const restaurantId = lunchRestaurant.placeId || lunchRestaurant.name;
        usedPlaceIds.add(restaurantId);
        lunchPlaces.push({
          name: lunchRestaurant.name, // Always use actual name from API
          description: lunchRestaurant.location || cityName,
          cost: cost,
          googleMaps: lunchRestaurant.googleMaps
        });

        // Add 1-2 more restaurant options if available
        const additionalRestaurants = availableLunch.filter(r => {
          const rId = r.placeId || r.name;
          return rId !== restaurantId && !usedPlaceIds.has(rId);
        }).slice(0, 2);

        additionalRestaurants.forEach(rest => {
          if (rest && rest.name) { // Only add if restaurant has a name
            const rId = rest.placeId || rest.name;
            usedPlaceIds.add(rId);
            lunchPlaces.push({
              name: rest.name, // Always use actual name from API
              description: rest.location || cityName,
              cost: rest.estimatedCost || 250,
              googleMaps: rest.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(rest.name + ' ' + cityName)}`
            });
          }
        });
      }

      // Only add fallback if no restaurants were found
      if (lunchPlaces.length === 0) {
        // Try to get any restaurant from available list (check all restaurants, not just unused)
        const allLunchRestaurants = destPlaces?.restaurants?.lunch || [];
        const anyRestaurant = allLunchRestaurants.find(r => r && r.name && r.name.trim() !== '');

        if (anyRestaurant) {
          lunchPlaces.push({
            name: anyRestaurant.name,
            description: anyRestaurant.location || anyRestaurant.address || cityName,
            cost: anyRestaurant.estimatedCost || 250,
            googleMaps: anyRestaurant.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(anyRestaurant.name + ' ' + cityName)}`
          });
        } else if (allLunchRestaurants.length > 0) {
          // If we have restaurants but they don't have names, use the first one and try to get name from address
          const firstRestaurant = allLunchRestaurants[0];
          const restaurantName = firstRestaurant.name ||
                                 (firstRestaurant.address ? firstRestaurant.address.split(',')[0] : null) ||
                                 `Restaurant in ${cityName}`;
          lunchPlaces.push({
            name: restaurantName,
            description: firstRestaurant.location || firstRestaurant.address || cityName,
            cost: firstRestaurant.estimatedCost || 250,
            googleMaps: firstRestaurant.googleMaps || `https://maps.google.com/?q=restaurants+${encodeURIComponent(cityName)}`
          });
        } else {
          // Last resort fallback - only use if absolutely no restaurant data available
          lunchPlaces.push({
            name: `Restaurant in ${cityName}`,
            description: cityName,
            cost: 250,
            googleMaps: `https://maps.google.com/?q=restaurants+${encodeURIComponent(cityName)}`
          });
        }
      }

      activities.push({
        time: 'Lunch',
        title: 'Lunch',
        description: '',
        type: 'Section',
        cost: lunchPlaces[0]?.cost || 250,
        places: lunchPlaces
      });

      // Group activities by type and show specific place names
      // ALWAYS show activities - this is critical for user experience
      // CRITICAL: ALWAYS prioritize destPlaces (actual API data) FIRST before checking sightseeingOptions
      // This ensures we use actual place names instead of fallback activities like "Parks - Kerala"
      const hasRealDestPlaces = destPlaces && (
        (destPlaces.attractions && destPlaces.attractions.length > 0) ||
        (destPlaces.parks && destPlaces.parks.length > 0) ||
        (destPlaces.viewpoints && destPlaces.viewpoints.length > 0) ||
        (destPlaces.shopping && destPlaces.shopping.length > 0)
      );

      console.log(`🔍 DEBUG Day ${dayIndex + 1}: hasRealDestPlaces: ${hasRealDestPlaces}`);
      if (destPlaces) {
        console.log(`🔍 DEBUG: destPlaces has ${destPlaces.attractions?.length || 0} attractions, ${destPlaces.parks?.length || 0} parks, ${destPlaces.viewpoints?.length || 0} viewpoints`);
      }

      // Check if sightseeingOptions contains fallback activities (generic names like "Parks -", "Historical Sites -")
      const hasFallbackActivities = sightseeingOptions && Array.isArray(sightseeingOptions) &&
        sightseeingOptions.some(opt => opt && opt.name && (
          opt.name.includes(' - ') ||
          opt.name.includes('Parks -') ||
          opt.name.includes('Scenic Viewpoints -') ||
          opt.name.includes('Historical Sites -') ||
          opt.name.includes('Museums -') ||
          opt.name.includes('Churches & Temples -') ||
          opt.name.includes('Shopping Malls -') ||
          opt.name.includes('Entertainment Areas -') ||
          opt.name.includes('Tourist Attractions -') ||
          opt.name.includes('Must Visit Places -') ||
          opt.name.includes('Popular Places -')
        ));

      // SKIP sightseeingOptions entirely if we have real destPlaces data OR if sightseeingOptions has fallback activities
      const shouldUseDestPlaces = hasRealDestPlaces || hasFallbackActivities;

      if (!shouldUseDestPlaces && sightseeingOptions && Array.isArray(sightseeingOptions) && sightseeingOptions.length > 0) {
        // Filter places for this specific day (different places each day)
        // IMPORTANT: Get different places for each day to avoid repetition
        let placesForThisDay = getPlacesForDay(sightseeingOptions, dayIndex, totalDays, dest);

        // Filter out already used places to ensure uniqueness across days
        placesForThisDay = placesForThisDay.filter(place => {
          const placeId = place.placeId || place.name;
          return !usedPlaceIds.has(placeId);
        });

        // If we filtered out too many, get more places for this day
        if (placesForThisDay.length < 3 && sightseeingOptions.length > 0) {
          const unusedPlaces = sightseeingOptions.filter(place => {
            const placeId = place.placeId || place.name;
            return !usedPlaceIds.has(placeId);
          });

          const placesPerDay = Math.max(3, Math.ceil(unusedPlaces.length / (totalDays - dayIndex)));
          const additionalPlaces = unusedPlaces.slice(0, placesPerDay);
          placesForThisDay = [...placesForThisDay, ...additionalPlaces].slice(0, 6);
        }

        // Filter by mood if provided
        const moodFilteredPlaces = selectedMoods && selectedMoods.length > 0
          ? filterPlacesByMood(placesForThisDay, selectedMoods)
          : placesForThisDay;

        // Group activities by type
        const groupedActivities = {};
        moodFilteredPlaces.forEach(activity => {
          const type = activity.type || 'Sightseeing';
          if (!groupedActivities[type]) {
            groupedActivities[type] = [];
          }
          groupedActivities[type].push(activity);
        });

        // Group all places for "Sightseeing/Places to visit" section
        const sightseeingPlaces = [];
        const activityTypes = Object.keys(groupedActivities);

        activityTypes.forEach(type => {
          const typeActivities = groupedActivities[type].slice(0, 5);
          typeActivities.forEach(place => {
            const placeId = place.placeId || place.name;
            if (!usedPlaceIds.has(placeId)) {
              // Extract name from multiple possible sources
              const placeName = place.name ||
                               (place.address ? place.address.split(',')[0].trim() : null) ||
                               place.location ||
                               place.description ||
                               `Attraction in ${cityName}`;
              sightseeingPlaces.push({
                name: placeName,
                description: place.address || place.location || place.description || cityName,
                cost: place.cost || place.estimatedCost || 0,
                googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent((placeName || 'attraction') + ' ' + cityName)}`,
                type: place.type || 'Sightseeing'
              });
              usedPlaceIds.add(placeId);
              if (place.name) usedPlaceIds.add(place.name);
            }
          });
        });

        // Limit to 3-4 places for first day - ensure we have specific place names
        const selectedPlaces = sightseeingPlaces.slice(0, 4);

        // Ensure at least 1 place is shown
        if (selectedPlaces.length === 0 && destPlaces?.attractions && destPlaces.attractions.length > 0) {
          const firstPlace = destPlaces.attractions[0];
          selectedPlaces.push({
            name: firstPlace.name,
            description: firstPlace.address || firstPlace.location || firstPlace.description || cityName,
            cost: firstPlace.cost || 0,
            googleMaps: firstPlace.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(firstPlace.name + ' ' + cityName)}`
          });
        }

        if (selectedPlaces.length > 0) {
          const totalCost = selectedPlaces.reduce((sum, p) => sum + (p.cost || 0), 0);
          activities.push({
            time: 'Afternoon',
            title: 'Afternoon',
            description: '',
            type: 'Section',
            cost: totalCost,
            places: selectedPlaces
          });
        } else {
          // Fallback - try to get places from destPlaces if available
          const fallbackPlaces = [];
          if (destPlaces?.attractions && destPlaces.attractions.length > 0) {
            destPlaces.attractions.slice(0, 3).forEach(place => {
              fallbackPlaces.push({
                name: place.name,
                description: place.address || place.location || place.description || cityName,
                cost: place.cost || 0,
                googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + cityName)}`
              });
            });
          }

          if (fallbackPlaces.length > 0) {
            activities.push({
              time: 'Afternoon',
              title: 'Afternoon',
              description: '',
              type: 'Section',
              cost: 0,
              places: fallbackPlaces
            });
          } else {
            activities.push({
              time: 'Afternoon',
              title: 'Afternoon',
              description: '',
              type: 'Section',
              cost: 0,
              places: [{
                name: `Popular Places in ${cityName}`,
                description: cityName,
                googleMaps: `https://maps.google.com/?q=${encodeURIComponent(cityName + ' tourist attractions')}`
              }]
            });
          }
        }
      }

      // Always prioritize destPlaces if available (has actual API data) - this should come BEFORE sightseeingOptions
      // This ensures we use real place names instead of fallback activities
      if (destPlaces && (
        (destPlaces.attractions && destPlaces.attractions.length > 0) ||
        (destPlaces.parks && destPlaces.parks.length > 0) ||
        (destPlaces.viewpoints && destPlaces.viewpoints.length > 0) ||
        (destPlaces.shopping && destPlaces.shopping.length > 0)
      )) {
        // Fallback: Group attractions by type and show specific names
        // Get places for this specific day
        const allAttractions = [
          ...(destPlaces.attractions || []),
          ...(destPlaces.shopping || []),
          ...(destPlaces.parks || []),
          ...(destPlaces.viewpoints || [])
        ];

        // Get different places for this day
        let placesForThisDay = getPlacesForDay(allAttractions, dayIndex, totalDays, dest);

        // Filter out already used places to ensure uniqueness across days
        placesForThisDay = placesForThisDay.filter(place => {
          const placeId = place.placeId || place.name;
          return !usedPlaceIds.has(placeId);
        });

        // If we filtered out too many, get more unused places for this day
        if (placesForThisDay.length < 3 && allAttractions.length > 0) {
          const unusedPlaces = allAttractions.filter(place => {
            const placeId = place.placeId || place.name;
            return !usedPlaceIds.has(placeId);
          });

          const placesPerDay = Math.max(3, Math.ceil(unusedPlaces.length / (totalDays - dayIndex)));
          const additionalPlaces = unusedPlaces.slice(0, placesPerDay);
          placesForThisDay = [...placesForThisDay, ...additionalPlaces].slice(0, 6);
        }

        const moodFilteredPlaces = selectedMoods && selectedMoods.length > 0
          ? filterPlacesByMood(placesForThisDay, selectedMoods)
          : placesForThisDay;

        const groupedByType = {};

        // Group filtered places by type
        moodFilteredPlaces.forEach(attr => {
          const type = attr.type || 'Sightseeing';
          if (!groupedByType[type]) {
            groupedByType[type] = [];
          }
          groupedByType[type].push(attr);
        });

        // Create Section activity with individual places (not grouped activities)
        const allPlacesForAfternoon = [];
        const types = Object.keys(groupedByType);

        // Collect all places from all types
        types.forEach(type => {
          const typePlaces = groupedByType[type].slice(0, 5);
          typePlaces.forEach(place => {
            const placeId = place.placeId || place.name;
            if (!usedPlaceIds.has(placeId)) {
              // Extract name from multiple possible sources
              const placeName = place.name ||
                               (place.address ? place.address.split(',')[0].trim() : null) ||
                               place.location ||
                               place.description ||
                               `Attraction in ${cityName}`;
              allPlacesForAfternoon.push({
                name: placeName,
                description: place.address || place.location || place.description || cityName,
                cost: place.cost || place.estimatedCost || 0,
                googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent((placeName || 'attraction') + ' ' + cityName)}`,
                type: place.type || 'Sightseeing'
              });
              usedPlaceIds.add(placeId);
              if (place.name) usedPlaceIds.add(place.name);
            }
          });
        });

        // Create Section activity with individual places
        if (allPlacesForAfternoon.length > 0) {
          console.log(`🔍 DEBUG Day ${dayIndex + 1}: Adding ${allPlacesForAfternoon.length} places to Afternoon section`);
          console.log(`🔍 DEBUG: Place names:`, allPlacesForAfternoon.slice(0, 3).map(p => p.name));
          console.log(`🔍 DEBUG: First place structure:`, {
            name: allPlacesForAfternoon[0]?.name,
            hasName: !!allPlacesForAfternoon[0]?.name,
            address: allPlacesForAfternoon[0]?.description,
            fullPlace: allPlacesForAfternoon[0]
          });
          const totalCost = allPlacesForAfternoon.reduce((sum, p) => sum + (p.cost || 0), 0);
          activities.push({
            time: 'Afternoon',
            title: 'Afternoon',
            description: '',
            type: 'Section',
            cost: totalCost,
            places: allPlacesForAfternoon.slice(0, 6) // Limit to 6 places max
          });
        } else {
          console.log(`⚠️ DEBUG Day ${dayIndex + 1}: No places found for Afternoon section from destPlaces`);
        }
      } else {
        // If destPlaces is not available, try to use sightseeingOptions (but filter out fallback activities)
        if (sightseeingOptions && Array.isArray(sightseeingOptions) && sightseeingOptions.length > 0) {
          // Filter out fallback activities (generic names)
          const realPlaces = sightseeingOptions.filter(opt =>
            opt.name &&
            !opt.name.includes(' - ') &&
            !opt.name.includes('Parks -') &&
            !opt.name.includes('Scenic Viewpoints -') &&
            !opt.name.includes('Historical Sites -') &&
            !opt.name.includes('Museums -') &&
            !opt.name.includes('Churches & Temples -') &&
            !opt.name.includes('Shopping Malls -') &&
            !opt.name.includes('Entertainment Areas -') &&
            !opt.name.includes('Tourist Attractions -') &&
            !opt.name.includes('Must Visit Places -') &&
            !opt.name.includes('Popular Places -')
          );

          if (realPlaces.length > 0) {
            const afternoonPlaces = realPlaces.slice(0, 6).map(place => {
              // Extract name from multiple possible sources
              const placeName = place.name ||
                               (place.address ? place.address.split(',')[0].trim() : null) ||
                               place.location ||
                               place.description ||
                               `Attraction in ${cityName}`;
              return {
                name: placeName,
                description: place.description || place.address || cityName,
                cost: place.cost || place.estimatedCost || 0,
                googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent((placeName || 'attraction') + ' ' + cityName)}`,
                type: place.type || 'Sightseeing'
              };
            });

            if (afternoonPlaces.length > 0) {
              const totalCost = afternoonPlaces.reduce((sum, p) => sum + (p.cost || 0), 0);
              activities.push({
                time: 'Afternoon',
                title: 'Afternoon',
                description: '',
                type: 'Section',
                cost: totalCost,
                places: afternoonPlaces
              });
            }
          }
        }
      }

      // If still no activities, add at least one generic activity
      // This should rarely happen if API is working, but provides fallback
      if (activities.filter(a => a.type !== 'Travel' && a.type !== 'Accommodation' && a.type !== 'Dining').length === 0) {
        activities.push({
          time: '3:00 PM',
          title: `Explore ${cityName}`,
          description: `Discover popular places in ${cityName}. Use the map link to find specific attractions, museums, and landmarks.`,
          type: 'Sightseeing',
          cost: 0,
          googleMaps: `https://maps.google.com/?q=${encodeURIComponent(cityName + ' tourist attractions')}`
        });
      }

      // Section: Dinner
      const dinnerRestaurants = destPlaces?.restaurants?.dinner || [];
      const unusedDinnerRestaurants = dinnerRestaurants.filter(r => {
        const restaurantId = r.placeId || r.name;
        return !usedPlaceIds.has(restaurantId);
      });
      const availableDinner = unusedDinnerRestaurants.length > 0 ? unusedDinnerRestaurants : dinnerRestaurants;

      // Select restaurant by day index directly (no shuffle) to match API order
      // For day 1 (dayIndex 0), use first restaurant from API; for day 2, use second, etc.
      // This ensures the displayed restaurant matches what's in destPlaces
      // IMPORTANT: Use dayIndex directly to ensure first day gets first restaurant from API
      let dinnerRestaurant = availableDinner[dayIndex] || availableDinner[0];

      // If selected restaurant doesn't have a name, try to find one that does
      if (!dinnerRestaurant || !dinnerRestaurant.name || dinnerRestaurant.name.trim() === '') {
        dinnerRestaurant = availableDinner.find(r => r && r.name && r.name.trim() !== '') ||
                          dinnerRestaurants.find(r => r && r.name && r.name.trim() !== '');
      }

      const dinnerPlaces = [];

      if (dinnerRestaurant && dinnerRestaurant.name && dinnerRestaurant.name.trim() !== '') {
        const cost = dinnerRestaurant.estimatedCost || 400;
        const restaurantId = dinnerRestaurant.placeId || dinnerRestaurant.name;
        usedPlaceIds.add(restaurantId);
        dinnerPlaces.push({
          name: dinnerRestaurant.name, // Always use actual name from API
          description: dinnerRestaurant.location || cityName,
          cost: cost,
          googleMaps: dinnerRestaurant.googleMaps
        });
      }

      // Only add fallback if no restaurant was found
      if (dinnerPlaces.length === 0) {
        // Try to get any restaurant from available list (check all restaurants, not just unused)
        const allDinnerRestaurants = destPlaces?.restaurants?.dinner || [];
        const anyRestaurant = allDinnerRestaurants.find(r => r && r.name && r.name.trim() !== '');

        if (anyRestaurant) {
          dinnerPlaces.push({
            name: anyRestaurant.name,
            description: anyRestaurant.location || anyRestaurant.address || cityName,
            cost: anyRestaurant.estimatedCost || 400,
            googleMaps: anyRestaurant.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(anyRestaurant.name + ' ' + cityName)}`
          });
        } else if (allDinnerRestaurants.length > 0) {
          // If we have restaurants but they don't have names, use the first one and try to get name from address
          const firstRestaurant = allDinnerRestaurants[0];
          const restaurantName = firstRestaurant.name ||
                                 (firstRestaurant.address ? firstRestaurant.address.split(',')[0] : null) ||
                                 `Restaurant in ${cityName}`;
          dinnerPlaces.push({
            name: restaurantName,
            description: firstRestaurant.location || firstRestaurant.address || cityName,
            cost: firstRestaurant.estimatedCost || 400,
            googleMaps: firstRestaurant.googleMaps || `https://maps.google.com/?q=restaurants+${encodeURIComponent(cityName)}`
          });
        } else {
          // Last resort fallback - only use if absolutely no restaurant data available
          dinnerPlaces.push({
            name: `Restaurant in ${cityName}`,
            description: cityName,
            cost: 400,
            googleMaps: `https://maps.google.com/?q=restaurants+${encodeURIComponent(cityName)}`
          });
        }
      }

      activities.push({
        time: 'Dinner',
        title: 'Dinner',
        description: '',
        type: 'Section',
        cost: dinnerPlaces[0]?.cost || 400,
        places: dinnerPlaces
      });

    } else if (dayType === 'last') {
      // LAST DAY FORMAT: Breakfast, Sightseeing/Places to visit, Lunch, Departure

      // Section: Morning - Breakfast
      activities.push({
        time: 'Morning',
        title: 'Morning',
        description: '',
        type: 'Section',
        cost: 250,
        places: [{
          name: 'Breakfast',
          description: cityName,
        }]
      });

      // Section: Afternoon - Sightseeing/Places to visit
      const sightseeingPlaces = [];
      if (sightseeingOptions && Array.isArray(sightseeingOptions) && sightseeingOptions.length > 0) {
        const remainingActivities = sightseeingOptions.slice(3);
        const groupedActivities = {};
        remainingActivities.forEach(activity => {
          const type = activity.type || 'Sightseeing';
          if (!groupedActivities[type]) {
            groupedActivities[type] = [];
          }
          groupedActivities[type].push(activity);
        });

        Object.values(groupedActivities).flat().slice(0, 3).forEach(place => {
          const placeId = place.placeId || place.name;
          if (!usedPlaceIds.has(placeId)) {
            sightseeingPlaces.push({
              name: place.name,
              description: place.address || place.location || place.description || cityName,
              cost: place.cost || place.estimatedCost || 0,
              googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + cityName)}`,
              type: place.type || 'Sightseeing'
            });
            usedPlaceIds.add(placeId);
            if (place.name) usedPlaceIds.add(place.name);
          }
        });
      } else if (destPlaces?.attractions && destPlaces.attractions.length > 0) {
        destPlaces.attractions.slice(0, 3).forEach(place => {
          const placeId = place.placeId || place.name;
          if (!usedPlaceIds.has(placeId)) {
            sightseeingPlaces.push({
              name: place.name,
              description: place.address || place.location || place.description || cityName,
              cost: place.cost || 0,
              googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + cityName)}`,
              type: place.type || 'Sightseeing'
            });
            usedPlaceIds.add(placeId);
            if (place.name) usedPlaceIds.add(place.name);
          }
        });
      }

      // Ensure at least 1 place is shown
      if (sightseeingPlaces.length === 0 && destPlaces?.attractions && destPlaces.attractions.length > 0) {
        const firstPlace = destPlaces.attractions[0];
        sightseeingPlaces.push({
          name: firstPlace.name,
          description: firstPlace.address || firstPlace.location || firstPlace.description || cityName,
          cost: firstPlace.cost || 0,
          googleMaps: firstPlace.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(firstPlace.name + ' ' + cityName)}`
        });
      }

      if (sightseeingPlaces.length > 0) {
        const totalCost = sightseeingPlaces.reduce((sum, p) => sum + (p.cost || 0), 0);
        activities.push({
          time: 'Afternoon',
          title: 'Afternoon',
          description: '',
          type: 'Section',
          cost: totalCost,
          places: sightseeingPlaces
        });
      } else {
        // Fallback - try to get places from destPlaces if available
        const fallbackPlaces = [];
        if (destPlaces?.attractions && destPlaces.attractions.length > 0) {
          destPlaces.attractions.slice(0, 2).forEach(place => {
            fallbackPlaces.push({
              name: place.name,
              description: place.address || place.location || place.description || cityName,
              cost: place.cost || 0,
              googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + cityName)}`
            });
          });
        }

        if (fallbackPlaces.length > 0) {
          activities.push({
            time: 'Afternoon',
            title: 'Afternoon',
            description: '',
            type: 'Section',
            cost: 0,
            places: fallbackPlaces
          });
        } else {
          activities.push({
            time: 'Afternoon',
            title: 'Afternoon',
            description: '',
            type: 'Section',
            cost: 0,
            places: [{
              name: `Popular Places in ${cityName}`,
              description: cityName,
              googleMaps: `https://maps.google.com/?q=${encodeURIComponent(cityName + ' tourist attractions')}`
            }]
          });
        }
      }

      // Section: Lunch - Add multiple restaurant options
      const lunchRestaurants = destPlaces?.restaurants?.lunch || [];
      const unusedLunchRestaurants = lunchRestaurants.filter(r => {
        const restaurantId = r.placeId || r.name;
        return !usedPlaceIds.has(restaurantId);
      });
      const availableLunch = unusedLunchRestaurants.length > 0 ? unusedLunchRestaurants : lunchRestaurants;

      const shuffledLunch = availableLunch.sort((a, b) => {
        const hashA = (a.placeId || a.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hashB = (b.placeId || b.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const seed = dayIndex * 7 + 13;
        return ((hashA + seed) % 1000) - ((hashB + seed) % 1000);
      });

      const lunchRestaurant = shuffledLunch[dayIndex % shuffledLunch.length] || shuffledLunch[0] || lunchRestaurants[0];
      const lunchPlaces = [];

      if (lunchRestaurant && lunchRestaurant.name) {
        const cost = lunchRestaurant.estimatedCost || 350;
        const restaurantId = lunchRestaurant.placeId || lunchRestaurant.name;
        usedPlaceIds.add(restaurantId);
        lunchPlaces.push({
          name: lunchRestaurant.name,
          description: lunchRestaurant.location || cityName,
          cost: cost,
          googleMaps: lunchRestaurant.googleMaps || `https://maps.google.com/?q=restaurants+${encodeURIComponent(cityName)}`
        });

        // Add 1-2 more restaurant options if available
        const additionalRestaurants = shuffledLunch.filter(r => {
          const rId = r.placeId || r.name;
          return rId !== restaurantId && !usedPlaceIds.has(rId);
        }).slice(0, 2);

        additionalRestaurants.forEach(rest => {
          const rId = rest.placeId || rest.name;
          usedPlaceIds.add(rId);
          lunchPlaces.push({
            name: rest.name,
            description: rest.location || cityName,
            cost: rest.estimatedCost || 350,
            googleMaps: rest.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(rest.name + ' ' + cityName)}`
          });
        });
      } else {
        lunchPlaces.push({
          name: `Popular Restaurant in ${cityName}`,
          description: cityName,
          cost: 350,
          googleMaps: `https://maps.google.com/?q=restaurants+${encodeURIComponent(cityName)}`
        });
      }

      activities.push({
        time: 'Lunch',
        title: 'Lunch',
        description: '',
        type: 'Section',
        cost: lunchPlaces[0]?.cost || 350,
        places: lunchPlaces
      });

      // Section: Afternoon - Departure
      activities.push({
        time: 'Afternoon',
        title: 'Afternoon',
        description: '',
        type: 'Section',
        cost: 0,
        places: [{
          name: `Depart from ${cityName}`,
          description: `${cityName} airport`,
          googleMaps: `https://maps.google.com/?q=${encodeURIComponent(cityName + ' airport')}`
        }]
      });

    } else {
      // MIDDLE DAYS FORMAT: Breakfast, Places to visit, Lunch, Places to visit, Dinner/Clubs/Bar

      // Section: Morning - Breakfast
      activities.push({
        time: 'Morning',
        title: 'Morning',
        description: '',
        type: 'Section',
        cost: 250,
        places: [{
          name: 'Breakfast',
          description: cityName,
        }]
      });

      // Section: Morning - Places to visit
      const morningPlaces = [];
      if (sightseeingOptions && Array.isArray(sightseeingOptions) && sightseeingOptions.length > 0) {
        const remainingActivities = sightseeingOptions.slice(3);
        const moodFiltered = selectedMoods && selectedMoods.length > 0
          ? filterPlacesByMood(remainingActivities, selectedMoods)
          : remainingActivities;

        moodFiltered.slice(0, 2).forEach(place => {
          const placeId = place.placeId || place.name;
          if (!usedPlaceIds.has(placeId)) {
            morningPlaces.push({
              name: place.name,
              description: place.address || place.location || place.description || cityName,
              cost: place.cost || place.estimatedCost || 0,
              googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + cityName)}`,
              type: place.type || 'Sightseeing'
            });
            usedPlaceIds.add(placeId);
            if (place.name) usedPlaceIds.add(place.name);
          }
        });
      } else if (destPlaces?.attractions && destPlaces.attractions.length > 0) {
        destPlaces.attractions.slice(dayIndex * 2, (dayIndex * 2) + 2).forEach(place => {
          const placeId = place.placeId || place.name;
          if (!usedPlaceIds.has(placeId)) {
            morningPlaces.push({
              name: place.name,
              description: place.address || place.location || place.description || cityName,
              cost: place.cost || 0,
              googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + cityName)}`,
              type: place.type || 'Sightseeing'
            });
            usedPlaceIds.add(placeId);
            if (place.name) usedPlaceIds.add(place.name);
          }
        });
      }

      // Ensure at least 1 place is shown
      if (morningPlaces.length === 0 && destPlaces?.attractions && destPlaces.attractions.length > 0) {
        const firstPlace = destPlaces.attractions[dayIndex * 2] || destPlaces.attractions[0];
        morningPlaces.push({
          name: firstPlace.name,
          description: firstPlace.address || firstPlace.location || firstPlace.description || cityName,
          cost: firstPlace.cost || 0,
          googleMaps: firstPlace.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(firstPlace.name + ' ' + cityName)}`
        });
      }

      if (morningPlaces.length > 0) {
        const totalCost = morningPlaces.reduce((sum, p) => sum + (p.cost || 0), 0);
        activities.push({
          time: 'Morning',
          title: 'Morning',
          description: '',
          type: 'Section',
          cost: totalCost,
          places: morningPlaces
        });
      } else {
        // Fallback - try to get places from destPlaces if available
        const fallbackPlaces = [];
        if (destPlaces?.attractions && destPlaces.attractions.length > 0) {
          destPlaces.attractions.slice(dayIndex * 2, (dayIndex * 2) + 2).forEach(place => {
            fallbackPlaces.push({
              name: place.name,
              description: place.address || place.location || place.description || cityName,
              cost: place.cost || 0,
              googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + cityName)}`
            });
          });
        }

        if (fallbackPlaces.length > 0) {
          activities.push({
            time: 'Morning',
            title: 'Morning',
            description: '',
            type: 'Section',
            cost: 0,
            places: fallbackPlaces
          });
        } else {
          activities.push({
            time: 'Morning',
            title: 'Morning',
            description: '',
            type: 'Section',
            cost: 0,
            places: [{
              name: `Popular Places in ${cityName}`,
              description: cityName,
              googleMaps: `https://maps.google.com/?q=${encodeURIComponent(cityName + ' tourist attractions')}`
            }]
          });
        }
      }

      // Section: Lunch - Add multiple restaurant options
      const lunchRestaurants = destPlaces?.restaurants?.lunch || [];
      const unusedLunchRestaurants = lunchRestaurants.filter(r => {
        const restaurantId = r.placeId || r.name;
        return !usedPlaceIds.has(restaurantId);
      });
      const availableLunch = unusedLunchRestaurants.length > 0 ? unusedLunchRestaurants : lunchRestaurants;

      const shuffledLunch = availableLunch.sort((a, b) => {
        const hashA = (a.placeId || a.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hashB = (b.placeId || b.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const seed = dayIndex * 7 + 13;
        return ((hashA + seed) % 1000) - ((hashB + seed) % 1000);
      });

      const lunchRestaurant = shuffledLunch[dayIndex % shuffledLunch.length] || shuffledLunch[0] || lunchRestaurants[0];
      const lunchPlaces = [];

      if (lunchRestaurant && lunchRestaurant.name) {
        const cost = lunchRestaurant.estimatedCost || 350;
        const restaurantId = lunchRestaurant.placeId || lunchRestaurant.name;
        usedPlaceIds.add(restaurantId);
        lunchPlaces.push({
          name: lunchRestaurant.name,
          description: lunchRestaurant.location || cityName,
          cost: cost,
          googleMaps: lunchRestaurant.googleMaps || `https://maps.google.com/?q=restaurants+${encodeURIComponent(cityName)}`
        });

        // Add 1-2 more restaurant options if available
        const additionalRestaurants = shuffledLunch.filter(r => {
          const rId = r.placeId || r.name;
          return rId !== restaurantId && !usedPlaceIds.has(rId);
        }).slice(0, 2);

        additionalRestaurants.forEach(rest => {
          const rId = rest.placeId || rest.name;
          usedPlaceIds.add(rId);
          lunchPlaces.push({
            name: rest.name,
            description: rest.location || cityName,
            cost: rest.estimatedCost || 350,
            googleMaps: rest.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(rest.name + ' ' + cityName)}`
          });
        });
      } else {
        lunchPlaces.push({
          name: `Popular Restaurant in ${cityName}`,
          description: cityName,
          cost: 350,
          googleMaps: `https://maps.google.com/?q=restaurants+${encodeURIComponent(cityName)}`
        });
      }

      activities.push({
        time: 'Lunch',
        title: 'Lunch',
        description: '',
        type: 'Section',
        cost: lunchPlaces[0]?.cost || 350,
        places: lunchPlaces
      });

      // Section: Afternoon - Places to visit
      const afternoonPlaces = [];
      if (sightseeingOptions && Array.isArray(sightseeingOptions) && sightseeingOptions.length > 0) {
        const remainingActivities = sightseeingOptions.slice(5);
        const moodFiltered = selectedMoods && selectedMoods.length > 0
          ? filterPlacesByMood(remainingActivities, selectedMoods)
          : remainingActivities;

        moodFiltered.slice(0, 2).forEach(place => {
          const placeId = place.placeId || place.name;
          if (!usedPlaceIds.has(placeId)) {
            afternoonPlaces.push({
              name: place.name,
              description: place.address || place.location || place.description || cityName,
              cost: place.cost || place.estimatedCost || 0,
              googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + cityName)}`,
              type: place.type || 'Sightseeing'
            });
            usedPlaceIds.add(placeId);
            if (place.name) usedPlaceIds.add(place.name);
          }
        });
      } else if (destPlaces?.attractions && destPlaces.attractions.length > 0) {
        destPlaces.attractions.slice((dayIndex * 2) + 2, (dayIndex * 2) + 4).forEach(place => {
          const placeId = place.placeId || place.name;
          if (!usedPlaceIds.has(placeId)) {
            afternoonPlaces.push({
              name: place.name,
              description: place.address || place.location || place.description || cityName,
              cost: place.cost || 0,
              googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + cityName)}`,
              type: place.type || 'Sightseeing'
            });
            usedPlaceIds.add(placeId);
            if (place.name) usedPlaceIds.add(place.name);
          }
        });
      }

      // Ensure at least 1 place is shown
      if (afternoonPlaces.length === 0 && destPlaces?.attractions && destPlaces.attractions.length > 0) {
        const firstPlace = destPlaces.attractions[(dayIndex * 2) + 2] || destPlaces.attractions[dayIndex + 1] || destPlaces.attractions[0];
        afternoonPlaces.push({
          name: firstPlace.name,
          description: firstPlace.address || firstPlace.location || firstPlace.description || cityName,
          cost: firstPlace.cost || 0,
          googleMaps: firstPlace.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(firstPlace.name + ' ' + cityName)}`
        });
      }

      if (afternoonPlaces.length > 0) {
        const totalCost = afternoonPlaces.reduce((sum, p) => sum + (p.cost || 0), 0);
        activities.push({
          time: 'Afternoon',
          title: 'Afternoon',
          description: '',
          type: 'Section',
          cost: totalCost,
          places: afternoonPlaces
        });
      } else {
        // Fallback - try to get places from destPlaces if available
        const fallbackPlaces = [];
        if (destPlaces?.attractions && destPlaces.attractions.length > 0) {
          destPlaces.attractions.slice((dayIndex * 2) + 2, (dayIndex * 2) + 4).forEach(place => {
            fallbackPlaces.push({
              name: place.name,
              description: place.address || place.location || place.description || cityName,
              cost: place.cost || 0,
              googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + cityName)}`
            });
          });
        }

        if (fallbackPlaces.length > 0) {
          activities.push({
            time: 'Afternoon',
            title: 'Afternoon',
            description: '',
            type: 'Section',
            cost: 0,
            places: fallbackPlaces
          });
        } else {
          activities.push({
            time: 'Afternoon',
            title: 'Afternoon',
            description: '',
            type: 'Section',
            cost: 0,
            places: [{
              name: `Popular Places in ${cityName}`,
              description: cityName,
              googleMaps: `https://maps.google.com/?q=${encodeURIComponent(cityName + ' tourist attractions')}`
            }]
          });
        }
      }

      // Section: Dinner/Clubs/Bar (for social mood, show clubs/bars; otherwise dinner)
      const dinnerRestaurants = destPlaces?.restaurants?.dinner || [];
      const unusedDinnerRestaurants = dinnerRestaurants.filter(r => {
        const restaurantId = r.placeId || r.name;
        return !usedPlaceIds.has(restaurantId);
      });
      const availableDinner = unusedDinnerRestaurants.length > 0 ? unusedDinnerRestaurants : dinnerRestaurants;

      // Select restaurant by day index directly (no shuffle) to match API order
      // For day 1 (dayIndex 0), use first restaurant from API; for day 2, use second, etc.
      // IMPORTANT: Use dayIndex directly to ensure first day gets first restaurant from API
      const dinnerRestaurant = availableDinner[dayIndex] || availableDinner[0];
      const dinnerPlaces = [];

      // For social mood, prioritize clubs/bars from attractions
      if (isSocial && destPlaces?.attractions) {
        const socialPlaces = destPlaces.attractions.filter(a =>
          a.type === 'Entertainment' ||
          a.name.toLowerCase().includes('club') ||
          a.name.toLowerCase().includes('bar') ||
          a.name.toLowerCase().includes('nightclub')
        );

        socialPlaces.slice(dayIndex, dayIndex + 1).forEach(place => {
          const placeId = place.placeId || place.name;
          if (!usedPlaceIds.has(placeId)) {
            dinnerPlaces.push({
              name: place.name,
              description: place.address || place.location || place.description || cityName,
              cost: place.cost || 400,
              googleMaps: place.googleMaps || `https://maps.google.com/?q=${encodeURIComponent(place.name + ' ' + cityName)}`,
              type: 'Entertainment'
            });
            usedPlaceIds.add(placeId);
            if (place.name) usedPlaceIds.add(place.name);
          }
        });
      }

      // Add dinner restaurant if no social places or as additional option
      if (dinnerRestaurant) {
        const cost = dinnerRestaurant.estimatedCost || 400;
        const restaurantId = dinnerRestaurant.placeId || dinnerRestaurant.name;
        if (!usedPlaceIds.has(restaurantId)) {
          usedPlaceIds.add(restaurantId);
          dinnerPlaces.push({
            name: dinnerRestaurant.name,
            description: dinnerRestaurant.location || cityName,
            cost: cost,
            googleMaps: dinnerRestaurant.googleMaps
          });
        }
      }

      if (dinnerPlaces.length === 0) {
        dinnerPlaces.push({
          name: `Popular Restaurant in ${cityName}`,
          description: cityName,
          cost: 400,
          googleMaps: `https://maps.google.com/?q=restaurants+${encodeURIComponent(cityName)}`
        });
      }

      activities.push({
        time: 'Evening',
        title: 'Evening',
        description: '',
        type: 'Section',
        cost: dinnerPlaces[0]?.cost || 400,
        places: dinnerPlaces
      });
    }

    // Ensure we return at least some activities (for ALL day types)
    if (activities.length === 0) {
      console.warn(`No activities generated for day ${dayIndex + 1}, type: ${dayType}`);
      activities.push({
        time: '10:00 AM',
            title: `Popular Places in ${cityName}`,
            description: cityName,
        type: 'Sightseeing',
        cost: 0,
        googleMaps: `https://maps.google.com/?q=${encodeURIComponent(cityName + ' tourist attractions')}`
      });
    }

    return activities;
    } catch (error) {
      console.error(`Error in getLocationActivities for day ${dayIndex + 1}:`, error);
      // Return minimal fallback activities
      const cityName = mainCityParam || destPlaces?.city || dest || 'the destination';
      return [{
        time: '10:00 AM',
        title: `Explore ${cityName}`,
        description: `Activities for day ${dayIndex + 1}. Error occurred: ${error.message}`,
        type: 'Sightseeing',
        cost: 0,
      }];
    }
  };

  // Track used places across days to ensure no duplicates
  const usedPlaceIds = new Set();

  // Generate day-by-day plan
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const isFirstDay = i === 0;
    const isLastDay = i === days - 1;

    const dayPlan = {
      day: i + 1,
      date: currentDate,
      activities: [],
    };

    const dayType = isFirstDay ? 'first' : isLastDay ? 'last' : 'middle';

    // Get activities for this day (will filter out already used places)
    // All activities come from Google Places API filtered by destination and moods
    let dayActivities = [];
    try {
      console.log(`\n📅 Generating activities for Day ${i + 1} (${dayType})...`);
      console.log(`🔍 DEBUG: destinationPlaces is ${destinationPlaces ? 'defined' : 'null'}`);
      console.log(`🔍 DEBUG: sightseeingOptions length: ${sightseeingOptions?.length || 0}`);

      dayActivities = await getLocationActivities(
        dest,
        dayType,
        sightseeingOptions,
        i,
        days,
        destinationPlaces,
        normalizedMoods, // Use normalized moods
        usedPlaceIds,
        mainCity,
        normalizedDestination // Use normalized destination
      );
      console.log(`✅ Day ${i + 1}: Generated ${dayActivities.length} activities`);

      // Ensure we have at least some activities
      if (!dayActivities || dayActivities.length === 0) {
        console.warn(`⚠️ Day ${i + 1}: No activities generated, using fallback`);
        throw new Error(`No activities generated for day ${i + 1}`);
      }
    } catch (error) {
      console.error(`❌ Error generating activities for day ${i + 1}:`, error);
      console.error('Error stack:', error.stack);
      // Add fallback activities if error occurs - ensure restaurants are included
      const cityName = mainCity || normalizedDestination || 'the destination';
      dayActivities = [
        {
          time: 'Morning',
          title: 'Morning',
          description: '',
          type: 'Section',
          cost: 0,
          places: [{
            name: `Arrive ${cityName}`,
            description: `${cityName} airport`,
          }]
        },
        {
          time: 'Lunch',
          title: 'Lunch',
          description: '',
          type: 'Section',
          cost: 400,
          places: [{
            name: `Restaurant in ${cityName}`,
            description: cityName,
            cost: 400,
          }]
        },
        {
          time: 'Afternoon',
          title: 'Afternoon',
          description: '',
          type: 'Section',
          cost: 0,
          places: [{
            name: `Popular Places in ${cityName}`,
            description: cityName,
          }]
        },
        {
          time: 'Dinner',
          title: 'Dinner',
          description: '',
          type: 'Section',
          cost: 500,
          places: [{
            name: `Restaurant in ${cityName}`,
            description: cityName,
            cost: 500,
          }]
        },
        {
          time: '1:00 PM',
          title: `Lunch at Popular Restaurant in ${cityName}`,
          description: `Enjoy lunch at a popular restaurant in ${cityName}.`,
          type: 'Dining',
          cost: 300,
          googleMaps: `https://maps.google.com/?q=restaurants+${encodeURIComponent(cityName)}`
        },
        {
          time: '7:00 PM',
          title: `Dinner at Popular Restaurant in ${cityName}`,
          description: `Enjoy dinner at a popular restaurant in ${cityName}.`,
          type: 'Dining',
          cost: 400,
          googleMaps: `https://maps.google.com/?q=restaurants+${encodeURIComponent(cityName)}`
        }
      ];
    }

    // Ensure dayActivities is an array
    if (!Array.isArray(dayActivities)) {
      console.warn(`⚠️ dayActivities is not an array for day ${i + 1}, type: ${typeof dayActivities}, converting...`);
      dayActivities = [];
    }

    // Log activities for debugging
    if (dayActivities.length === 0) {
      console.warn(`⚠️ No activities for day ${i + 1}!`);
    } else {
      console.log(`Day ${i + 1} activities:`, dayActivities.map(a => a.title || a.time).join(', '));
    }

    // Mark places as used AFTER getting activities (so next day doesn't use them)
    dayActivities.forEach(activity => {
      if (activity.places && Array.isArray(activity.places)) {
        activity.places.forEach(place => {
          if (place.placeId) usedPlaceIds.add(place.placeId);
          if (place.name) usedPlaceIds.add(place.name); // Fallback if no placeId
        });
      }
      // Also mark the activity itself if it has a name/placeId
      if (activity.name && !activity.places) {
        usedPlaceIds.add(activity.name);
      }
    });

    // Ensure activities is always an array with at least basic activities
    if (!Array.isArray(dayActivities) || dayActivities.length === 0) {
      console.warn(`⚠️ Day ${i + 1} has no activities, adding fallback with restaurants`);
      dayActivities = [
        {
          time: '10:00 AM',
          title: `Explore ${mainCity}`,
          description: `Discover popular places in ${mainCity}.`,
          type: 'Sightseeing',
          cost: 0,
          googleMaps: `https://maps.google.com/?q=${encodeURIComponent(mainCity + ' tourist attractions')}`
        },
        {
          time: '1:00 PM',
          title: `Lunch at Popular Restaurant in ${mainCity}`,
          description: `Enjoy lunch at a popular restaurant in ${mainCity}.`,
          type: 'Dining',
          cost: 300,
          googleMaps: `https://maps.google.com/?q=restaurants+${encodeURIComponent(mainCity)}`
        },
        {
          time: '7:00 PM',
          title: `Dinner at Popular Restaurant in ${mainCity}`,
          description: `Enjoy dinner at a popular restaurant in ${mainCity}.`,
          type: 'Dining',
          cost: 400,
          googleMaps: `https://maps.google.com/?q=restaurants+${encodeURIComponent(mainCity)}`
        }
      ];
    }

    dayPlan.activities = dayActivities;
    itinerary.daysPlan.push(dayPlan);
  }

  // Final validation - ensure all days have activities with restaurants
  itinerary.daysPlan.forEach((dayPlan, index) => {
    if (!dayPlan.activities || dayPlan.activities.length === 0) {
      console.error(`❌ Day ${index + 1} has no activities after generation!`);
      dayPlan.activities = [
        {
          time: '10:00 AM',
          title: `Explore ${mainCity}`,
          description: `Discover popular places in ${mainCity}. Please try again or check your connection.`,
          type: 'Sightseeing',
          cost: 0,
          googleMaps: `https://maps.google.com/?q=${encodeURIComponent(mainCity + ' tourist attractions')}`
        },
        {
          time: '1:00 PM',
          title: `Lunch at Popular Restaurant in ${mainCity}`,
          description: `Enjoy lunch at a popular restaurant in ${mainCity}.`,
          type: 'Dining',
          cost: 300,
          googleMaps: `https://maps.google.com/?q=restaurants+${encodeURIComponent(mainCity)}`
        },
        {
          time: '7:00 PM',
          title: `Dinner at Popular Restaurant in ${mainCity}`,
          description: `Enjoy dinner at a popular restaurant in ${mainCity}.`,
          type: 'Dining',
          cost: 400,
          googleMaps: `https://maps.google.com/?q=restaurants+${encodeURIComponent(mainCity)}`
        }
      ];
    }
  });

  // Calculate costs - handle both section-based and regular activities
  let totalActivitiesCost = 0;
  itinerary.daysPlan.forEach(day => {
    day.activities.forEach(activity => {
      if (activity.type === 'Section' && activity.places && Array.isArray(activity.places)) {
        // Sum costs from places in section
        const sectionCost = activity.places.reduce((sum, place) => sum + (place.cost || 0), 0);
        totalActivitiesCost += sectionCost;
      } else {
        // Regular activity cost
        totalActivitiesCost += activity.cost || 0;
      }
    });
  });

  // Calculate costs based on actual filters (budget, numPeople, days)
  const accommodationCost = itinerary.accommodations[0]?.price
    ? itinerary.accommodations[0].price * numPeople * (days - 1)
    : (budget * 0.4); // 40% of budget for accommodation if not available

  const foodCost = totalActivitiesCost * numPeople;
  const localTravelCost = Math.round((budget * 0.05) * numPeople); // 5% of budget for transport
  const miscCost = Math.round((budget * 0.05) * numPeople); // 5% of budget for misc

  const totalCost = accommodationCost + foodCost + totalActivitiesCost * numPeople + localTravelCost + miscCost;

  itinerary.costBreakdown = {
    accommodation: accommodationCost,
    food: foodCost,
    activities: totalActivitiesCost * numPeople,
    localTravel: localTravelCost,
    misc: miscCost,
    total: totalCost,
    perPerson: totalCost / numPeople,
  };

  console.log(`\n💰 Cost Breakdown:`);
  console.log(`   Accommodation: ${symbol}${accommodationCost.toLocaleString()}`);
  console.log(`   Food: ${symbol}${foodCost.toLocaleString()}`);
  console.log(`   Activities: ${symbol}${(totalActivitiesCost * numPeople).toLocaleString()}`);
  console.log(`   Transport: ${symbol}${localTravelCost.toLocaleString()}`);
  console.log(`   Misc: ${symbol}${miscCost.toLocaleString()}`);
  console.log(`   Total: ${symbol}${totalCost.toLocaleString()} (${symbol}${(totalCost / numPeople).toLocaleString()} per person)`);

  console.log('✅ DEBUG generateItinerary: Successfully generated itinerary');
  return itinerary;
  } catch (error) {
    console.error('❌ DEBUG generateItinerary: Error caught:', error);
    console.error('❌ DEBUG generateItinerary: Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 300)
    });
    // Re-throw to be caught by caller
    throw error;
  }
};

const STORAGE_KEY = '@moodmiles_saved_trips';

export default function TripDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const filters = route.params?.filters || {};
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]); // Store all debug logs for UI display
  const [showShareModal, setShowShareModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Function to add debug log that will be shown in UI
  const addDebugLog = React.useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-49), { message, type, timestamp }]); // Keep last 50 logs
  }, []);
  const [apiErrors, setApiErrors] = useState([]);

  // Set the global setApiErrorsState so async functions can update state
  useEffect(() => {
    // Make setApiErrorsState available to async functions
    setApiErrorsState = setApiErrors;
    return () => {
      setApiErrorsState = null;
    };
  }, []);

  useEffect(() => {
    const loadItinerary = async () => {
      // Test fetch first to see if it works in React Native
      console.log('🔍 DEBUG: Testing fetch capability...');
      let fetchTestResult = { success: false, error: 'Not tested' };
      try {
        const testUrl = `${GOOGLE_PLACES_API_BASE}/textsearch/json?query=restaurants+Kerala&key=${GOOGLE_PLACES_API_KEY}`;
        console.log('🔍 DEBUG: Test URL:', testUrl);
        const testResponse = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        console.log('🔍 DEBUG: Test response status:', testResponse.status, testResponse.statusText);
        const testData = await testResponse.json();
        console.log('🔍 DEBUG: Fetch test result:', {
          status: testData.status,
          hasResults: !!(testData.results && testData.results.length > 0),
          error: testData.error_message
        });
        fetchTestResult = {
          success: testData.status === 'OK',
          status: testData.status,
          error: testData.error_message,
          hasResults: !!(testData.results && testData.results.length > 0)
        };
      } catch (testError) {
        console.error('❌ DEBUG: Fetch test failed:', testError);
        console.error('❌ DEBUG: Error details:', {
          message: testError.message,
          name: testError.name,
          stack: testError.stack
        });
        fetchTestResult = {
          success: false,
          error: testError.message,
          name: testError.name
        };
      }

      // Store fetch test result in debug info
      setDebugInfo(prev => ({
        ...prev,
        fetchTestResult: fetchTestResult
      }));

      // Validate that all required filters are present
      if (!filters.destination) {
        setLoading(false);
        Alert.alert('Error', 'Destination is required. Please go back and select a destination.');
        return;
      }

      if (!filters.startDate || !filters.endDate) {
        setLoading(false);
        Alert.alert('Error', 'Start date and end date are required.');
        return;
      }

      if (!filters.days || filters.days < 1) {
        setLoading(false);
        Alert.alert('Error', 'Number of days must be at least 1.');
        return;
      }

      if (!filters.numPeople || filters.numPeople < 1) {
        setLoading(false);
        Alert.alert('Error', 'Number of people must be at least 1.');
        return;
      }

      if (!filters.budget || filters.budget <= 0) {
        setLoading(false);
        Alert.alert('Error', 'Budget must be greater than 0.');
        return;
      }

      setLoading(true);
      setDebugInfo(null);
      try {
        // Check API key status
        const apiKeyConfigured = GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY';

        if (!apiKeyConfigured) {
          Alert.alert(
            'API Key Not Configured',
            'Google Places API key is not configured. Please configure it in TripDetailsScreen.js to get real-time place data.'
          );
        }

        // Add timeout to itinerary generation (increased to 120 seconds for mobile networks)
        const timeoutMs = 120000; // 120 seconds (increased from 60s for mobile networks)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Itinerary generation timed out. Please try again.')), timeoutMs)
        );

        // Generate itinerary using API - now async with timeout
        // All data comes from Google Places API filtered by destination and moods
        console.log('🚀 Starting itinerary generation with filters:', {
          destination: filters.destination,
          days: filters.days,
          numPeople: filters.numPeople,
          budget: filters.budget,
          moods: filters.moods,
        });

        let generatedItinerary;
        try {
          generatedItinerary = await Promise.race([
            generateItinerary(filters),
            timeoutPromise
          ]);
        } catch (genError) {
          console.error('❌ Error in generateItinerary:', genError);
          console.error('❌ Error details:', {
            message: genError.message,
            name: genError.name,
            stack: genError.stack
          });
          throw genError; // Re-throw to be caught by outer catch
        }

        if (!generatedItinerary) {
          throw new Error('Itinerary generation returned null or undefined');
        }

        setItinerary(generatedItinerary);

          // Store debug info for display
          const activitiesCount = generatedItinerary.daysPlan.reduce((sum, day) => {
            return sum + day.activities.filter(a =>
              a.type !== 'Travel' && a.type !== 'Accommodation' && a.type !== 'Dining'
            ).length;
          }, 0);

          // Check if we have specific place names (not generic)
          const hasSpecificPlaces = generatedItinerary.daysPlan.some(day =>
            day.activities.some(a =>
              a.title && !a.title.includes('popular restaurant') &&
              !a.title.includes('Explore') &&
              a.title !== 'Lunch' && a.title !== 'Dinner'
            )
          );

          // Collect detailed debug info from itinerary's debug data
          const debugData = generatedItinerary._debug || {};
          const destinationPlaces = debugData.destinationPlaces || null;
          const debugLogsFromItinerary = debugData.debugLogs || [];

          // Set debug logs for UI display
          setDebugLogs(debugLogsFromItinerary);

          // Enhanced debug: Check if destinationPlaces exists and its structure
          const hasDestPlaces = destinationPlaces !== null && destinationPlaces !== undefined;
          const destPlacesType = typeof destinationPlaces;
          const destPlacesIsEmpty = hasDestPlaces &&
            (!destinationPlaces.attractions || destinationPlaces.attractions.length === 0) &&
            (!destinationPlaces.restaurants?.lunch || destinationPlaces.restaurants.lunch.length === 0) &&
            (!destinationPlaces.restaurants?.dinner || destinationPlaces.restaurants.dinner.length === 0);

          const lunchCount = destinationPlaces?.restaurants?.lunch?.length || 0;
          const dinnerCount = destinationPlaces?.restaurants?.dinner?.length || 0;
          const attractionsCount = destinationPlaces?.attractions?.length || 0;
          const parksCount = destinationPlaces?.parks?.length || 0;
          const viewpointsCount = destinationPlaces?.viewpoints?.length || 0;

          // Check if restaurants have names
          const firstLunchName = destinationPlaces?.restaurants?.lunch?.[0]?.name || 'N/A';
          const firstDinnerName = destinationPlaces?.restaurants?.dinner?.[0]?.name || 'N/A';
          const hasLunchNames = lunchCount > 0 && firstLunchName !== 'N/A' && firstLunchName !== 'Unknown Restaurant';
          const hasDinnerNames = dinnerCount > 0 && firstDinnerName !== 'N/A' && firstDinnerName !== 'Unknown Restaurant';

          // Check first attraction/park name
          const firstAttractionName = destinationPlaces?.attractions?.[0]?.name || 'N/A';
          const firstParkName = destinationPlaces?.parks?.[0]?.name || 'N/A';
          const firstViewpointName = destinationPlaces?.viewpoints?.[0]?.name || 'N/A';

          // Check what's actually being used in itinerary
          const day1Activities = generatedItinerary.daysPlan?.[0]?.activities || [];
          const lunchActivity = day1Activities.find(a => a.title === 'Lunch');
          const dinnerActivity = day1Activities.find(a => a.title === 'Dinner');
          const afternoonActivity = day1Activities.find(a => a.title === 'Afternoon');

          const lunchPlaceName = lunchActivity?.places?.[0]?.name || 'N/A';
          const dinnerPlaceName = dinnerActivity?.places?.[0]?.name || 'N/A';
          const afternoonPlaceNames = afternoonActivity?.places?.map(p => p.name).filter(n => n) || [];

          // Get the restaurant that should be displayed for day 1 (dayIndex 0)
          // For day 1, usedPlaceIds is empty, so availableLunch[0] = lunchRestaurants[0]
          // But to be safe, we'll use what's actually displayed as the source of truth
          // The mismatch warning will only show if displayed name doesn't match what should be at index 0
          const day1LunchRestaurants = destinationPlaces?.restaurants?.lunch || [];
          const expectedLunchName = day1LunchRestaurants[0]?.name || 'N/A';

          const day1DinnerRestaurants = destinationPlaces?.restaurants?.dinner || [];
          const expectedDinnerName = day1DinnerRestaurants[0]?.name || 'N/A';

          // Check if displayed matches expected (for day 1, should match index 0)
          // If there's a mismatch, it might be because of filtering or the restaurant at index 0 doesn't have a name
          const lunchMatches = lunchPlaceName === expectedLunchName ||
                              (lunchPlaceName !== 'N/A' && lunchPlaceName !== `Restaurant in ${filters.destination}`);
          const dinnerMatches = dinnerPlaceName === expectedDinnerName ||
                               (dinnerPlaceName !== 'N/A' && dinnerPlaceName !== `Restaurant in ${filters.destination}`);

          setDebugInfo({
            apiKeyConfigured,
            activitiesFound: activitiesCount,
            hasSpecificPlaces: hasSpecificPlaces,
            destination: filters.destination,
            apiErrors: [...apiErrors], // Copy current API errors
            // Enhanced debug info
            hasDestPlaces: hasDestPlaces,
            destPlacesType: destPlacesType,
            destPlacesIsEmpty: destPlacesIsEmpty,
            lunchRestaurants: lunchCount,
            dinnerRestaurants: dinnerCount,
            attractions: attractionsCount,
            parks: parksCount,
            viewpoints: viewpointsCount,
            firstLunchName: firstLunchName,
            firstDinnerName: firstDinnerName,
            hasLunchNames: hasLunchNames,
            hasDinnerNames: hasDinnerNames,
            firstAttractionName: firstAttractionName,
            firstParkName: firstParkName,
            firstViewpointName: firstViewpointName,
            hasDestPlaces: !!destinationPlaces,
            // What's actually displayed
            displayedLunchName: lunchPlaceName,
            displayedDinnerName: dinnerPlaceName,
            expectedLunchName: expectedLunchName,
            expectedDinnerName: expectedDinnerName,
            lunchMatches: lunchMatches,
            dinnerMatches: dinnerMatches,
            displayedAfternoonPlaces: afternoonPlaceNames.slice(0, 3),
            afternoonPlacesCount: afternoonPlaceNames.length,
          });

          // Show alert if API errors occurred
          if (apiErrors.length > 0) {
            const mainError = apiErrors[0];
            let errorMessage = `API Error: ${mainError.status}`;
            if (mainError.status === 'REQUEST_DENIED') {
              errorMessage = 'Places API not enabled. Enable it in Google Cloud Console.';
            } else if (mainError.status === 'OVER_QUERY_LIMIT') {
              errorMessage = 'API quota exceeded. Check your billing.';
            } else if (mainError.message) {
              errorMessage = mainError.message;
            }
            Alert.alert('API Error', errorMessage);
          }
        } catch (error) {
          console.error('❌ Error generating itinerary:', error);
          console.error('❌ Error stack:', error.stack);
          console.error('❌ Error name:', error.name);
          console.error('❌ Error message:', error.message);

          // Show detailed error message
          let errorMessage = 'Failed to generate itinerary.\n\n';
          if (error.message.includes('timeout')) {
            errorMessage += 'Reason: Request timed out (took too long).\n';
            errorMessage += 'This might be due to slow network or API issues.';
          } else if (error.message.includes('Network')) {
            errorMessage += 'Reason: Network error.\n';
            errorMessage += 'Please check your internet connection.';
          } else if (error.message) {
            errorMessage += `Reason: ${error.message}`;
          } else {
            errorMessage += 'Unknown error occurred.';
          }

          // Add error details to debug info
          setDebugInfo({
            apiKeyConfigured: GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY',
            error: error.message,
            errorName: error.name,
            errorStack: error.stack?.substring(0, 500), // Limit stack trace length
            timeout: error.message.includes('timeout'),
            hasDestPlaces: false,
            fetchTestResult: debugInfo?.fetchTestResult || null,
            // Show error in UI
            showError: true,
          });

          // Show detailed error alert
          Alert.alert(
            'Error Generating Itinerary',
            errorMessage + `\n\nError Type: ${error.name}\n\nCheck the debug panel below for more details.`,
            [{ text: 'OK' }]
          );
        } finally {
          setLoading(false);
        }
    };

    loadItinerary();
  }, [filters]);

  // Listen for focus to refresh saved trips count
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // This will trigger when screen comes into focus
    });
    return unsubscribe;
  }, [navigation]);

  const openGoogleMaps = (url) => {
    Linking.openURL(url).catch(err => console.error('Error opening maps:', err));
  };

  const openBookingLink = (url) => {
    WebBrowser.openBrowserAsync(url).catch(err => console.error('Error opening browser:', err));
  };

  const formatDate = (date) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const saveTrip = async () => {
    if (!itinerary) return;

    try {
      setIsSaving(true);

      // Create trip object to save
      const tripToSave = {
        id: `${itinerary.destination}_${Date.now()}`,
        destination: itinerary.destination,
        startDate: itinerary.startDate.toISOString(),
        endDate: itinerary.endDate.toISOString(),
        days: itinerary.days,
        numPeople: itinerary.numPeople,
        budget: itinerary.budget,
        currency: itinerary.currency,
        perPersonBudget: itinerary.perPersonBudget,
        moods: filters.moods || [],
        savedAt: new Date().toISOString(),
        // Store key itinerary data
        summary: {
          accommodations: itinerary.accommodations.slice(0, 3).map(acc => ({
            name: acc.name,
            type: acc.type,
            location: acc.location,
            price: acc.price,
          })),
          totalCost: itinerary.costBreakdown?.perPerson || 0,
        }
      };

      // Get existing trips
      const existingTripsJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingTrips = existingTripsJson ? JSON.parse(existingTripsJson) : [];

      // Check if trip already exists (same destination and dates)
      const isDuplicate = existingTrips.some(trip =>
        trip.destination === tripToSave.destination &&
        trip.startDate === tripToSave.startDate &&
        trip.endDate === tripToSave.endDate
      );

      if (isDuplicate) {
        Alert.alert('Already Saved', 'This trip is already saved in your trips list.');
        setIsSaving(false);
        return;
      }

      // Add new trip
      const updatedTrips = [tripToSave, ...existingTrips];

      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrips));

      setIsSaving(false);

      Alert.alert(
        'Trip Saved!',
        `Your ${itinerary.destination} itinerary has been saved. You can view it in "My Trips" on the home page.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back and refresh home screen
              navigation.navigate('Home', { refreshTrips: true });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving trip:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save trip. Please try again.');
    }
  };

  // Generate PDF HTML from itinerary
  const generatePDFHTML = () => {
    if (!itinerary) return '';

    const tips = getMoneySavingTips(itinerary.destination, itinerary.mainCity);

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            margin: 0;
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .container {
            background: white;
            margin: 20px;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #10B981;
          }
          .header h1 {
            color: #111827;
            font-size: 32px;
            margin: 0 0 10px 0;
            font-weight: 700;
          }
          .header-info {
            color: #6B7280;
            font-size: 16px;
            margin: 5px 0;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #E5E7EB;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .day-card {
            background: #F9FAFB;
            border-left: 4px solid #10B981;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .day-title {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 15px;
          }
          .activity {
            margin-bottom: 15px;
            padding-left: 20px;
          }
          .activity-title {
            font-size: 16px;
            font-weight: 600;
            color: #059669;
            margin-bottom: 8px;
          }
          .activity-place {
            font-size: 14px;
            color: #374151;
            margin-bottom: 5px;
          }
          .activity-description {
            font-size: 13px;
            color: #6B7280;
            line-height: 1.6;
          }
          .accommodation-card {
            background: #F9FAFB;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            border: 1px solid #E5E7EB;
          }
          .accommodation-name {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
          }
          .accommodation-details {
            font-size: 14px;
            color: #6B7280;
            margin: 4px 0;
          }
          .tips-list {
            background: #FEF3C7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #F59E0B;
          }
          .tip-item {
            font-size: 14px;
            color: #92400E;
            margin-bottom: 10px;
            line-height: 1.6;
          }
          .budget-info {
            background: #ECFDF5;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10B981;
            margin-bottom: 20px;
          }
          .budget-text {
            font-size: 15px;
            color: #065F46;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${itinerary.destination} Itinerary</h1>
            <div class="header-info">${formatDate(itinerary.startDate)} – ${formatDate(itinerary.endDate)}</div>
            <div class="header-info">${itinerary.days} days • ${itinerary.numPeople} ${itinerary.numPeople === 1 ? 'person' : 'people'}</div>
            <div class="header-info">Budget: ${itinerary.currency}${itinerary.budget.toLocaleString()} total (${itinerary.currency}${itinerary.perPersonBudget.toLocaleString()} per person)</div>
          </div>

          <div class="budget-info">
            <div class="budget-text">
              Here's a ${itinerary.days}-day ${itinerary.destination} itinerary for ${itinerary.numPeople} ${itinerary.numPeople === 1 ? 'person' : 'people'}, including a ${itinerary.days - 1}-night stay and sightseeing on a budget of ~${itinerary.currency}${itinerary.perPersonBudget.toLocaleString()} per person.
            </div>
          </div>
    `;

    // Add day-by-day itinerary
    if (itinerary.daysPlan && itinerary.daysPlan.length > 0) {
      html += `<div class="section"><div class="section-title">📅 Day-by-Day Itinerary</div>`;
      itinerary.daysPlan.forEach((day, dayIndex) => {
        html += `
          <div class="day-card">
            <div class="day-title">Day ${dayIndex + 1}: ${day.title || `Day ${dayIndex + 1}`}</div>
        `;

        if (day.activities && day.activities.length > 0) {
          day.activities.forEach((activity) => {
            html += `
              <div class="activity">
                <div class="activity-title">${activity.title || 'Activity'}</div>
            `;

            if (activity.places && activity.places.length > 0) {
              activity.places.forEach((place) => {
                const placeName = place.name || place.location || 'Place';
                html += `<div class="activity-place">📍 ${placeName}</div>`;
                if (place.description) {
                  html += `<div class="activity-description">${place.description}</div>`;
                }
              });
            }

            if (activity.description && (!activity.places || activity.places.length === 0)) {
              html += `<div class="activity-description">${activity.description}</div>`;
            }

            html += `</div>`;
          });
        }

        html += `</div>`;
      });
      html += `</div>`;
    }

    // Add accommodations
    if (itinerary.accommodations && itinerary.accommodations.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">🏨 Accommodation Options</div>
      `;
      itinerary.accommodations.forEach((acc) => {
        html += `
          <div class="accommodation-card">
            <div class="accommodation-name">${acc.name || 'Accommodation'}</div>
            <div class="accommodation-details">Type: ${acc.type || 'N/A'}</div>
            <div class="accommodation-details">Location: ${acc.location || 'N/A'}</div>
            <div class="accommodation-details">Price: ${itinerary.currency}${(acc.price || 0).toLocaleString()} per person</div>
            ${acc.rating ? `<div class="accommodation-details">Rating: ${acc.rating} ⭐</div>` : ''}
          </div>
        `;
      });
      html += `</div>`;
    }

    // Add money saving tips
    html += `
      <div class="section">
        <div class="section-title">🍛 Money-Saving Tips</div>
        <div class="tips-list">
    `;
    tips.forEach((tip) => {
      html += `<div class="tip-item">${tip}</div>`;
    });
    html += `
        </div>
      </div>
    `;

    html += `
        </div>
      </body>
      </html>
    `;

    return html;
  };

  // Generate shareable text content
  const generateShareText = () => {
    if (!itinerary) return '';

    const tips = getMoneySavingTips(itinerary.destination, itinerary.mainCity);
    let text = `🗺️ ${itinerary.destination} Itinerary\n\n`;
    text += `📅 ${formatDate(itinerary.startDate)} – ${formatDate(itinerary.endDate)}\n`;
    text += `⏱️ ${itinerary.days} days • 👥 ${itinerary.numPeople} ${itinerary.numPeople === 1 ? 'person' : 'people'}\n`;
    text += `💰 Budget: ${itinerary.currency}${itinerary.budget.toLocaleString()} total (${itinerary.currency}${itinerary.perPersonBudget.toLocaleString()} per person)\n\n`;

    if (itinerary.daysPlan && itinerary.daysPlan.length > 0) {
      text += `📅 DAY-BY-DAY ITINERARY\n\n`;
      itinerary.daysPlan.forEach((day, dayIndex) => {
        text += `Day ${dayIndex + 1}: ${day.title || `Day ${dayIndex + 1}`}\n`;
        if (day.activities && day.activities.length > 0) {
          day.activities.forEach((activity) => {
            text += `  ${activity.title || 'Activity'}\n`;
            if (activity.places && activity.places.length > 0) {
              activity.places.forEach((place) => {
                const placeName = place.name || place.location || 'Place';
                text += `    📍 ${placeName}\n`;
              });
            }
          });
        }
        text += `\n`;
      });
    }

    if (tips.length > 0) {
      text += `🍛 MONEY-SAVING TIPS\n\n`;
      tips.forEach((tip) => {
        text += `${tip}\n`;
      });
    }

    return text;
  };

  // Share via WhatsApp (shows share options including WhatsApp and other apps)
  const shareViaWhatsApp = async () => {
    if (!itinerary) return;

    try {
      setIsGeneratingPDF(true);

      // Try to generate PDF first
      try {
        const Print = require('expo-print');
        const Sharing = require('expo-sharing');
        const html = generatePDFHTML();
        const { uri } = await Print.printToFileAsync({ html });

        if (await Sharing.isAvailableAsync()) {
          // Show share options including WhatsApp and other apps
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Share Itinerary',
            UTI: 'com.adobe.pdf'
          });
          setShowShareModal(false);
          setIsGeneratingPDF(false);
          return;
        }
      } catch (pdfError) {
        console.log('PDF generation not available, using text share');
      }

      // Fallback to text sharing - show share options (WhatsApp, Messages, etc.)
      const shareText = generateShareText();
      await Share.share({
        message: shareText,
        title: `${itinerary.destination} Itinerary`
      });

      setShowShareModal(false);
      setIsGeneratingPDF(false);
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      setIsGeneratingPDF(false);
      Alert.alert('Error', 'Failed to share itinerary. Please try again.');
    }
  };

  // Download PDF (directly saves without showing share options)
  const downloadPDF = async () => {
    if (!itinerary) return;

    try {
      setIsGeneratingPDF(true);

      // Try to generate and save PDF directly
      let Print, Sharing, FileSystem;
      try {
        Print = require('expo-print');
        Sharing = require('expo-sharing');
        FileSystem = require('expo-file-system');
      } catch (moduleError) {
        // expo-print or expo-sharing not available
        setIsGeneratingPDF(false);
        Alert.alert(
          'PDF Download Unavailable',
          'PDF download requires expo-print and expo-sharing packages.\n\nTo enable PDF download, please install:\n\nnpm install expo-print expo-sharing\n\nFor now, you can use "Share on WhatsApp" to share the itinerary as text.',
          [{ text: 'OK' }]
        );
        setShowShareModal(false);
        return;
      }

      try {
        const html = generatePDFHTML();
        const { uri } = await Print.printToFileAsync({ html });

        // Check if sharing is available
        if (await Sharing.isAvailableAsync()) {
          // Use sharing to save the PDF - this will allow user to save to Downloads
          // On Android, this opens a save dialog
          // On iOS, this opens share sheet where user can save to Files app
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save Itinerary PDF',
            UTI: 'com.adobe.pdf'
          });

          setShowShareModal(false);
          setIsGeneratingPDF(false);
          return;
        }

        // If sharing not available, try to copy to a more accessible location
        try {
          const fileName = `${itinerary.destination.replace(/\s+/g, '_')}_Itinerary_${Date.now()}.pdf`;
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;

          // Copy file to document directory
          await FileSystem.copyAsync({
            from: uri,
            to: fileUri
          });

          Alert.alert(
            'PDF Downloaded',
            `Your itinerary PDF has been saved.\n\nFile: ${fileName}\n\nYou can find it in your device's file manager.`,
            [{ text: 'OK' }]
          );

          setShowShareModal(false);
          setIsGeneratingPDF(false);
          return;
        } catch (fileSystemError) {
          // If copy fails, at least we have the PDF generated
          // Use sharing as fallback
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Save Itinerary PDF'
            });
            setShowShareModal(false);
            setIsGeneratingPDF(false);
            return;
          }

          Alert.alert(
            'PDF Generated',
            `Your itinerary PDF has been generated.\n\nLocation: ${uri}\n\nYou can find it in your device's file manager or use "Share on WhatsApp" to share it.`,
            [{ text: 'OK' }]
          );

          setShowShareModal(false);
          setIsGeneratingPDF(false);
          return;
        }
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        setIsGeneratingPDF(false);
        Alert.alert(
          'PDF Generation Failed',
          `Failed to generate PDF: ${pdfError.message || 'Unknown error'}\n\nPlease try again or use "Share on WhatsApp" to share the itinerary as text.`,
          [{ text: 'OK' }]
        );
        setShowShareModal(false);
        return;
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setIsGeneratingPDF(false);
      Alert.alert(
        'Error',
        `Failed to download PDF: ${error.message || 'Unknown error'}\n\nPlease try again or use "Share on WhatsApp" to share the itinerary.`,
        [{ text: 'OK' }]
      );
      setShowShareModal(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Generating your itinerary...</Text>
      </View>
    );
  }

  if (!itinerary) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No itinerary data available</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{itinerary.destination} Itinerary</Text>
          <Text style={styles.headerSubtitle}>
            {formatDate(itinerary.startDate)} – {formatDate(itinerary.endDate)}
          </Text>
          <Text style={styles.headerInfo}>
            {itinerary.days} days • {itinerary.numPeople} {itinerary.numPeople === 1 ? 'person' : 'people'}
          </Text>
        </View>
      </View>


      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          Here's a {itinerary.days}-day {itinerary.destination} itinerary ({formatDate(itinerary.startDate)} – {formatDate(itinerary.endDate)}) for {itinerary.numPeople} {itinerary.numPeople === 1 ? 'person' : 'people'}, including a {(itinerary.days - 1)}-night stay and sightseeing on a budget of ~{itinerary.currency}{itinerary.perPersonBudget.toLocaleString()} per person.
        </Text>
      </View>

      {/* Accommodation Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🏨</Text>
          <Text style={styles.sectionTitle}>Accommodations ({itinerary.days - 1} Nights) — Hotels, Villas, Resorts & Airbnb</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Here are some well-rated accommodation options in {itinerary.destination} — including hotels, villas, resorts, and Airbnb options. Choose based on your preference and budget.
        </Text>

        <Text style={styles.subsectionTitle}>
          Great Accommodation Choices (Check availability ASAP — prices may vary!)
        </Text>
        <Text style={styles.budgetHint}>
          Top suggestions under group budget ~{itinerary.currency}{(itinerary.accommodations[0].price * itinerary.numPeople * (itinerary.days - 1)).toLocaleString()}–{itinerary.currency}{(itinerary.accommodations[1].price * itinerary.numPeople * (itinerary.days - 1)).toLocaleString()} total for {itinerary.days - 1} nights ({itinerary.currency}{itinerary.accommodations[0].price.toLocaleString()}–{itinerary.currency}{itinerary.accommodations[1].price.toLocaleString()} per person)
        </Text>

        {itinerary.accommodations.slice(0, 6).map((accommodation, index) => (
          <TouchableOpacity
            key={index}
            style={styles.accommodationCard}
            onPress={() => openBookingLink(accommodation.bookingLink)}
            activeOpacity={0.8}
          >
            <View style={styles.accommodationContent}>
              <View style={styles.accommodationInfo}>
                <View style={styles.accommodationHeader}>
                  <Text style={styles.accommodationName}>• {accommodation.name}</Text>
                  <View style={styles.accommodationTypeBadge}>
                    <Text style={styles.accommodationTypeText}>{accommodation.type}</Text>
                  </View>
                </View>
                <Text style={styles.accommodationLocation}>{accommodation.location}</Text>
                <View style={styles.accommodationRating}>
                  <Text style={styles.ratingText}>⭐ {accommodation.rating}</Text>
                  <Text style={styles.accommodationPrice}>
                    {itinerary.currency}{accommodation.price.toLocaleString()} per person
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.bookingButton}
                onPress={() => openBookingLink(accommodation.bookingLink)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.bookingButtonGradient}
                >
                  <Text style={styles.bookingButtonText}>Book →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 Tip: Book ASAP — Peak season prices can spike. Check if accommodation includes kitchen usage to save on food costs. Compare prices across Booking.com, Airbnb, and direct hotel websites.
          </Text>
        </View>
      </View>

      {/* Day-by-Day Plan */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>📅</Text>
          <Text style={styles.sectionTitle}>Day-by-Day Plan</Text>
        </View>

        {itinerary.daysPlan.map((dayPlan, dayIndex) => (
          <View key={dayIndex} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayEmoji}>⭐</Text>
              <View style={styles.dayHeaderContent}>
                <Text style={styles.dayTitle}>Day {dayPlan.day} — {formatDate(dayPlan.date)}</Text>
                {dayIndex === 0 && <Text style={styles.daySubtitle}>Arrival & Explore</Text>}
                {dayIndex === itinerary.daysPlan.length - 1 && <Text style={styles.daySubtitle}>Culture, Views & Return</Text>}
              </View>
            </View>

            {dayPlan.activities.map((activity, actIndex) => {
              // Check if this is a section-based activity
              if (activity.type === 'Section' && activity.places && Array.isArray(activity.places)) {
                // Ensure at least one place is shown
                const placesToShow = activity.places.length > 0 ? activity.places : [{
                  name: activity.title === 'Lunch' ? `Popular Restaurant in ${itinerary.mainCity}` :
                        activity.title === 'Dinner' ? `Popular Restaurant in ${itinerary.mainCity}` :
                        activity.title === 'Evening' ? `Popular Restaurant in ${itinerary.mainCity}` :
                        `Popular Places in ${itinerary.mainCity}`,
                  description: itinerary.mainCity,
                  googleMaps: activity.title === 'Lunch' || activity.title === 'Dinner' || activity.title === 'Evening'
                    ? `https://maps.google.com/?q=restaurants+${encodeURIComponent(itinerary.mainCity)}`
                    : `https://maps.google.com/?q=${encodeURIComponent(itinerary.mainCity + ' tourist attractions')}`
                }];

                return (
                  <View key={actIndex} style={styles.sectionCard}>
                    <Text style={styles.sectionHeading}>{activity.title}</Text>
                    {placesToShow.map((place, placeIndex) => {
                      // Ensure name is always displayed - use name, fallback to address, then generic name
                      const displayName = place.name ||
                                        (place.address ? place.address.split(',')[0].trim() : null) ||
                                        (place.location || place.description) ||
                                        (activity.title === 'Lunch' || activity.title === 'Dinner' ? `Restaurant in ${itinerary.mainCity}` : `Place in ${itinerary.mainCity}`);
                      return (
                      <View key={placeIndex} style={styles.placeItem}>
                        <View style={styles.placeNameRow}>
                          <Text style={styles.placeName}>• {displayName}</Text>
                          {place.googleMaps && (
                            <TouchableOpacity
                              style={styles.inlineMapButton}
                              onPress={() => openGoogleMaps(place.googleMaps)}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.inlineMapButtonText}>📍 Map</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                        {place.cost > 0 && (
                          <Text style={styles.placeCost}>
                            Cost: {itinerary.currency}{place.cost.toLocaleString()} per person
                          </Text>
                        )}
                      </View>
                      );
                    })}
                  </View>
                );
              }

              // Regular activity (fallback for non-section activities)
              return (
                <View key={actIndex} style={styles.activityCard}>
                  <View style={styles.activityTimeContainer}>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                  <View style={styles.activityContent}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      {activity.googleMaps && (
                        <TouchableOpacity
                          style={styles.mapButton}
                          onPress={() => openGoogleMaps(activity.googleMaps)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.mapButtonText}>📍 Map</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {activity.description && (
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                    )}
                    {activity.cost > 0 && (
                      <Text style={styles.activityCost}>
                        Cost: {itinerary.currency}{activity.cost} per person
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Cost Breakdown */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>💸</Text>
          <Text style={styles.sectionTitle}>Estimated Budget (Per Person)</Text>
        </View>

        <View style={styles.costTable}>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Villa Stay ({(itinerary.days - 1)} nights split {itinerary.numPeople} ways)</Text>
            <Text style={styles.costValue}>
              {itinerary.currency}{(itinerary.costBreakdown.accommodation / itinerary.numPeople).toLocaleString()}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Food ({itinerary.days * 3} meals approx)</Text>
            <Text style={styles.costValue}>
              {itinerary.currency}{(itinerary.costBreakdown.food / itinerary.numPeople).toLocaleString()}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Local travel & sight entries</Text>
            <Text style={styles.costValue}>
              {itinerary.currency}{(itinerary.costBreakdown.localTravel / itinerary.numPeople).toLocaleString()}
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Misc & snacks</Text>
            <Text style={styles.costValue}>
              {itinerary.currency}{(itinerary.costBreakdown.misc / itinerary.numPeople).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.costRow, styles.costRowTotal]}>
            <Text style={styles.costLabelTotal}>Total</Text>
            <Text style={styles.costValueTotal}>
              ~{itinerary.currency}{itinerary.costBreakdown.perPerson.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.budgetNote}>
          <Text style={styles.budgetNoteText}>
            Target ~{itinerary.currency}{itinerary.perPersonBudget.toLocaleString()} per person — choose villa and food options wisely to stay within budget.
          </Text>
        </View>
      </View>

      {/* Money-Saving Tips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🍛</Text>
          <Text style={styles.sectionTitle}>Money-Saving Tips</Text>
        </View>

        <View style={styles.tipsList}>
          {getMoneySavingTips(itinerary.destination, itinerary.mainCity).map((tip, index) => (
            <Text key={index} style={styles.tipItem}>{tip}</Text>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveTrip}
          activeOpacity={0.9}
          disabled={isSaving}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.saveButtonGradient}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>💾 Save This Trip</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => setShowShareModal(true)}
          activeOpacity={0.9}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.shareButtonText}>📤 Share Itinerary</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Need help? Want a pre-booked transport plan (car/train timings) or help choosing the best villa within strict {itinerary.currency}{itinerary.budget.toLocaleString()} total?
        </Text>
      </View>

      {/* Share Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.shareModalOverlay}>
          <View style={styles.shareModalContent}>
            <View style={styles.shareModalHeader}>
              <Text style={styles.shareModalTitle}>Share Itinerary</Text>
              <TouchableOpacity
                onPress={() => setShowShareModal(false)}
                style={styles.shareModalClose}
              >
                <Text style={styles.shareModalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.shareOptionsContainer}>
              <TouchableOpacity
                style={styles.shareOption}
                onPress={shareViaWhatsApp}
                disabled={isGeneratingPDF}
                activeOpacity={0.7}
              >
                <View style={[styles.shareOptionIcon, { backgroundColor: '#25D366' }]}>
                  <Text style={styles.shareOptionIconText}>💬</Text>
                </View>
                <Text style={styles.shareOptionText}>Share on WhatsApp</Text>
                {isGeneratingPDF && (
                  <ActivityIndicator size="small" color="#10B981" style={{ marginLeft: 10 }} />
                )}
              </TouchableOpacity>
            </View>

            {isGeneratingPDF && (
              <View style={styles.generatingContainer}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={styles.generatingText}>Generating PDF...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonIcon: {
    fontSize: 28,
    color: '#111827',
    fontWeight: 'bold',
  },
  backButtonText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  headerInfo: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  summaryCard: {
    backgroundColor: '#10B981',
    margin: 20,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    fontWeight: '500',
  },
  debugBanner: {
    margin: 20,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  debugSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  debugDetailText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  debugWarning: {
    fontSize: 13,
    color: '#92400E',
    marginTop: 8,
    fontStyle: 'italic',
  },
  apiErrorContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  apiErrorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 6,
  },
  apiErrorText: {
    fontSize: 12,
    color: '#7F1D1D',
    marginBottom: 4,
  },
  apiErrorFix: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 8,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 8,
  },
  budgetHint: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  accommodationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accommodationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accommodationInfo: {
    flex: 1,
  },
  accommodationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  accommodationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  accommodationTypeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  accommodationTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369A1',
  },
  accommodationLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  accommodationRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  accommodationPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  bookingButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 12,
  },
  bookingButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  bookingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  tipCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  dayHeaderContent: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  daySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  activityCard: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  activityTimeContainer: {
    width: 80,
    marginRight: 16,
  },
  activityTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  mapButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  mapButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  activityDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  activityCost: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  placeItem: {
    marginBottom: 12,
    paddingLeft: 8,
  },
  placeNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  inlineMapButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 4,
  },
  inlineMapButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  placeDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  placeCost: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  costTable: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  costRowTotal: {
    borderTopWidth: 2,
    borderTopColor: '#10B981',
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
  },
  costLabel: {
    fontSize: 15,
    color: '#6B7280',
    flex: 1,
  },
  costValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  costLabelTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  costValueTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10B981',
  },
  budgetNote: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  budgetNoteText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  tipsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  tipItem: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 12,
  },
  actionButtons: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  shareButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  shareButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  shareModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '50%',
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  shareModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareModalCloseText: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: 'bold',
    lineHeight: 28,
  },
  shareOptionsContainer: {
    padding: 20,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shareOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  shareOptionIconText: {
    fontSize: 24,
  },
  shareOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 10,
  },
  generatingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
});