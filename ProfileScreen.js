import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ImageBackground,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logProfileUpdate } from './googleSheetsConfig';

const USER_STORAGE_KEY = '@moodmiles_user';
const AUTH_STORAGE_KEY = '@moodmiles_auth';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    fullName: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      // Get the current authenticated user's email
      const authData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!authData) {
        Alert.alert('Error', 'No user session found. Please login again.');
        navigation.replace('Login');
        return;
      }

      const { email } = JSON.parse(authData);

      // Get user data from storage
      const usersData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (!usersData) {
        Alert.alert('Error', 'User data not found.');
        navigation.replace('Login');
        return;
      }

      const users = JSON.parse(usersData);
      const user = users[email];

      if (!user) {
        Alert.alert('Error', 'User profile not found.');
        navigation.replace('Login');
        return;
      }

      setUserData(user);
      setEditedData({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      fullName: userData.fullName || '',
      phone: userData.phone || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      fullName: userData.fullName || '',
      phone: userData.phone || '',
    });
  };

  const handleSave = async () => {
    if (!editedData.fullName || editedData.fullName.trim() === '') {
      Alert.alert('Validation Error', 'Full name is required.');
      return;
    }

    try {
      setIsSaving(true);

      // Get the current authenticated user's email
      const authData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!authData) {
        Alert.alert('Error', 'No user session found.');
        return;
      }

      const { email } = JSON.parse(authData);

      // Get all users data
      const usersData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (!usersData) {
        Alert.alert('Error', 'User data not found.');
        return;
      }

      const users = JSON.parse(usersData);

      // Update user data
      const updatedUser = {
        ...users[email],
        fullName: editedData.fullName.trim(),
        phone: editedData.phone.trim(),
      };

      users[email] = updatedUser;

      // Save updated users data
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));

      // Update profile in Google Sheets (non-blocking)
      logProfileUpdate({
        email: email,
        fullName: editedData.fullName.trim(),
        phone: editedData.phone.trim(),
      }).catch(err => {
        console.error('Failed to update profile in Google Sheets:', err);
        // Don't show error to user - profile update still succeeded locally
      });

      // Update local state
      setUserData(updatedUser);
      setIsEditing(false);

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return 'N/A';
    // Format phone number as XXX-XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const backgroundImage = {
    uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=95&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.7)']}
            style={styles.overlay}
          >
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.7)']}
            style={styles.overlay}
          >
            <Text style={styles.errorText}>No profile data available</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        resizeMode="cover"
        pointerEvents="none"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.4)']}
          style={styles.overlay}
          pointerEvents="none"
        />
      </ImageBackground>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{userData.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{userData.email || 'N/A'}</Text>
        </View>

        {/* Profile Details Card */}
        <View style={styles.profileCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Profile Information</Text>
            <Text style={styles.cardSubtitle}>Your account details</Text>
          </View>

          {/* Full Name */}
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoIcon}>👤</Text>
              <Text style={styles.infoLabel}>Full Name</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.inputField}
                value={editedData.fullName}
                onChangeText={(text) => setEditedData({ ...editedData, fullName: text })}
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
              />
            ) : (
              <Text style={styles.infoValue}>{userData.fullName || 'N/A'}</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Email */}
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoIcon}>📧</Text>
              <Text style={styles.infoLabel}>Email Address</Text>
            </View>
            <Text style={styles.infoValue}>{userData.email || 'N/A'}</Text>
          </View>

          <View style={styles.divider} />

          {/* Phone */}
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoIcon}>📱</Text>
              <Text style={styles.infoLabel}>Phone Number</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.inputField}
                value={editedData.phone}
                onChangeText={(text) => setEditedData({ ...editedData, phone: text })}
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{formatPhone(userData.phone)}</Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Account Created */}
          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoLabel}>Member Since</Text>
            </View>
            <Text style={styles.infoValue}>{formatDate(userData.createdAt)}</Text>
          </View>
        </View>

        {/* Account Actions Card */}
        <View style={styles.actionsCard}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={isSaving}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.actionButtonGradient}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.actionButtonIcon}>💾</Text>
                      <Text style={styles.actionButtonText}>Save Changes</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.8}
                disabled={isSaving}
              >
                <View style={styles.cancelButtonContent}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.actionButtonGradient}
                >
                  <Text style={styles.actionButtonIcon}>✏️</Text>
                  <Text style={styles.actionButtonText}>Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <View style={styles.secondaryButtonContent}>
                  <Text style={styles.secondaryButtonText}>Back to Home</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
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
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoRow: {
    paddingVertical: 16,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  inputField: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cancelButton: {
    shadowColor: '#EF4444',
    shadowOpacity: 0.1,
  },
  cancelButtonContent: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsCard: {
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  secondaryButtonContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});