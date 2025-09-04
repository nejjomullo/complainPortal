/**
 * Utility functions for saving and retrieving registration, group head, and complaint data.
 * Uses API calls for client registration and complaints, localStorage for group heads.
 */

/**
 * Save client registration data to storage.
 * @param {Object} data - The registration data to save.
 * @returns {Promise<void>} - Resolves when data is saved.
 */
export const saveRegistrationData = async (data) => {
  try {
    // API Integration: Save to backend
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error saving registration');
    }
  } catch (error) {
    console.error('Error saving registration data:', error);
    throw error;
  }
};

/**
 * Retrieve client registration data from storage.
 * @param {string} email - The email to look up.
 * @param {string} password - The password to validate.
 * @returns {Promise<Object|null>} - The registration data or null if not found or credentials invalid.
 */
export const getRegistrationData = async (email, password) => {
  try {
    // API Integration: Retrieve from backend
    const response = await fetch(
      `http://localhost:3000/api/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    );
    if (!response.ok) {
      return null; // Handle invalid credentials or errors
    }
    const user = await response.json();
    return user || null;
  } catch (error) {
    console.error('Error retrieving registration data:', error);
    return null;
  }
};

/**
 * Save Group Head account data to storage.
 * @param {Object} data - The Group Head account data to save.
 * @returns {Promise<void>} - Resolves when data is saved.
 */
export const saveGroupHeadData = async (data) => {
  try {
    // Current: Save to localStorage
    const existingData = JSON.parse(localStorage.getItem('groupHeadData')) || [];
    existingData.push(data);
    localStorage.setItem('groupHeadData', JSON.stringify(existingData));
  } catch (error) {
    console.error('Error saving Group Head data:', error);
    throw error;
  }
};

/**
 * Retrieve Group Head account data from storage.
 * @param {string} email - The email to look up.
 * @returns {Promise<Object|null>} - The Group Head data or null if not found.
 */
export const getGroupHeadData = async (email) => {
  try {
    // Current: Retrieve from localStorage
    const data = JSON.parse(localStorage.getItem('groupHeadData')) || [];
    const groupHead = data.find((gh) => gh.email === email);
    return groupHead || null;
  } catch (error) {
    console.error('Error retrieving Group Head data:', error);
    return null;
  }
};

/**
 * Save complaint data to storage.
 * @param {Object} data - The complaint data to save.
 * @returns {Promise<void>} - Resolves when data is saved.
 */
export const saveComplaintData = async (data) => {
  try {
    // API Integration: Save to backend
    const response = await fetch('http://localhost:3000/api/complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error saving complaint');
    }
  } catch (error) {
    console.error('Error saving complaint data:', error);
    throw error;
  }
};

/**
 * Retrieve complaint data from storage.
 * @param {Object} options - Optional filters: { groupHead, email }.
 * @returns {Promise<Array>} - List of complaints matching the filters.
 */
export const getComplaintData = async ({ groupHead, email } = {}) => {
  try {
    // API Integration: Retrieve from backend
    let url = 'http://localhost:3000/api/complaint';
    if (groupHead && email) {
      url += `?groupHead=${encodeURIComponent(groupHead)}&email=${encodeURIComponent(email)}`;
    } else if (groupHead) {
      url += `?groupHead=${encodeURIComponent(groupHead)}`;
    } else if (email) {
      url += `?email=${encodeURIComponent(email)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error retrieving complaints');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error retrieving complaint data:', error);
    return [];
  }
};

/**
 * Update complaint status or delay reason.
 * @param {string} complaintId - The ID of the complaint to update.
 * @param {Object} updates - The updates to apply (e.g., { status: 'Resolved', delayReason: '...' }).
 * @returns {Promise<void>} - Resolves when updated.
 */
export const updateComplaintData = async (complaintId, updates) => {
  try {
    // Current: Update in localStorage
    const data = JSON.parse(localStorage.getItem('complaintData')) || [];
    const updatedData = data.map((complaint) =>
      complaint.id === complaintId ? { ...complaint, ...updates } : complaint
    );
    localStorage.setItem('complaintData', JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error updating complaint data:', error);
    throw error;
  }
};