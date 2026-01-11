/**
 * Google Sheets API Configuration
 *
 * IMPORTANT: Replace YOUR_WEB_APP_URL_HERE with your deployed Google Apps Script URL
 *
 * To get your URL:
 * 1. Deploy Google Apps Script as Web App
 * 2. Copy the Web App URL
 * 3. Paste it below
 */

export const GOOGLE_SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbx8lPY9s8zl6bkbSCdBuElxCVfXue03Q804Dy2W9W3XvJFVD4iwFC-CHrlD1_1s_8ahdg/exec';

/**
 * Helper function to log user registration to Google Sheets
 */
export const logUserRegistration = async (userData) => {
  if (!GOOGLE_SHEETS_API_URL || GOOGLE_SHEETS_API_URL === 'YOUR_WEB_APP_URL_HERE') {
    console.warn('⚠️ Google Sheets API URL not configured. Skipping registration log.');
    return { success: false, error: 'API URL not configured' };
  }

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
 * Helper function to track user login in Google Sheets
 */
export const logUserLogin = async (email) => {
  if (!GOOGLE_SHEETS_API_URL || GOOGLE_SHEETS_API_URL === 'YOUR_WEB_APP_URL_HERE') {
    console.warn('⚠️ Google Sheets API URL not configured. Skipping login tracking.');
    return { success: false, error: 'API URL not configured' };
  }

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

/**
 * Helper function to update user password in Google Sheets
 */
export const logPasswordUpdate = async (userData) => {
  if (!GOOGLE_SHEETS_API_URL || GOOGLE_SHEETS_API_URL === 'YOUR_WEB_APP_URL_HERE') {
    console.warn('⚠️ Google Sheets API URL not configured. Skipping password update.');
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updatePassword',
        email: userData.email,
        password: userData.password,
        updatedAt: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Password update logged to Google Sheets:', result.email);
      return { success: true, data: result };
    } else {
      console.warn('⚠️ Failed to log password update:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Error logging password update to Google Sheets:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper function to update user profile in Google Sheets
 */
export const logProfileUpdate = async (userData) => {
  if (!GOOGLE_SHEETS_API_URL || GOOGLE_SHEETS_API_URL === 'YOUR_WEB_APP_URL_HERE') {
    console.warn('⚠️ Google Sheets API URL not configured. Skipping profile update.');
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateProfile',
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone,
        updatedAt: new Date().toISOString(),
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Profile update logged to Google Sheets:', result.email);
      return { success: true, data: result };
    } else {
      console.warn('⚠️ Failed to log profile update:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Error logging profile update to Google Sheets:', error);
    // Don't throw error - profile update should still succeed even if logging fails
    return { success: false, error: error.message };
  }
};