/**
 * Google Apps Script for MoodMiles User Tracking
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Paste this code
 * 4. Create a Google Sheet with these columns (in order):
 *    - Email, Full Name, Phone, Password, Created At, Login Count, Last Login Date, Registration Date
 * 5. Get the Sheet ID from the URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
 * 6. Replace SHEET_NAME with your sheet name (e.g., "Sheet1")
 * 7. Deploy as Web App (Execute as: Me, Who has access: Anyone)
 * 8. Copy the Web App URL and use it in your app
 */

// CONFIGURATION - UPDATE THESE VALUES
const SHEET_ID = '1krKEwD5OV4ieFYpQoA0kVru6pOBkCANkane9DTnpK60'; // Your Google Sheet ID
const SHEET_NAME = 'Sheet1'; // Change to your sheet name if different

/**
 * Handle POST request for user registration
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    let result;
    if (action === 'register') {
      result = handleRegistration(data);
    } else if (action === 'login') {
      result = handleLogin(data);
    } else if (action === 'updateProfile') {
      result = handleProfileUpdate(data);
    } else if (action === 'updatePassword') {
      result = handlePasswordUpdate(data);
    } else {
      result = {
        success: false,
        error: 'Invalid action'
      };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET request (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Google Sheets API is running',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle user registration
 */
function handleRegistration(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    // Check if headers exist, if not create them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Email',
        'Full Name',
        'Phone',
        'Password',
        'Created At',
        'Login Count',
        'Last Login Date',
        'Registration Date'
      ]);
    }

    // Check if user already exists
    const email = data.email.toLowerCase().trim();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    // Find existing user (skip header row)
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] && values[i][0].toLowerCase().trim() === email) {
        return {
          success: false,
          error: 'User already exists'
        };
      }
    }

    // Add new user
    const now = new Date().toISOString();
    sheet.appendRow([
      email,
      data.fullName || '',
      data.phone || '',
      data.password || '', // Note: In production, don't store passwords
      now,
      0, // Login Count starts at 0
      '', // Last Login Date (empty initially)
      now // Registration Date
    ]);

    return {
      success: true,
      message: 'User registered successfully',
      email: email
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Handle user login
 */
function handleLogin(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const email = data.email.toLowerCase().trim();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    // Find user (skip header row)
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] && values[i][0].toLowerCase().trim() === email) {
        // User found - update login count and last login date
        const currentLoginCount = values[i][5] || 0; // Column F (index 5)
        const newLoginCount = parseInt(currentLoginCount) + 1;
        const lastLoginDate = new Date().toISOString();

        // Update login count (column F, index 5)
        sheet.getRange(i + 1, 6).setValue(newLoginCount);

        // Update last login date (column G, index 6)
        sheet.getRange(i + 1, 7).setValue(lastLoginDate);

        return {
          success: true,
          message: 'Login tracked successfully',
          email: email,
          loginCount: newLoginCount,
          lastLoginDate: lastLoginDate
        };
      }
    }

    // User not found - could be first login from another device
    // Optionally create entry here, or return error
    return {
      success: false,
      error: 'User not found. Please register first.'
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Handle user profile update
 */
function handleProfileUpdate(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const email = data.email.toLowerCase().trim();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    // Find user (skip header row)
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] && values[i][0].toLowerCase().trim() === email) {
        // Update Full Name (column B, index 1)
        if (data.fullName) {
          sheet.getRange(i + 1, 2).setValue(data.fullName);
        }
        // Update Phone (column C, index 2)
        if (data.phone) {
          sheet.getRange(i + 1, 3).setValue(data.phone);
        }

        return {
          success: true,
          message: 'Profile updated successfully',
          email: email
        };
      }
    }

    return {
      success: false,
      error: 'User not found'
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Handle user password update
 */
function handlePasswordUpdate(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const email = data.email.toLowerCase().trim();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    // Find user (skip header row)
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] && values[i][0].toLowerCase().trim() === email) {
        // Update Password (column D, index 3)
        if (data.password) {
          sheet.getRange(i + 1, 4).setValue(data.password);
        }

        return {
          success: true,
          message: 'Password updated successfully',
          email: email
        };
      }
    }

    return {
      success: false,
      error: 'User not found'
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}