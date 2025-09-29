import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const completenessApi = {
  // Fetch completeness test data
  fetchCompletenessData: async (engagementId) => {
    const response = await axios.get(`${API_BASE_URL}/completeness-test/engagement/${engagementId}/`, {
      timeout: 10000
    });
    return response.data;
  },

  // Fetch account verifications data
  fetchAccountVerifications: async (engagementId, failedOnly = false) => {
    const params = failedOnly ? { failed_only: true } : {};
    const response = await axios.get(`${API_BASE_URL}/account-verifications/engagement/${engagementId}/`, {
      timeout: 5000,
      params
    });
    return response.data;
  },

  // Fetch document verifications data
  fetchDocumentVerifications: async (engagementId, unbalancedOnly = false) => {
    const params = unbalancedOnly ? { unbalanced_only: true } : {};
    const response = await axios.get(`${API_BASE_URL}/document-verifications/engagement/${engagementId}/`, {
      timeout: 5000,
      params
    });
    return response.data;
  },

  // Fetch profit center data
  fetchProfitCenterData: async (accountId) => {
    const response = await axios.get(`${API_BASE_URL}/profit-center-data/account/${accountId}/`, {
      timeout: 5000
    });
    return response.data;
  }
};
