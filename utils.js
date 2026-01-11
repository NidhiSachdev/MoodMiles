/**
 * Utility functions for Google Sheets API integration
 * This file contains helper functions to interact with Google Sheets
 */

const GOOGLE_SHEETS_API_URL = 'YOUR_WEB_APP_URL_HERE'; // Replace with your deployed Google Apps Script URL

/**
 * Send user registration data to Google Sheets
 */
export const logUserRegistration = async (userData) => {
  try {
    const response = await fetch(GOOGLE_SHEETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        password: userData.password, // Note: In production, consider not sending password
        createdAt: userData.createdAt,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ User registration logged to Google Sheets:', result.email);
      return { success: true, data: result };
    } else {
      console.warn('⚠️ Failed to log registration:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Error logging registration to Google Sheets:', error);
    // Don't throw error - registration should still succeed even if logging fails
    return { success: false, error: error.message };
  }
};

/**
 * Track user login in Google Sheets
 */
export const logUserLogin = async (email) => {
  try {
    const response = await fetch(GOOGLE_SHEETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        email: email,
        loginDate: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ User login tracked:', {
        email: result.email,
        loginCount: result.loginCount,
        lastLoginDate: result.lastLoginDate,
      });
      return { success: true, data: result };
    } else {
      console.warn('⚠️ Failed to track login:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Error tracking login to Google Sheets:', error);
    // Don't throw error - login should still succeed even if tracking fails
    return { success: false, error: error.message };
  }
};