import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Alert,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logUserRegistration, logUserLogin, logPasswordUpdate } from './googleSheetsConfig';

const { width, height } = Dimensions.get('window');

const USER_STORAGE_KEY = '@moodmiles_user';
const AUTH_STORAGE_KEY = '@moodmiles_auth';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot Password states
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (authData) {
        const { isAuthenticated } = JSON.parse(authData);
        if (isAuthenticated) {
          navigation.replace('Home');
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const handleRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // Check if email already exists
      const existingUsers = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const users = existingUsers ? JSON.parse(existingUsers) : {};

      if (users[email]) {
        Alert.alert('Error', 'An account with this email already exists. Please login instead.');
        setIsLoading(false);
        setIsLogin(true);
        return;
      }

      // Save user data
      const userEmail = email.toLowerCase().trim();
      const userData = {
        fullName: fullName.trim(),
        email: userEmail,
        phone: phone.replace(/\D/g, ''),
        password: password, // In production, hash this password
        createdAt: new Date().toISOString(),
      };

      users[userEmail] = userData;

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));

      // Log registration to Google Sheets (non-blocking)
      logUserRegistration(userData).catch(err => {
        console.error('Failed to log registration to Google Sheets:', err);
        // Don't show error to user - registration still succeeded
      });

      // Set auth status
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        isAuthenticated: true,
        email: userEmail,
        loginMethod: 'email',
      }));

      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Home'),
        },
      ]);
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    // Validation
    if (!validateEmail(forgotPasswordEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsResettingPassword(true);
    try {
      // Check if user exists
      const usersData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const users = usersData ? JSON.parse(usersData) : {};

      const userEmail = forgotPasswordEmail.toLowerCase().trim();
      const user = users[userEmail];

      if (!user) {
        Alert.alert('Error', 'No account found with this email. Please register first.');
        setIsResettingPassword(false);
        return;
      }

      // Update password in AsyncStorage
      users[userEmail] = {
        ...users[userEmail],
        password: newPassword,
      };

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));

      // Update password in Google Sheets (non-blocking)
      logPasswordUpdate({
        email: userEmail,
        password: newPassword,
      }).catch(err => {
        console.error('Failed to update password in Google Sheets:', err);
        // Don't show error to user - password reset still succeeded locally
      });

      Alert.alert(
        'Success',
        'Password reset successfully! You can now login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowForgotPasswordModal(false);
              setForgotPasswordEmail('');
              setNewPassword('');
              setConfirmNewPassword('');
              // Pre-fill email in login form
              setEmail(userEmail);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleLogin = async () => {
    // Validation
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const usersData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const users = usersData ? JSON.parse(usersData) : {};

      const user = users[email.toLowerCase().trim()];

      if (!user) {
        Alert.alert('Error', 'No account found with this email. Please register first.');
        setIsLoading(false);
        return;
      }

      if (user.password !== password) {
        Alert.alert('Error', 'Incorrect password. Please try again.');
        setIsLoading(false);
        return;
      }

      const userEmail = email.toLowerCase().trim();

      // Track login in Google Sheets (non-blocking)
      logUserLogin(userEmail).catch(err => {
        console.error('Failed to track login in Google Sheets:', err);
        // Don't show error to user - login still succeeded
      });

      // Set auth status
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        isAuthenticated: true,
        email: userEmail,
        loginMethod: 'email',
      }));

      navigation.replace('Home');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.7)']}
          style={styles.overlay}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Branding Section */}
            <View style={styles.brandingContainer}>
              <Text style={styles.appName}>MoodMiles</Text>
              <Text style={styles.tagline}>Trips that match your vibe</Text>
            </View>

            {/* Auth Card */}
            <View style={styles.authCard}>
              {/* Toggle Buttons */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
                  onPress={() => {
                    setIsLogin(true);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleButtonText, isLogin && styles.toggleButtonTextActive]}>
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
                  onPress={() => {
                    setIsLogin(false);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toggleButtonText, !isLogin && styles.toggleButtonTextActive]}>
                    Register
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form */}
              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your 10-digit phone number"
                    placeholderTextColor="#999"
                    value={phone}
                    onChangeText={(text) => {
                      const cleaned = text.replace(/\D/g, '');
                      if (cleaned.length <= 10) {
                        setPhone(cleaned);
                      }
                    }}
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={!isLoading}
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              {!isLogin && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!isLoading}
                  />
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={isLogin ? handleLogin : handleRegister}
                activeOpacity={0.9}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.submitButtonGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {isLogin ? 'Login' : 'Create Account'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Forgot Password (Login only) */}
              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotPasswordButton}
                  onPress={() => setShowForgotPasswordModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowForgotPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>Enter your email and new password</Text>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>Email Address</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={forgotPasswordEmail}
                onChangeText={setForgotPasswordEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isResettingPassword}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>New Password</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter new password (min 6 characters)"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!isResettingPassword}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Confirm new password"
                placeholderTextColor="#999"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
                editable={!isResettingPassword}
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowForgotPasswordModal(false);
                  setForgotPasswordEmail('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                }}
                activeOpacity={0.8}
                disabled={isResettingPassword}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleForgotPassword}
                activeOpacity={0.8}
                disabled={isResettingPassword}
              >
                {isResettingPassword ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  authCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#10B981',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  forgotPasswordButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalInputContainer: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubmitButton: {
    backgroundColor: '#10B981',
  },
  modalSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});