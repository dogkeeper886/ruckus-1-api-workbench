import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

async function makeRuckusApiCall<T = any>(
  config: AxiosRequestConfig,
  operationName: string
): Promise<AxiosResponse<T>> {
  try {
    return await axios(config);
  } catch (error: any) {
    if (error.response) {
      // Create a more detailed error message
      let errorMessage = `${operationName} failed with status ${error.response.status}`;
      
      // Add specific API error details if available
      if (error.response.data) {
        // Handle RUCKUS API error format
        if (error.response.data.error) {
          errorMessage += ` - API Error: ${error.response.data.error}`;
        }
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          const firstError = error.response.data.errors[0];
          if (firstError) {
            if (firstError.code) {
              errorMessage += ` - Error Code: ${firstError.code}`;
            }
            if (firstError.message) {
              errorMessage += ` - Error Message: ${firstError.message}`;
            }
            if (firstError.reason) {
              errorMessage += ` - Reason: ${firstError.reason}`;
            }
          }
        }
        if (error.response.data.message) {
          errorMessage += ` - Message: ${error.response.data.message}`;
        }
        if (error.response.data.code) {
          errorMessage += ` - Code: ${error.response.data.code}`;
        }
        if (error.response.data.details) {
          errorMessage += ` - Details: ${JSON.stringify(error.response.data.details)}`;
        }
      }
      
      const detailedError = new Error(errorMessage) as any;
      detailedError.response = error.response;
      detailedError.request = error.request;
      detailedError.name = 'RuckusApiError';
      throw detailedError;
    }
    throw error;
  }
}

export async function getRuckusJwtToken(
  tenantId: string,
  clientId: string,
  clientSecret: string,
  region: string = ''
): Promise<string> {
  const url = `https://${region ? region + '.' : ''}ruckus.cloud/oauth2/token/${tenantId}`;
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);

  const response = await makeRuckusApiCall({
    method: 'post',
    url,
    data: params,
    headers: { 'content-type': 'application/x-www-form-urlencoded' }
  }, 'OAuth token request');

  return response.data.access_token;
} 

export async function getRuckusActivityDetails(
  token: string,
  activityId: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/activities/${activityId}`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get activity details');

  return response.data;
}

export async function getVenueExternalAntennaSettings(
  token: string,
  venueId: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/venues/${venueId}/apModelExternalAntennaSettings`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get venue external antenna settings');

  return response.data;
}

export async function getVenueAntennaTypeSettings(
  token: string,
  venueId: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/venues/${venueId}/apModelAntennaTypeSettings`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get venue antenna type settings');

  return response.data;
}

export async function getApGroupExternalAntennaSettings(
  token: string,
  venueId: string,
  apGroupId: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}/apModelExternalAntennaSettings`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get AP group external antenna settings');

  return response.data;
}

export async function getApGroupAntennaTypeSettings(
  token: string,
  venueId: string,
  apGroupId: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}/apModelAntennaTypeSettings`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get AP group antenna type settings');

  return response.data;
}

export async function getVenueApModelBandModeSettings(
  token: string,
  venueId: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/venues/${venueId}/apModelBandModeSettings`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get venue AP model band mode settings');

  return response.data;
}

export async function getVenueRadioSettings(
  token: string,
  venueId: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/venues/${venueId}/apRadioSettings`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get venue radio settings');

  return response.data;
}

export async function getApGroupApModelBandModeSettings(
  token: string,
  venueId: string,
  apGroupId: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}/apModelBandModeSettings`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get AP group AP model band mode settings');

  return response.data;
}

export async function getApGroupRadioSettings(
  token: string,
  venueId: string,
  apGroupId: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}/radioSettings`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get AP group radio settings');

  return response.data;
}

export async function getApRadioSettings(
  token: string,
  venueId: string,
  apSerialNumber: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/venues/${venueId}/aps/${apSerialNumber}/radioSettings`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get AP radio settings');

  return response.data;
}

export async function getApClientAdmissionControlSettings(
  token: string,
  venueId: string,
  apSerialNumber: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/venues/${venueId}/aps/${apSerialNumber}/clientAdmissionControlSettings`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get AP client admission control settings');

  return response.data;
}

export async function getApGroupClientAdmissionControlSettings(
  token: string,
  venueId: string,
  apGroupId: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}/apClientAdmissionControlSettings`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get AP group client admission control settings');

  return response.data;
}

export async function deleteVenueWithRetry(
  token: string,
  venueId: string,
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/venues/${venueId}`
    : `https://api.ruckus.cloud/venues/${venueId}`;

  const response = await makeRuckusApiCall({
    method: 'delete',
    url: apiUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Delete venue');

  const deleteResponse = response.data;
  
  // Always get requestId for async tracking (delete operations always return requestId)
  const activityId = deleteResponse.requestId;
  
  if (!activityId) {
    throw new Error('No requestId returned from venue deletion API');
  }

  // Poll for completion status
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      
      // Check if operation is completed (has endDatetime populated)
      const isCompleted = activityDetails.endDatetime !== undefined;
      
      // Check if operation failed (status is not SUCCESS or INPROGRESS)
      const isFailed = 
        activityDetails.status !== 'SUCCESS' && 
        activityDetails.status !== 'INPROGRESS';

      if (isCompleted) {
        // Check if it completed successfully
        if (activityDetails.status === 'SUCCESS') {
          return {
            ...deleteResponse,
            activityDetails,
            status: 'completed',
            message: 'Venue deleted successfully'
          };
        } else {
          return {
            ...deleteResponse,
            activityDetails,
            status: 'failed',
            message: 'Venue deletion failed',
            error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status'
          };
        }
      }

      if (isFailed) {
        return {
          ...deleteResponse,
          activityDetails,
          status: 'failed',
          message: 'Venue deletion failed',
          error: activityDetails.error || activityDetails.message || 'Unknown error'
        };
      }

      // If still in progress, increment retry count and continue
      retryCount++;
      console.log(`[RUCKUS] Venue deletion in progress, attempt ${retryCount}/${maxRetries}`);
      
      // If we've reached max retries, exit loop
      if (retryCount >= maxRetries) {
        break;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      
    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);
      
      // If we've reached max retries, return error
      if (retryCount >= maxRetries) {
        return {
          ...deleteResponse,
          status: 'timeout',
          message: 'Venue deletion status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...deleteResponse,
    status: 'timeout',
    message: 'Venue deletion status unknown - polling timeout',
    activityId
  };
}

export async function createVenueWithRetry(
  token: string,
  venueData: {
    name: string;
    addressLine: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/venues`
    : 'https://api.ruckus.cloud/venues';

  const payload = {
    name: venueData.name,
    address: {
      addressLine: venueData.addressLine,
      city: venueData.city,
      country: venueData.country,
      ...(venueData.latitude !== undefined && { latitude: venueData.latitude }),
      ...(venueData.longitude !== undefined && { longitude: venueData.longitude }),
      ...(venueData.timezone && { timezone: venueData.timezone }),
    },
  };

  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Create venue');

  const createResponse = response.data;
  
  // Always get requestId for async tracking (create operations always return requestId)
  const activityId = createResponse.requestId;
  
  if (!activityId) {
    throw new Error('No requestId returned from venue creation API');
  }

  // Poll for completion status
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      
      // Check if operation is completed (has endDatetime populated)
      const isCompleted = activityDetails.endDatetime !== undefined;
      
      // Check if operation failed (status is not SUCCESS or INPROGRESS)
      const isFailed = 
        activityDetails.status !== 'SUCCESS' && 
        activityDetails.status !== 'INPROGRESS';

      if (isCompleted) {
        // Check if it completed successfully
        if (activityDetails.status === 'SUCCESS') {
          return {
            ...createResponse,
            activityDetails,
            status: 'completed',
            message: 'Venue created successfully'
          };
        } else {
          return {
            ...createResponse,
            activityDetails,
            status: 'failed',
            message: 'Venue creation failed',
            error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status'
          };
        }
      }

      if (isFailed) {
        return {
          ...createResponse,
          activityDetails,
          status: 'failed',
          message: 'Venue creation failed',
          error: activityDetails.error || activityDetails.message || 'Unknown error'
        };
      }

      // If still in progress, increment retry count and continue
      retryCount++;
      console.log(`[RUCKUS] Venue creation in progress, attempt ${retryCount}/${maxRetries}`);
      
      // If we've reached max retries, exit loop
      if (retryCount >= maxRetries) {
        break;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      
    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);
      
      // If we've reached max retries, return error
      if (retryCount >= maxRetries) {
        return {
          ...createResponse,
          status: 'timeout',
          message: 'Venue creation status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...createResponse,
    status: 'timeout',
    message: 'Venue creation status unknown - polling timeout',
    activityId
  };
}

export async function updateVenueWithRetry(
  token: string,
  venueId: string,
  venueData: {
    name: string;
    description?: string;
    addressLine: string;
    city: string;
    country: string;
    countryCode?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/venues/${venueId}`
    : `https://api.ruckus.cloud/venues/${venueId}`;

  const payload = {
    name: venueData.name,
    ...(venueData.description !== undefined && { description: venueData.description }),
    address: {
      addressLine: venueData.addressLine,
      city: venueData.city,
      country: venueData.country,
      ...(venueData.countryCode && { countryCode: venueData.countryCode }),
      ...(venueData.latitude !== undefined && { latitude: venueData.latitude }),
      ...(venueData.longitude !== undefined && { longitude: venueData.longitude }),
      ...(venueData.timezone && { timezone: venueData.timezone }),
    },
  };

  const response = await makeRuckusApiCall({
    method: 'put',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update venue');

  const updateResponse = response.data;
  
  const activityId = updateResponse.requestId;
  
  if (!activityId) {
    return {
      ...updateResponse,
      status: 'completed',
      message: 'Venue updated successfully (synchronous operation)'
    };
  }

  console.log(`Starting venue update status polling for activity ${activityId}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Polling attempt ${attempt}/${maxRetries} for venue update activity ${activityId}`);
    
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...updateResponse,
          status: 'completed',
          message: 'Venue updated successfully',
          activityDetails
        };
      } else if (activityDetails.status === 'FAILED') {
        return {
          ...updateResponse,
          status: 'failed',
          message: 'Venue update failed',
          error: activityDetails.error || 'Unknown error occurred',
          activityDetails
        };
      }
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'Venue update status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error: any) {
      console.error(`Error polling venue update activity (attempt ${attempt}):`, error.message);
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'Venue update status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...updateResponse,
    status: 'timeout',
    message: 'Venue update status unknown - polling timeout',
    activityId
  };
}

export async function createApGroupWithRetry(
  token: string,
  venueId: string,
  apGroupData: {
    name: string;
    description?: string;
    apSerialNumbers?: Array<{ serialNumber: string }>;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/venues/${venueId}/apGroups`
    : `https://api.ruckus.cloud/venues/${venueId}/apGroups`;

  const payload = {
    name: apGroupData.name,
    venueId: venueId,
    apSerialNumbers: apGroupData.apSerialNumbers || [],
    ...(apGroupData.description && { description: apGroupData.description }),
  };

  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Create AP group');

  const createResponse = response.data;
  
  // Check if this is an async operation (has requestId)
  const activityId = createResponse.requestId;
  
  if (!activityId) {
    // If no requestId, it's a synchronous operation, return immediately
    return {
      ...createResponse,
      status: 'completed',
      message: 'AP group created successfully (synchronous operation)'
    };
  }

  // Poll for completion status (async operation)
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      
      // Check if operation is completed (has endDatetime populated)
      const isCompleted = activityDetails.endDatetime !== undefined;
      
      // Check if operation failed (status is not SUCCESS or INPROGRESS)
      const isFailed = 
        activityDetails.status !== 'SUCCESS' && 
        activityDetails.status !== 'INPROGRESS';

      if (isCompleted) {
        // Check if it completed successfully
        if (activityDetails.status === 'SUCCESS') {
          return {
            ...createResponse,
            activityDetails,
            status: 'completed',
            message: 'AP group created successfully'
          };
        } else {
          return {
            ...createResponse,
            activityDetails,
            status: 'failed',
            message: 'AP group creation failed',
            error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status'
          };
        }
      }

      if (isFailed) {
        return {
          ...createResponse,
          activityDetails,
          status: 'failed',
          message: 'AP group creation failed',
          error: activityDetails.error || activityDetails.message || 'Unknown error'
        };
      }

      // If still in progress, increment retry count and continue
      retryCount++;
      console.log(`[RUCKUS] AP group creation in progress, attempt ${retryCount}/${maxRetries}`);
      
      // If we've reached max retries, exit loop
      if (retryCount >= maxRetries) {
        break;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      
    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);
      
      // If we've reached max retries, return error
      if (retryCount >= maxRetries) {
        return {
          ...createResponse,
          status: 'timeout',
          message: 'AP group creation status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...createResponse,
    status: 'timeout',
    message: 'AP group creation status unknown - polling timeout',
    activityId
  };
}

export async function addApToGroupWithRetry(
  token: string,
  venueId: string,
  apGroupId: string,
  apData: {
    name: string;
    serialNumber: string;
    description?: string;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}/aps`
    : `https://api.ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}/aps`;

  const payload = {
    name: apData.name,
    serialNumber: apData.serialNumber,
    ...(apData.description !== undefined && { description: apData.description || '' }),
  };

  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Add AP to group');

  const addResponse = response.data;
  
  // Check if this is an async operation (has requestId)
  const activityId = addResponse.requestId;
  
  if (!activityId) {
    // If no requestId, it's a synchronous operation, return immediately
    return {
      ...addResponse,
      status: 'completed',
      message: 'AP added to group successfully (synchronous operation)'
    };
  }

  // Poll for completion status (async operation)
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      
      // Check if operation is completed (has endDatetime populated)
      const isCompleted = activityDetails.endDatetime !== undefined;
      
      // Check if operation failed (status is not SUCCESS or INPROGRESS)
      const isFailed = 
        activityDetails.status !== 'SUCCESS' && 
        activityDetails.status !== 'INPROGRESS';

      if (isCompleted) {
        // Check if it completed successfully
        if (activityDetails.status === 'SUCCESS') {
          return {
            ...addResponse,
            activityDetails,
            status: 'completed',
            message: 'AP added to group successfully'
          };
        } else {
          return {
            ...addResponse,
            activityDetails,
            status: 'failed',
            message: 'AP addition to group failed',
            error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status'
          };
        }
      }

      if (isFailed) {
        return {
          ...addResponse,
          activityDetails,
          status: 'failed',
          message: 'AP addition to group failed',
          error: activityDetails.error || activityDetails.message || 'Unknown error'
        };
      }

      // If still in progress, increment retry count and continue
      retryCount++;
      console.log(`[RUCKUS] AP addition to group in progress, attempt ${retryCount}/${maxRetries}`);
      
      // If we've reached max retries, exit loop
      if (retryCount >= maxRetries) {
        break;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      
    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);
      
      // If we've reached max retries, return error
      if (retryCount >= maxRetries) {
        return {
          ...addResponse,
          status: 'timeout',
          message: 'AP addition to group status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...addResponse,
    status: 'timeout',
    message: 'AP addition to group status unknown - polling timeout',
    activityId
  };
}

export async function updateApGroupWithRetry(
  token: string,
  venueId: string,
  apGroupId: string,
  apGroupData: {
    name: string;
    description?: string;
    apSerialNumbers?: Array<{ serialNumber: string }>;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}`
    : `https://api.ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}`;

  const payload = {
    name: apGroupData.name,
    venueId: venueId,
    ...(apGroupData.description !== undefined && { description: apGroupData.description }),
    apSerialNumbers: apGroupData.apSerialNumbers || []
  };

  const response = await makeRuckusApiCall({
    method: 'put',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update AP group');

  const updateResponse = response.data;
  
  const activityId = updateResponse.requestId;
  
  if (!activityId) {
    return {
      ...updateResponse,
      status: 'completed',
      message: 'AP group updated successfully (synchronous operation)'
    };
  }

  console.log(`Starting AP group update status polling for activity ${activityId}`);
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`[RUCKUS] AP group update activity ${activityId} status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        console.log(`[RUCKUS] AP group updated successfully after ${retryCount + 1} attempts`);
        return {
          ...updateResponse,
          status: 'completed',
          message: 'AP group updated successfully',
          activityDetails
        };
      } else if (activityDetails.status === 'FAILED') {
        console.error(`[RUCKUS] AP group update failed:`, activityDetails);
        return {
          ...updateResponse,
          status: 'failed',
          message: 'AP group update failed',
          error: activityDetails.error || 'Unknown error occurred',
          activityDetails
        };
      }
      
      retryCount++;
      console.log(`[RUCKUS] AP group update in progress, attempt ${retryCount}/${maxRetries}`);
      
      if (retryCount >= maxRetries) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      
    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);
      
      if (retryCount >= maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'AP group update status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...updateResponse,
    status: 'timeout',
    message: 'AP group update status unknown - polling timeout',
    activityId
  };
}

export async function queryApGroups(
  token: string,
  region: string = '',
  filters: any = {},
  fields: string[] = ['id', 'name'],
  page: number = 1,
  pageSize: number = 10000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/venues/apGroups/query`
    : 'https://api.ruckus.cloud/venues/apGroups/query';

  const payload = {
    fields,
    filters,
    page,
    pageSize,
    defaultPageSize: 10,
    total: 0,
    sortField: 'name',
    sortOrder: 'ASC'
  };

  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Query AP groups');

  return response.data;
}

export async function queryAPs(
  token: string,
  region: string = '',
  filters: any = {},
  fields: string[] = [
    'name', 'status', 'model', 'networkStatus', 'macAddress', 
    'venueName', 'switchName', 'meshRole', 'clientCount', 
    'apWiredClientCount', 'apGroupId', 'apGroupName', 
    'lanPortStatuses', 'tags', 'serialNumber', 'radioStatuses', 
    'venueId', 'poePort', 'firmwareVersion', 'uptime', 
    'afcStatus', 'powerSavingStatus', 'supportSecureBoot', 'poeUnderPowered'
  ],
  searchString: string = '',
  searchTargetFields: string[] = ['name', 'model', 'networkStatus.ipAddress', 'macAddress', 'tags', 'serialNumber'],
  page: number = 1,
  pageSize: number = 10,
  mesh: boolean = false
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/venues/aps/query${mesh ? '?mesh=true' : ''}`
    : `https://api.ruckus.cloud/venues/aps/query${mesh ? '?mesh=true' : ''}`;

  const payload = {
    searchString,
    searchTargetFields,
    fields,
    filters,
    page,
    pageSize,
    defaultPageSize: 10,
    total: 0,
    sortField: 'name',
    sortOrder: 'ASC'
  };

  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Query APs');

  return response.data;
}

export async function deleteApGroupWithRetry(
  token: string,
  venueId: string,
  apGroupId: string,
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}`
    : `https://api.ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}`;

  const response = await makeRuckusApiCall({
    method: 'delete',
    url: apiUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Delete AP group');

  const deleteResponse = response.data;
  
  // Check if this is an async operation (has requestId)
  const activityId = deleteResponse.requestId;
  
  if (!activityId) {
    // If no requestId, it's a synchronous operation, return immediately
    return {
      ...deleteResponse,
      status: 'completed',
      message: 'AP group deleted successfully (synchronous operation)'
    };
  }

  // Poll for completion status (async operation)
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      
      // Check if operation is completed (has endDatetime populated)
      const isCompleted = activityDetails.endDatetime !== undefined;
      
      // Check if operation failed (status is not SUCCESS or INPROGRESS)
      const isFailed = 
        activityDetails.status !== 'SUCCESS' && 
        activityDetails.status !== 'INPROGRESS';

      if (isCompleted) {
        // Check if it completed successfully
        if (activityDetails.status === 'SUCCESS') {
          return {
            ...deleteResponse,
            activityDetails,
            status: 'completed',
            message: 'AP group deleted successfully'
          };
        } else {
          return {
            ...deleteResponse,
            activityDetails,
            status: 'failed',
            message: 'AP group deletion failed',
            error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status'
          };
        }
      }

      if (isFailed) {
        return {
          ...deleteResponse,
          activityDetails,
          status: 'failed',
          message: 'AP group deletion failed',
          error: activityDetails.error || activityDetails.message || 'Unknown error'
        };
      }

      // If still in progress, increment retry count and continue
      retryCount++;
      console.log(`[RUCKUS] AP group deletion in progress, attempt ${retryCount}/${maxRetries}`);
      
      // If we've reached max retries, exit loop
      if (retryCount >= maxRetries) {
        break;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      
    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);
      
      // If we've reached max retries, return error
      if (retryCount >= maxRetries) {
        return {
          ...deleteResponse,
          status: 'timeout',
          message: 'AP group deletion status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...deleteResponse,
    status: 'timeout',
    message: 'AP group deletion status unknown - polling timeout',
    activityId
  };
}

export async function removeApWithRetry(
  token: string,
  venueId: string,
  apSerialNumber: string,
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/venues/${venueId}/aps/${apSerialNumber}`
    : `https://api.ruckus.cloud/venues/${venueId}/aps/${apSerialNumber}`;

  const response = await makeRuckusApiCall({
    method: 'delete',
    url: apiUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Remove AP');

  const deleteResponse = response.data;

  // Check if this is an async operation (has requestId)
  const activityId = deleteResponse.requestId;

  if (!activityId) {
    // If no requestId, it's a synchronous operation, return immediately
    return {
      ...deleteResponse,
      status: 'completed',
      message: 'AP removed successfully (synchronous operation)'
    };
  }

  // Poll for completion status (async operation)
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);

      // Check if operation is completed (has endDatetime populated)
      const isCompleted = activityDetails.endDatetime !== undefined;

      // Check if operation failed (status is not SUCCESS or INPROGRESS)
      const isFailed =
        activityDetails.status !== 'SUCCESS' &&
        activityDetails.status !== 'INPROGRESS';

      if (isCompleted) {
        // Check if it completed successfully
        if (activityDetails.status === 'SUCCESS') {
          return {
            ...deleteResponse,
            activityDetails,
            status: 'completed',
            message: 'AP removed successfully'
          };
        } else {
          return {
            ...deleteResponse,
            activityDetails,
            status: 'failed',
            message: 'AP removal failed',
            error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status'
          };
        }
      }

      if (isFailed) {
        return {
          ...deleteResponse,
          activityDetails,
          status: 'failed',
          message: 'AP removal failed',
          error: activityDetails.error || activityDetails.message || 'Unknown error'
        };
      }

      // If still in progress, increment retry count and continue
      retryCount++;
      console.log(`[RUCKUS] AP removal in progress, attempt ${retryCount}/${maxRetries}`);

      // If we've reached max retries, exit loop
      if (retryCount >= maxRetries) {
        break;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));

    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);

      // If we've reached max retries, return error
      if (retryCount >= maxRetries) {
        return {
          ...deleteResponse,
          status: 'timeout',
          message: 'AP removal status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }

      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...deleteResponse,
    status: 'timeout',
    message: 'AP removal status unknown - polling timeout',
    activityId
  };
}

export async function getApDetailsBySerial(
  token: string,
  serialNumber: string,
  region: string = ''
): Promise<any> {
  const response = await queryAPs(
    token,
    region,
    {},
    [
      'name', 'status', 'model', 'networkStatus', 'macAddress', 
      'venueName', 'switchName', 'meshRole', 'clientCount', 
      'apWiredClientCount', 'apGroupId', 'apGroupName', 
      'lanPortStatuses', 'tags', 'serialNumber', 'radioStatuses', 
      'venueId', 'poePort', 'firmwareVersion', 'uptime', 
      'afcStatus', 'powerSavingStatus', 'supportSecureBoot', 'poeUnderPowered'
    ],
    serialNumber,
    ['serialNumber'],
    1,
    10
  );
  
  if (response.totalCount === 0) {
    throw new Error(`AP with serial number ${serialNumber} not found`);
  }
  
  return response.data[0];
}

export async function updateApWithRetrieval(
  token: string,
  serialNumber: string,
  changes?: {
    name?: string;
    venueId?: string;
    apGroupId?: string;
    description?: string;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  // Step 1: Get current AP state
  const currentAp = await getApDetailsBySerial(token, serialNumber, region);

  // Step 2: Determine target venue (either new venue or current venue)
  const targetVenueId = changes?.venueId ?? currentAp.venueId;
  const targetApGroupId = changes?.apGroupId ?? currentAp.apGroupId;
  const targetName = changes?.name ?? currentAp.name;

  // Step 3: Detect if this is a move operation or just a property update
  const isMovingVenue = changes?.venueId && changes.venueId !== currentAp.venueId;
  const isMovingGroup = changes?.apGroupId && changes.apGroupId !== currentAp.apGroupId;
  const isMoving = isMovingVenue || isMovingGroup;

  // Step 4: Choose appropriate method
  // - Use 'direct' for venue/group moves (group assignment endpoint)
  // - Use 'update' for property changes only (name/description)
  const method = isMoving ? 'direct' : 'update';

  return await moveApWithRetry(
    token,
    targetVenueId,
    serialNumber,
    targetApGroupId,
    targetName,
    changes?.description,
    method,
    region,
    maxRetries,
    pollIntervalMs
  );
}

export async function moveApWithRetry(
  token: string,
  venueId: string,
  apSerialNumber: string,
  apGroupId: string,
  apName?: string,
  description?: string,
  method: 'direct' | 'update' = 'update',
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  let apiUrl: string;
  let payload: any = {};
  
  if (method === 'direct') {
    // Method 1: Direct group assignment
    apiUrl = region && region.trim() !== ''
      ? `https://api.${region}.ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}/aps/${apSerialNumber}`
      : `https://api.ruckus.cloud/venues/${venueId}/apGroups/${apGroupId}/aps/${apSerialNumber}`;
    // Empty payload for direct method
  } else {
    // Method 2: AP update with group assignment - get current AP details first
    const currentAp = await getApDetailsBySerial(token, apSerialNumber, region);
    
    apiUrl = region && region.trim() !== ''
      ? `https://api.${region}.ruckus.cloud/venues/${venueId}/aps/${apSerialNumber}`
      : `https://api.ruckus.cloud/venues/${venueId}/aps/${apSerialNumber}`;
    
    // Use complete payload with all current properties preserved
    payload = {
      apGroupId: apGroupId,
      name: apName || currentAp.name,
      serialNumber: apSerialNumber,
      // Preserve other important properties
      ...(currentAp.description && { description: currentAp.description }),
      ...(description && { description }) // Override with new description if provided
    };
  }

  const response = await makeRuckusApiCall({
    method: 'put',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Move AP');

  const moveResponse = response.data;
  
  // Check if this is an async operation (has requestId)
  const activityId = moveResponse.requestId;
  
  if (!activityId) {
    // If no requestId, it's a synchronous operation, return immediately
    return {
      ...moveResponse,
      status: 'completed',
      message: 'AP moved successfully (synchronous operation)'
    };
  }

  // Poll for completion status (async operation)
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      
      // Check if operation is completed (has endDatetime populated)
      const isCompleted = activityDetails.endDatetime !== undefined;
      
      // Check if operation failed (status is not SUCCESS or INPROGRESS)
      const isFailed = 
        activityDetails.status !== 'SUCCESS' && 
        activityDetails.status !== 'INPROGRESS';

      if (isCompleted) {
        // Check if it completed successfully
        if (activityDetails.status === 'SUCCESS') {
          return {
            ...moveResponse,
            activityDetails,
            status: 'completed',
            message: 'AP moved successfully'
          };
        } else {
          return {
            ...moveResponse,
            activityDetails,
            status: 'failed',
            message: 'AP move failed',
            error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status'
          };
        }
      }

      if (isFailed) {
        return {
          ...moveResponse,
          activityDetails,
          status: 'failed',
          message: 'AP move failed',
          error: activityDetails.error || activityDetails.message || 'Unknown error'
        };
      }

      // If still in progress, increment retry count and continue
      retryCount++;
      console.log(`[RUCKUS] AP move in progress, attempt ${retryCount}/${maxRetries}`);
      
      // If we've reached max retries, exit loop
      if (retryCount >= maxRetries) {
        break;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      
    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);
      
      // If we've reached max retries, return error
      if (retryCount >= maxRetries) {
        return {
          ...moveResponse,
          status: 'timeout',
          message: 'AP move status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...moveResponse,
    status: 'timeout',
    message: 'AP move status unknown - polling timeout',
    activityId
  };
}

export async function queryDirectoryServerProfiles(
  token: string,
  region: string = '',
  filters: any = {},
  fields: string[] = ['id', 'name', 'domainName', 'host', 'port', 'type', 'wifiNetworkIds'],
  searchString: string = '',
  searchTargetFields: string[] = ['name'],
  page: number = 1,
  pageSize: number = 10,
  sortField: string = 'name',
  sortOrder: string = 'ASC'
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/directoryServerProfiles/query`
    : 'https://api.ruckus.cloud/directoryServerProfiles/query';

  const payload = {
    fields,
    searchString,
    filters,
    page,
    pageSize,
    defaultPageSize: 10,
    total: 0,
    sortField,
    sortOrder,
    searchTargetFields
  };

  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Query directory server profiles');

  return response.data;
}

export async function getDirectoryServerProfile(
  token: string,
  profileId: string,
  region: string = ''
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/directoryServerProfiles/${profileId}`
    : `https://api.ruckus.cloud/directoryServerProfiles/${profileId}`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url: apiUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get directory server profile');

  return response.data;
}

export async function createDirectoryServerProfileWithRetry(
  token: string,
  profileData: {
    name: string;
    type: string;
    tlsEnabled: boolean;
    host: string;
    port: number;
    domainName: string;
    adminDomainName: string;
    adminPassword: string;
    identityName: string;
    identityEmail: string;
    identityPhone: string;
    keyAttribute: string;
    searchFilter?: string;
    attributeMappings: Array<{
      name: string;
      mappedByName: string;
    }>;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/directoryServerProfiles`
    : 'https://api.ruckus.cloud/directoryServerProfiles';

  const payload = {
    name: profileData.name,
    type: profileData.type,
    tlsEnabled: profileData.tlsEnabled,
    host: profileData.host,
    port: profileData.port,
    domainName: profileData.domainName,
    adminDomainName: profileData.adminDomainName,
    adminPassword: profileData.adminPassword,
    identityName: profileData.identityName,
    identityEmail: profileData.identityEmail,
    identityPhone: profileData.identityPhone,
    keyAttribute: profileData.keyAttribute,
    searchFilter: profileData.searchFilter || '',
    attributeMappings: profileData.attributeMappings
  };

  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Create directory server profile');

  const createResponse = response.data;
  
  const activityId = createResponse.requestId;
  
  if (!activityId) {
    return {
      ...createResponse,
      status: 'completed',
      message: 'Directory server profile created successfully (synchronous operation)'
    };
  }

  console.log(`Starting directory server profile creation status polling for activity ${activityId}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Polling attempt ${attempt}/${maxRetries} for directory server profile creation activity ${activityId}`);
    
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...createResponse,
          status: 'completed',
          message: 'Directory server profile created successfully',
          activityDetails
        };
      } else if (activityDetails.status === 'FAILED') {
        return {
          ...createResponse,
          status: 'failed',
          message: 'Directory server profile creation failed',
          error: activityDetails.error || 'Unknown error occurred',
          activityDetails
        };
      }
      
      if (attempt === maxRetries) {
        return {
          ...createResponse,
          status: 'timeout',
          message: 'Directory server profile creation status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error: any) {
      console.error(`Error polling directory server profile creation activity (attempt ${attempt}):`, error.message);
      
      if (attempt === maxRetries) {
        return {
          ...createResponse,
          status: 'timeout',
          message: 'Directory server profile creation status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...createResponse,
    status: 'timeout',
    message: 'Directory server profile creation status unknown - polling timeout',
    activityId
  };
}

export async function updateDirectoryServerProfileWithRetry(
  token: string,
  profileId: string,
  profileData: {
    name: string;
    type: string;
    tlsEnabled: boolean;
    host: string;
    port: number;
    domainName: string;
    adminDomainName: string;
    adminPassword: string;
    identityName: string;
    identityEmail: string;
    identityPhone: string;
    keyAttribute: string;
    searchFilter?: string;
    attributeMappings: Array<{
      name: string;
      mappedByName: string;
    }>;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/directoryServerProfiles/${profileId}`
    : `https://api.ruckus.cloud/directoryServerProfiles/${profileId}`;

  const payload = {
    name: profileData.name,
    type: profileData.type,
    tlsEnabled: profileData.tlsEnabled,
    host: profileData.host,
    port: profileData.port,
    domainName: profileData.domainName,
    adminDomainName: profileData.adminDomainName,
    adminPassword: profileData.adminPassword,
    identityName: profileData.identityName,
    identityEmail: profileData.identityEmail,
    identityPhone: profileData.identityPhone,
    id: profileId,
    keyAttribute: profileData.keyAttribute,
    searchFilter: profileData.searchFilter || '',
    attributeMappings: profileData.attributeMappings
  };

  const response = await makeRuckusApiCall({
    method: 'put',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update directory server profile');

  const updateResponse = response.data;
  
  const activityId = updateResponse.requestId;
  
  if (!activityId) {
    return {
      ...updateResponse,
      status: 'completed',
      message: 'Directory server profile updated successfully (synchronous operation)'
    };
  }

  console.log(`Starting directory server profile update status polling for activity ${activityId}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Polling attempt ${attempt}/${maxRetries} for directory server profile update activity ${activityId}`);
    
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...updateResponse,
          status: 'completed',
          message: 'Directory server profile updated successfully',
          activityDetails
        };
      } else if (activityDetails.status === 'FAILED') {
        return {
          ...updateResponse,
          status: 'failed',
          message: 'Directory server profile update failed',
          error: activityDetails.error || 'Unknown error occurred',
          activityDetails
        };
      }
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'Directory server profile update status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error: any) {
      console.error(`Error polling directory server profile update activity (attempt ${attempt}):`, error.message);
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'Directory server profile update status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...updateResponse,
    status: 'timeout',
    message: 'Directory server profile update status unknown - polling timeout',
    activityId
  };
}

export async function deleteDirectoryServerProfileWithRetry(
  token: string,
  profileId: string,
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/directoryServerProfiles/${profileId}`
    : `https://api.ruckus.cloud/directoryServerProfiles/${profileId}`;

  const response = await makeRuckusApiCall({
    method: 'delete',
    url: apiUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Delete directory server profile');

  const deleteResponse = response.data;
  
  const activityId = deleteResponse.requestId;
  
  if (!activityId) {
    return {
      ...deleteResponse,
      status: 'completed',
      message: 'Directory server profile deleted successfully (synchronous operation)'
    };
  }

  console.log(`Starting directory server profile deletion status polling for activity ${activityId}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Polling attempt ${attempt}/${maxRetries} for directory server profile deletion activity ${activityId}`);
    
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...deleteResponse,
          status: 'completed',
          message: 'Directory server profile deleted successfully',
          activityDetails
        };
      } else if (activityDetails.status === 'FAILED') {
        return {
          ...deleteResponse,
          status: 'failed',
          message: 'Directory server profile deletion failed',
          error: activityDetails.error || 'Unknown error occurred',
          activityDetails
        };
      }
      
      if (attempt === maxRetries) {
        return {
          ...deleteResponse,
          status: 'timeout',
          message: 'Directory server profile deletion status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error: any) {
      console.error(`Error polling directory server profile deletion activity (attempt ${attempt}):`, error.message);
      
      if (attempt === maxRetries) {
        return {
          ...deleteResponse,
          status: 'timeout',
          message: 'Directory server profile deletion status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...deleteResponse,
    status: 'timeout',
    message: 'Directory server profile deletion status unknown - polling timeout',
    activityId
  };
}

export async function queryPortalServiceProfiles(
  token: string,
  region: string = '',
  filters: any = {},
  searchString: string = '',
  searchTargetFields: string[] = ['name'],
  page: number = 1,
  pageSize: number = 10,
  sortField: string = 'name',
  sortOrder: string = 'ASC'
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/portalServiceProfiles/query`
    : 'https://api.ruckus.cloud/portalServiceProfiles/query';

  const payload = {
    filters,
    page,
    pageSize,
    sortField,
    sortOrder,
    searchTargetFields,
    searchString
  };

  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Query portal service profiles');

  return response.data;
}

export async function getPortalServiceProfile(
  token: string,
  profileId: string,
  region: string = ''
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/portalServiceProfiles/${profileId}`
    : `https://api.ruckus.cloud/portalServiceProfiles/${profileId}`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url: apiUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get portal service profile');

  return response.data;
}

export async function createPortalServiceProfileWithRetry(
  token: string,
  profileData: {
    name: string;
    content: any;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/portalServiceProfiles`
    : 'https://api.ruckus.cloud/portalServiceProfiles';

  const payload = {
    serviceName: profileData.name,
    content: profileData.content
  };

  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Create portal service profile');

  const createResponse = response.data;
  
  const activityId = createResponse.requestId;
  
  if (!activityId) {
    return {
      ...createResponse,
      status: 'completed',
      message: 'Portal service profile created successfully (synchronous operation)'
    };
  }

  console.log(`Starting portal service profile creation status polling for activity ${activityId}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Polling attempt ${attempt}/${maxRetries} for portal service profile creation activity ${activityId}`);
    
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...createResponse,
          status: 'completed',
          message: 'Portal service profile created successfully',
          activityDetails
        };
      } else if (activityDetails.status === 'FAILED') {
        return {
          ...createResponse,
          status: 'failed',
          message: 'Portal service profile creation failed',
          error: activityDetails.error || 'Unknown error occurred',
          activityDetails
        };
      }
      
      if (attempt === maxRetries) {
        return {
          ...createResponse,
          status: 'timeout',
          message: 'Portal service profile creation status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error: any) {
      console.error(`Error polling portal service profile creation activity (attempt ${attempt}):`, error.message);
      
      if (attempt === maxRetries) {
        return {
          ...createResponse,
          status: 'timeout',
          message: 'Portal service profile creation status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...createResponse,
    status: 'timeout',
    message: 'Portal service profile creation status unknown - polling timeout',
    activityId
  };
}

export async function updatePortalServiceProfileWithRetry(
  token: string,
  profileId: string,
  profileData: {
    name: string;
    content: any;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/portalServiceProfiles/${profileId}`
    : `https://api.ruckus.cloud/portalServiceProfiles/${profileId}`;

  const payload = {
    serviceName: profileData.name,
    content: profileData.content
  };

  const response = await makeRuckusApiCall({
    method: 'put',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update portal service profile');

  const updateResponse = response.data;
  
  const activityId = updateResponse.requestId;
  
  if (!activityId) {
    return {
      ...updateResponse,
      status: 'completed',
      message: 'Portal service profile updated successfully (synchronous operation)'
    };
  }

  console.log(`Starting portal service profile update status polling for activity ${activityId}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Polling attempt ${attempt}/${maxRetries} for portal service profile update activity ${activityId}`);
    
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...updateResponse,
          status: 'completed',
          message: 'Portal service profile updated successfully',
          activityDetails
        };
      } else if (activityDetails.status === 'FAILED') {
        return {
          ...updateResponse,
          status: 'failed',
          message: 'Portal service profile update failed',
          error: activityDetails.error || 'Unknown error occurred',
          activityDetails
        };
      }
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'Portal service profile update status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error: any) {
      console.error(`Error polling portal service profile update activity (attempt ${attempt}):`, error.message);
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'Portal service profile update status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...updateResponse,
    status: 'timeout',
    message: 'Portal service profile update status unknown - polling timeout',
    activityId
  };
}

export async function deletePortalServiceProfileWithRetry(
  token: string,
  profileId: string,
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/portalServiceProfiles/${profileId}`
    : `https://api.ruckus.cloud/portalServiceProfiles/${profileId}`;

  const response = await makeRuckusApiCall({
    method: 'delete',
    url: apiUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Delete portal service profile');

  const deleteResponse = response.data;
  
  const activityId = deleteResponse.requestId;
  
  if (!activityId) {
    return {
      ...deleteResponse,
      status: 'completed',
      message: 'Portal service profile deleted successfully (synchronous operation)'
    };
  }

  console.log(`Starting portal service profile deletion status polling for activity ${activityId}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Polling attempt ${attempt}/${maxRetries} for portal service profile deletion activity ${activityId}`);
    
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...deleteResponse,
          status: 'completed',
          message: 'Portal service profile deleted successfully',
          activityDetails
        };
      } else if (activityDetails.status === 'FAILED') {
        return {
          ...deleteResponse,
          status: 'failed',
          message: 'Portal service profile deletion failed',
          error: activityDetails.error || 'Unknown error occurred',
          activityDetails
        };
      }
      
      if (attempt === maxRetries) {
        return {
          ...deleteResponse,
          status: 'timeout',
          message: 'Portal service profile deletion status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error: any) {
      console.error(`Error polling portal service profile deletion activity (attempt ${attempt}):`, error.message);
      
      if (attempt === maxRetries) {
        return {
          ...deleteResponse,
          status: 'timeout',
          message: 'Portal service profile deletion status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...deleteResponse,
    status: 'timeout',
    message: 'Portal service profile deletion status unknown - polling timeout',
    activityId
  };
}

export async function queryPrivilegeGroups(
  token: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/roleAuthentications/privilegeGroups`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Query privilege groups');

  return response.data;
}

// Helper function to resolve privilege group name to ID
async function resolvePrivilegeGroupId(token: string, nameOrId: string, region: string = ''): Promise<string> {
  // If it looks like a UUID, assume it's already an ID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nameOrId)) {
    return nameOrId;
  }
  
  // Otherwise, resolve name to ID
  const groups = await queryPrivilegeGroups(token, region);
  const group = groups.find((g: any) => g.name === nameOrId);
  
  if (!group) {
    throw new Error(`Privilege group '${nameOrId}' not found. Available groups: ${groups.map((g: any) => g.name).join(', ')}`);
  }
  
  return group.id;
}

// Helper function to get venues
async function getRuckusVenues(token: string, region: string = ''): Promise<any[]> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/venues/query`
    : 'https://api.ruckus.cloud/venues/query';
    
  const payload = {
    fields: ["id", "name"],
    searchTargetFields: ["name", "addressLine", "description", "tagList"],
    filters: {},
    sortField: "name",
    sortOrder: "ASC",
    page: 1,
    pageSize: 10000,
    defaultPageSize: 10,
    total: 0
  };
  
  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get venues');
  
  return response.data.data || [];
}

// Helper function to resolve venue names to IDs
async function resolveVenueIds(token: string, venueNames: string[], region: string = ''): Promise<string[]> {
  const venues = await getRuckusVenues(token, region);
  const venueIds: string[] = [];
  
  for (const nameOrId of venueNames) {
    // If it looks like a UUID, assume it's already an ID
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nameOrId)) {
      venueIds.push(nameOrId);
      continue;
    }
    
    // Otherwise, resolve name to ID
    const venue = venues.find((v: any) => v.name === nameOrId);
    if (!venue) {
      throw new Error(`Venue '${nameOrId}' not found. Available venues: ${venues.map((v: any) => v.name).join(', ')}`);
    }
    venueIds.push(venue.id);
  }
  
  return venueIds;
}

export async function updatePrivilegeGroupWithRetry(
  token: string,
  privilegeGroupId: string,
  privilegeGroupData: {
    name: string;
    roleName: string;
    delegation: boolean;
    policies?: Array<{
      entityInstanceId: string;
      objectType: string;
    }>;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/roleAuthentications/privilegeGroups/${privilegeGroupId}`;

  const response = await makeRuckusApiCall({
    method: 'put',
    url,
    data: privilegeGroupData,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update privilege group');

  const operationResponse = response.data;
  
  const activityId = operationResponse.requestId;
  
  if (!activityId) {
    return {
      ...operationResponse,
      status: 'completed',
      message: 'Operation completed successfully (synchronous operation)'
    };
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    console.log(`[${attempt + 1}/${maxRetries}] Polling activity status for requestId: ${activityId}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...operationResponse,
          ...activityDetails,
          status: 'completed',
          message: 'Privilege group updated successfully'
        };
      }
      
      if (activityDetails.status === 'FAILED') {
        throw new Error(`Update privilege group failed: ${activityDetails.errorMessage || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error);
      
      if (attempt === maxRetries - 1) {
        return {
          ...operationResponse,
          status: 'timeout',
          message: `Update privilege group status polling timed out after ${maxRetries} attempts. The operation may still be in progress.`,
          activityId
        };
      }
    }
  }

  return {
    ...operationResponse,
    status: 'timeout',
    message: `Update privilege group status polling timed out after ${maxRetries} attempts. The operation may still be in progress.`,
    activityId
  };
}

export async function updatePrivilegeGroupSimple(
  token: string,
  privilegeGroupName: string,
  name: string,
  roleName: string,
  delegation: boolean,
  allVenues: boolean = true,
  venueNames: string[] = [],
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  // Resolve group name to ID
  const privilegeGroupId = await resolvePrivilegeGroupId(token, privilegeGroupName, region);
  
  // Build the privilege group data
  const privilegeGroupData: any = {
    name,
    roleName,
    delegation
  };
  
  // If not all venues, build policies from venue names
  if (!allVenues && venueNames.length > 0) {
    const venueIds = await resolveVenueIds(token, venueNames, region);
    privilegeGroupData.policies = venueIds.map(venueId => ({
      entityInstanceId: venueId,
      objectType: 'com.ruckus.cloud.venue.model.venue'
    }));
  }
  
  // Call the existing function
  return await updatePrivilegeGroupWithRetry(
    token,
    privilegeGroupId,
    privilegeGroupData,
    region,
    maxRetries,
    pollIntervalMs
  );
}

export async function queryCustomRoles(
  token: string,
  region: string = ''
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/roleAuthentications/customRoles`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Query custom roles');

  return response.data;
}

export async function updateCustomRoleWithRetry(
  token: string,
  roleId: string,
  roleData: {
    name: string;
    features: string[];
    preDefinedRole?: string;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/roleAuthentications/customRoles/${roleId}`;

  const response = await makeRuckusApiCall({
    method: 'put',
    url,
    data: roleData,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update custom role');

  const operationResponse = response.data;
  
  const activityId = operationResponse.requestId;
  
  if (!activityId) {
    return {
      ...operationResponse,
      status: 'completed',
      message: 'Operation completed successfully (synchronous operation)'
    };
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    console.log(`[${attempt + 1}/${maxRetries}] Polling activity status for requestId: ${activityId}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
      
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...operationResponse,
          ...activityDetails,
          status: 'completed',
          message: 'Custom role updated successfully'
        };
      }
      
      if (activityDetails.status === 'FAILED') {
        throw new Error(`Update custom role failed: ${activityDetails.errorMessage || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error);
      
      if (attempt === maxRetries - 1) {
        return {
          ...operationResponse,
          status: 'timeout',
          message: `Update custom role status polling timed out after ${maxRetries} attempts. The operation may still be in progress.`,
          activityId
        };
      }
    }
  }

  return {
    ...operationResponse,
    status: 'timeout',
    message: `Update custom role status polling timed out after ${maxRetries} attempts. The operation may still be in progress.`,
    activityId
  };
}

export async function queryRoleFeatures(
  token: string,
  region: string = '',
  showScopes: boolean = false,
  category: string = '',
  searchString: string = '',
  page: number = 1,
  pageSize: number = 100
): Promise<any> {
  const url = `https://api.${region ? region + '.' : ''}ruckus.cloud/roleAuthentications/features?showScopes=${showScopes}`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Query role features');

  let features = response.data;

  // Flatten nested features for easier searching
  const flattenFeatures = (items: any[], result: any[] = []): any[] => {
    for (const item of items) {
      result.push({
        name: item.name,
        description: item.description,
        category: item.category
      });
      if (item.subFeatures) {
        flattenFeatures(item.subFeatures, result);
      }
    }
    return result;
  };

  features = flattenFeatures(features);

  // Apply category filtering
  if (category && category.trim() !== '') {
    features = features.filter((feature: any) => 
      feature.category && feature.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Apply search filtering
  if (searchString && searchString.trim() !== '') {
    const search = searchString.toLowerCase();
    features = features.filter((feature: any) => 
      (feature.name && feature.name.toLowerCase().includes(search)) ||
      (feature.description && feature.description.toLowerCase().includes(search))
    );
  }

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedFeatures = features.slice(startIndex, endIndex);

  return {
    data: paginatedFeatures,
    pagination: {
      page,
      pageSize,
      total: features.length,
      totalPages: Math.ceil(features.length / pageSize)
    }
  };
}

export async function createCustomRole(
  token: string,
  name: string,
  features: string[],
  region: string = '',
  preDefinedRole: string = 'READ_ONLY'
): Promise<any> {
  const originalFeatures = [...features];
  const enhancedFeatures = [...features];
  const addedPermissions: string[] = [];
  
  // Map of permission prefixes to their required parent read permission
  const parentMap: Record<string, string> = {
    'wifi.': 'wifi-r',
    'switch.': 'switch-r', 
    'edge.': 'edge-r',
    'ai.': 'ai-r',
    'admin.': 'admin-r'
  };
  
  // Check each feature for advanced permissions and add parent if missing
  for (const feature of features) {
    // Check for advanced permissions (e.g., wifi.venue-c)
    for (const [prefix, parent] of Object.entries(parentMap)) {
      if (feature.startsWith(prefix) && !enhancedFeatures.includes(parent)) {
        enhancedFeatures.push(parent);
        addedPermissions.push(parent);
        console.log(`[MCP] Auto-adding ${parent} as parent permission for ${feature}`);
      }
    }
    
    // Check for category-wide permissions (e.g., wifi-c, wifi-u, wifi-d)
    const categoryMatch = feature.match(/^(wifi|switch|edge|ai|admin)-[cud]$/);
    if (categoryMatch) {
      const readPerm = `${categoryMatch[1]}-r`;
      if (!enhancedFeatures.includes(readPerm)) {
        enhancedFeatures.push(readPerm);
        addedPermissions.push(readPerm);
        console.log(`[MCP] Auto-adding ${readPerm} as base permission for ${feature}`);
      }
    }
  }
  
  const finalRoleData = {
    name,
    features: [...new Set(enhancedFeatures)], // Remove duplicates
    preDefinedRole
  };
  
  const url = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/roleAuthentications/customRoles`
    : 'https://api.ruckus.cloud/roleAuthentications/customRoles';

  const response = await makeRuckusApiCall({
    method: 'post',
    url,
    data: finalRoleData,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Create custom role');

  // Enhance response with metadata about auto-added permissions
  return {
    ...response.data,
    _mcp_metadata: {
      originalFeatures,
      autoAddedPermissions: addedPermissions,
      finalFeatures: finalRoleData.features,
      message: addedPermissions.length > 0 
        ? `Auto-added parent permissions: ${addedPermissions.join(', ')}` 
        : 'No additional permissions needed'
    }
  };
}

export async function deleteCustomRoleWithRetry(
  token: string,
  roleId: string,
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const url = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/roleAuthentications/customRoles/${roleId}`
    : `https://api.ruckus.cloud/roleAuthentications/customRoles/${roleId}`;

  const response = await makeRuckusApiCall({
    method: 'delete',
    url,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Delete custom role');

  const deleteResponse = response.data;
  
  const activityId = deleteResponse.requestId;
  
  if (!activityId) {
    return {
      ...deleteResponse,
      status: 'completed',
      message: 'Custom role deleted successfully (synchronous operation)'
    };
  }

  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      
      const isCompleted = activityDetails.endDatetime !== undefined;
      
      const isFailed = 
        activityDetails.status !== 'SUCCESS' && 
        activityDetails.status !== 'INPROGRESS';

      if (isCompleted) {
        if (activityDetails.status === 'SUCCESS') {
          return {
            ...deleteResponse,
            activityDetails,
            status: 'completed',
            message: 'Custom role deleted successfully'
          };
        } else {
          return {
            ...deleteResponse,
            activityDetails,
            status: 'failed',
            message: 'Custom role deletion failed',
            error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status'
          };
        }
      }

      if (isFailed) {
        return {
          ...deleteResponse,
          activityDetails,
          status: 'failed',
          message: 'Custom role deletion failed',
          error: activityDetails.error || activityDetails.message || 'Operation failed with non-SUCCESS status'
        };
      }

      console.log(`[${retryCount + 1}/${maxRetries}] Activity in progress, polling again after ${pollIntervalMs}ms...`);
    } catch (pollError) {
      console.error(`Polling error: ${pollError}`);
    }

    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    retryCount++;
  }

  return {
    ...deleteResponse,
    status: 'timeout',
    message: `Custom role deletion status polling timed out after ${maxRetries} attempts. The operation may still be in progress.`,
    activityId
  };
}

// ============================================================================
// WiFi Network Management Functions
// ============================================================================

export async function createWifiNetworkWithRetry(
  token: string,
  networkConfig: {
    name: string;
    ssid: string;
    type: 'psk' | 'enterprise' | 'open' | 'guest';
    passphrase?: string;
    wlanSecurity: 'WPA2Personal' | 'WPA3Personal' | 'WPA2Enterprise' | 'WPA3Enterprise' | 'Open' | 'None';
    vlanId?: number;
    managementFrameProtection?: 'Disabled' | 'Capable' | 'Required';
    // Advanced customization options (subset of available options)
    maxClientsOnWlanPerRadio?: number;
    enableBandBalancing?: boolean;
    clientIsolation?: boolean;
    hideSsid?: boolean;
    enableFastRoaming?: boolean;
    mobilityDomainId?: number;
    wifi6Enabled?: boolean;
    wifi7Enabled?: boolean;
    // Guest pass specific options
    guestPortal?: any;
    portalServiceProfileId?: string;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/wifiNetworks`
    : 'https://api.ruckus.cloud/wifiNetworks';

  // Build WLAN configuration payload
  const isGuestType = networkConfig.type === 'guest';
  
  const basePayload: any = {
    name: networkConfig.name,
    type: networkConfig.type,
    isCloudpathEnabled: false,
    venues: [],  // Empty - network created without venue activation
    enableAccountingService: false,
    hotspot20Settings: {}
  };

  // Build WLAN configuration
  const wlanConfig: any = {
    ssid: networkConfig.ssid,
    wlanSecurity: networkConfig.wlanSecurity,
    enable: true,
    vlanId: networkConfig.vlanId || 1
  };

  // Add passphrase for PSK networks
  if (networkConfig.passphrase && !isGuestType) {
    wlanConfig.passphrase = networkConfig.passphrase;
  }

  // Guest pass specific WLAN settings
  if (isGuestType) {
    wlanConfig.bypassCPUsingMacAddressAuthentication = true;
    wlanConfig.bypassCNA = false;
    wlanConfig.macAddressAuthentication = false;
  } else {
    wlanConfig.managementFrameProtection = networkConfig.managementFrameProtection || 'Disabled';
  }

  // Advanced customization (common for all types)
  wlanConfig.advancedCustomization = {
    userUplinkRateLimiting: 0,
    userDownlinkRateLimiting: 0,
    maxClientsOnWlanPerRadio: networkConfig.maxClientsOnWlanPerRadio || 100,
    enableBandBalancing: networkConfig.enableBandBalancing !== undefined ? networkConfig.enableBandBalancing : true,
    clientIsolation: networkConfig.clientIsolation !== undefined ? networkConfig.clientIsolation : (isGuestType ? true : false),
    clientIsolationOptions: {
      autoVrrp: false
    },
    hideSsid: networkConfig.hideSsid || false,
    forceMobileDeviceDhcp: false,
    clientLoadBalancingEnable: true,
    enableAaaVlanOverride: true,
    directedThreshold: 5,
    enableNeighborReport: true,
    enableFastRoaming: networkConfig.enableFastRoaming || false,
    mobilityDomainId: networkConfig.mobilityDomainId || 1,
    radioCustomization: {
      rfBandUsage: 'BOTH',
      phyTypeConstraint: 'NONE'
    },
    enableSyslog: false,
    clientInactivityTimeout: 120,
    accessControlEnable: false,
    respectiveAccessControl: true,
    applicationPolicyEnable: false,
    l2AclEnable: false,
    l3AclEnable: false,
    wifiCallingEnabled: false,
    proxyARP: false,
    enableAirtimeDecongestion: false,
    enableJoinRSSIThreshold: false,
    joinRSSIThreshold: -85,
    enableTransientClientManagement: false,
    joinWaitTime: 30,
    joinExpireTime: 300,
    joinWaitThreshold: 10,
    enableOptimizedConnectivityExperience: false,
    broadcastProbeResponseDelay: 15,
    rssiAssociationRejectionThreshold: -75,
    enableAntiSpoofing: false,
    enableArpRequestRateLimit: true,
    arpRequestRateLimit: 15,
    enableDhcpRequestRateLimit: true,
    dhcpRequestRateLimit: 15,
    dnsProxyEnabled: false,
    dnsProxy: {
      dnsProxyRules: []
    },
    bssPriority: 'HIGH',
    dhcpOption82Enabled: false,
    dhcpOption82SubOption1Enabled: false,
    dhcpOption82SubOption1Format: null,
    dhcpOption82SubOption2Enabled: false,
    dhcpOption82SubOption2Format: null,
    dhcpOption82SubOption150Enabled: false,
    dhcpOption82SubOption151Enabled: false,
    dhcpOption82SubOption151Format: null,
    dhcpOption82MacFormat: null,
    enableMulticastUplinkRateLimiting: false,
    enableMulticastDownlinkRateLimiting: false,
    enableMulticastUplinkRateLimiting6G: false,
    enableMulticastDownlinkRateLimiting6G: false,
    wifi6Enabled: networkConfig.wifi6Enabled !== undefined ? networkConfig.wifi6Enabled : true,
    wifi7Enabled: networkConfig.wifi7Enabled !== undefined ? networkConfig.wifi7Enabled : true,
    multiLinkOperationEnabled: false,
    multiLinkOperationOptions: {
      enable24G: true,
      enable50G: true,
      enable6G: true
    },
    qosMirroringEnabled: true,
    qosMapSetEnabled: false,
    qosMapSetOptions: {
      rules: []
    },
    applicationVisibilityEnabled: true
  };

  wlanConfig.advancedCustomization = wlanConfig.advancedCustomization;
  basePayload.wlan = wlanConfig;

  // Add guest portal configuration for guest type
  if (isGuestType) {
    basePayload.guestPortal = networkConfig.guestPortal || {
      guestNetworkType: 'GuestPass',
      enableSelfService: true,
      endOfDayReauthDelay: false,
      lockoutPeriod: 120,
      lockoutPeriodEnabled: false,
      macCredentialsDuration: 240,
      maxDevices: 1,
      userSessionGracePeriod: 60,
      userSessionTimeout: 1440,
      walledGardens: []
    };
    basePayload.redirectCheckbox = false;
    basePayload.enableDhcp = false;
  }

  const payload = basePayload;

  // Step 1: Create WiFi network
  console.log('[RUCKUS] Creating WiFi network...');
  const createResponse = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Create WiFi network');

  const createData = createResponse.data;
  const createRequestId = createData.requestId;
  const networkId = createData.response?.id;

  if (!createRequestId) {
    throw new Error('No requestId returned from WiFi network creation API');
  }

  if (!networkId) {
    throw new Error('No network ID returned from WiFi network creation API');
  }

  console.log(`[RUCKUS] WiFi network created with ID: ${networkId}, requestId: ${createRequestId}`);

  // Step 2: Associate portal service profile for guest pass networks
  let portalRequestId: string | undefined;
  if (isGuestType && networkConfig.portalServiceProfileId) {
    console.log('[RUCKUS] Associating portal service profile...');
    const portalUrl = `${apiUrl}/${networkId}/portalServiceProfiles/${networkConfig.portalServiceProfileId}`;

    const portalResponse = await makeRuckusApiCall({
      method: 'put',
      url: portalUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, 'Associate portal service profile');

    const portalData = portalResponse.data;
    portalRequestId = portalData.requestId;

    if (!portalRequestId) {
      console.warn('[RUCKUS] No requestId returned from portal service profile association API (may be synchronous)');
    }
  }

  // Step 3: Set RADIUS server profile settings (for all network types)
  console.log('[RUCKUS] Configuring RADIUS settings...');
  const radiusUrl = `${apiUrl}/${networkId}/radiusServerProfileSettings`;

  // Send empty object for all network types during creation
  const radiusPayload = {};

  const radiusResponse = await makeRuckusApiCall({
    method: 'put',
    url: radiusUrl,
    data: radiusPayload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Configure RADIUS settings');

  const radiusData = radiusResponse.data;
  const radiusRequestId = radiusData.requestId;

  if (!radiusRequestId) {
    console.warn('[RUCKUS] No requestId returned from RADIUS settings API (may be synchronous)');
  }

  // Poll all operations for completion
  const requestIds = [
    { id: createRequestId, name: 'Create WiFi network' },
    ...(portalRequestId ? [{ id: portalRequestId, name: 'Associate portal service profile' }] : []),
    ...(radiusRequestId ? [{ id: radiusRequestId, name: 'Configure RADIUS settings' }] : [])
  ];

  let retryCount = 0;
  const completedActivities: any[] = [];

  while (retryCount < maxRetries) {
    try {
      // Check status of all pending activities
      const pendingActivities = requestIds.filter(req =>
        !completedActivities.find(c => c.activityId === req.id)
      );

      if (pendingActivities.length === 0) {
        // All activities completed
        return {
          networkId,
          createRequestId,
          portalRequestId,
          radiusRequestId,
          status: 'completed',
          message: 'WiFi network created successfully',
          activities: completedActivities
        };
      }

      // Poll each pending activity
      for (const activity of pendingActivities) {
        const activityDetails = await getRuckusActivityDetails(token, activity.id, region);

        const isCompleted = activityDetails.endDatetime !== undefined;
        const isFailed =
          activityDetails.status !== 'SUCCESS' &&
          activityDetails.status !== 'INPROGRESS';

        if (isCompleted) {
          if (activityDetails.status === 'SUCCESS') {
            console.log(`[RUCKUS] ${activity.name} completed successfully`);
            completedActivities.push({
              activityId: activity.id,
              name: activity.name,
              status: 'SUCCESS',
              details: activityDetails
            });
          } else {
            // Operation failed
            return {
              networkId,
              createRequestId,
              portalRequestId,
              radiusRequestId,
              status: 'failed',
              message: `${activity.name} failed`,
              error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status',
              activities: [...completedActivities, { activityId: activity.id, name: activity.name, status: activityDetails.status, details: activityDetails }]
            };
          }
        } else if (isFailed) {
          // Operation failed without completion
          return {
            networkId,
            createRequestId,
            portalRequestId,
            radiusRequestId,
            status: 'failed',
            message: `${activity.name} failed`,
            error: activityDetails.error || activityDetails.message || 'Operation failed',
            activities: [...completedActivities, { activityId: activity.id, name: activity.name, status: activityDetails.status, details: activityDetails }]
          };
        }
      }

      // If some activities still pending, increment retry count
      retryCount++;
      console.log(`[RUCKUS] WiFi network creation in progress, attempt ${retryCount}/${maxRetries}`);

      if (retryCount >= maxRetries) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));

    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);

      if (retryCount >= maxRetries) {
        return {
          networkId,
          createRequestId,
          portalRequestId,
          radiusRequestId,
          status: 'timeout',
          message: 'WiFi network creation status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries',
          activities: completedActivities
        };
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    networkId,
    createRequestId,
    portalRequestId,
    radiusRequestId,
    status: 'timeout',
    message: 'WiFi network creation status unknown - polling timeout',
    activities: completedActivities
  };
}

export async function activateWifiNetworkAtVenuesWithRetry(
  token: string,
  networkId: string,
  venueConfigs: Array<{
    venueId: string;
    isAllApGroups: boolean;
    apGroups?: string[];
    allApGroupsRadio: 'Both' | '2.4GHz' | '5GHz' | '6GHz';
    allApGroupsRadioTypes: string[];
    scheduler: {
      type: 'ALWAYS_ON' | 'SCHEDULED';
      [key: string]: any;
    };
  }>,
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000,
  portalServiceProfileId?: string,
  fullNetworkConfig?: any
): Promise<any> {
  const baseApiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud`
    : 'https://api.ruckus.cloud';

  // Step 0: Retrieve full network configuration if not provided
  let networkConfig: any;
  if (fullNetworkConfig) {
    networkConfig = fullNetworkConfig;
  } else {
    console.log('[RUCKUS] Retrieving full network configuration...');
    networkConfig = await getWifiNetwork(token, networkId, region);
  }

  // Detect network type
  const networkType = networkConfig.type || networkConfig.nwSubType;
  const isGuestType = networkType === 'guest';

  // Step 1: Update WiFi network with full config and venues array
  console.log('[RUCKUS] Updating WiFi network with venue associations...');
  const updateUrl = `${baseApiUrl}/wifiNetworks/${networkId}`;

  // Build venues array for the payload
  const venuesArray = venueConfigs.map(config => ({
    apGroups: config.apGroups || [],
    scheduler: config.scheduler,
    isAllApGroups: config.isAllApGroups,
    allApGroupsRadio: config.allApGroupsRadio,
    allApGroupsRadioTypes: config.allApGroupsRadioTypes,
    venueId: config.venueId
  }));

  // Merge full network config with venues array
  const updatePayload = {
    ...networkConfig,
    venues: venuesArray,
    id: networkId
  };

  const updateResponse = await makeRuckusApiCall({
    method: 'put',
    url: updateUrl,
    data: updatePayload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update WiFi network with venues');

  const updateData = updateResponse.data;
  const updateRequestId = updateData.requestId;

  if (!updateRequestId) {
    console.warn('[RUCKUS] No requestId returned from network update (may be synchronous)');
  }

  // Step 2: Re-associate portal service profile for guest pass networks
  let portalRequestId: string | undefined;
  if (isGuestType && portalServiceProfileId) {
    console.log('[RUCKUS] Re-associating portal service profile...');
    const portalUrl = `${baseApiUrl}/wifiNetworks/${networkId}/portalServiceProfiles/${portalServiceProfileId}`;

    const portalResponse = await makeRuckusApiCall({
      method: 'put',
      url: portalUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, 'Re-associate portal service profile');

    const portalData = portalResponse.data;
    portalRequestId = portalData.requestId;

    if (!portalRequestId) {
      console.warn('[RUCKUS] No requestId returned from portal service profile re-association API (may be synchronous)');
    }
  }

  // Step 3: Update RADIUS server profile settings with correct payload based on network type
  console.log('[RUCKUS] Updating RADIUS server profile settings...');
  const radiusUrl = `${baseApiUrl}/wifiNetworks/${networkId}/radiusServerProfileSettings`;

  // Guest pass networks use enableAuthProxy: true, PSK/Enterprise use enableAuthProxy: false
  const radiusPayload = {
    enableAccountingProxy: false,
    enableAuthProxy: isGuestType ? true : false
  };

  const radiusResponse = await makeRuckusApiCall({
    method: 'put',
    url: radiusUrl,
    data: radiusPayload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update RADIUS settings');

  const radiusData = radiusResponse.data;
  const radiusRequestId = radiusData.requestId;

  if (!radiusRequestId) {
    console.warn('[RUCKUS] No requestId returned from RADIUS settings update (may be synchronous)');
  }

  // Steps 3-N: Activate at each venue (2 calls per venue)
  const venueRequestIds: Array<{ id: string; name: string }> = [];

  for (const venueConfig of venueConfigs) {
    const venueId = venueConfig.venueId;

    // Step 3a: Activate network at venue
    console.log(`[RUCKUS] Activating network at venue ${venueId}...`);
    const venueActivateUrl = `${baseApiUrl}/venues/${venueId}/wifiNetworks/${networkId}`;

    const venueActivatePayload = {
      apGroups: venueConfig.apGroups || [],
      scheduler: venueConfig.scheduler,
      isAllApGroups: venueConfig.isAllApGroups,
      allApGroupsRadio: venueConfig.allApGroupsRadio,
      allApGroupsRadioTypes: venueConfig.allApGroupsRadioTypes,
      venueId: venueId,
      networkId: networkId
    };

    const venueActivateResponse = await makeRuckusApiCall({
      method: 'put',
      url: venueActivateUrl,
      data: venueActivatePayload,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, `Activate network at venue ${venueId}`);

    const venueActivateData = venueActivateResponse.data;
    const venueActivateRequestId = venueActivateData.requestId;

    if (venueActivateRequestId) {
      venueRequestIds.push({
        id: venueActivateRequestId,
        name: `Activate at venue ${venueId}`
      });
    }

    // Step 3b: Update venue-specific settings
    console.log(`[RUCKUS] Updating settings for venue ${venueId}...`);
    const venueSettingsUrl = `${baseApiUrl}/venues/${venueId}/wifiNetworks/${networkId}/settings`;

    const venueSettingsPayload = venueActivatePayload; // Same payload

    const venueSettingsResponse = await makeRuckusApiCall({
      method: 'put',
      url: venueSettingsUrl,
      data: venueSettingsPayload,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, `Update settings for venue ${venueId}`);

    const venueSettingsData = venueSettingsResponse.data;
    const venueSettingsRequestId = venueSettingsData.requestId;

    if (venueSettingsRequestId) {
      venueRequestIds.push({
        id: venueSettingsRequestId,
        name: `Update settings for venue ${venueId}`
      });
    }
  }

  // Collect all requestIds for polling
  const allRequestIds = [
    ...(updateRequestId ? [{ id: updateRequestId, name: 'Update network with venues' }] : []),
    ...(portalRequestId ? [{ id: portalRequestId, name: 'Re-associate portal service profile' }] : []),
    ...(radiusRequestId ? [{ id: radiusRequestId, name: 'Update RADIUS settings' }] : []),
    ...venueRequestIds
  ];

  console.log(`[RUCKUS] Total async operations to poll: ${allRequestIds.length}`);

  // Poll all operations for completion
  let retryCount = 0;
  const completedActivities: any[] = [];

  while (retryCount < maxRetries) {
    try {
      // Check status of all pending activities
      const pendingActivities = allRequestIds.filter(req =>
        !completedActivities.find(c => c.activityId === req.id)
      );

      if (pendingActivities.length === 0) {
        // All activities completed
        return {
          networkId,
          venueIds: venueConfigs.map(v => v.venueId),
          status: 'completed',
          message: `WiFi network activated successfully at ${venueConfigs.length} venue(s)`,
          activities: completedActivities
        };
      }

      // Poll each pending activity
      for (const activity of pendingActivities) {
        const activityDetails = await getRuckusActivityDetails(token, activity.id, region);

        const isCompleted = activityDetails.endDatetime !== undefined;
        const isFailed =
          activityDetails.status !== 'SUCCESS' &&
          activityDetails.status !== 'INPROGRESS';

        if (isCompleted) {
          if (activityDetails.status === 'SUCCESS') {
            console.log(`[RUCKUS] ${activity.name} completed successfully`);
            completedActivities.push({
              activityId: activity.id,
              name: activity.name,
              status: 'SUCCESS',
              details: activityDetails
            });
          } else {
            // Operation failed
            return {
              networkId,
              venueIds: venueConfigs.map(v => v.venueId),
              status: 'failed',
              message: `${activity.name} failed`,
              error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status',
              activities: [...completedActivities, { activityId: activity.id, name: activity.name, status: activityDetails.status, details: activityDetails }]
            };
          }
        } else if (isFailed) {
          // Operation failed without completion
          return {
            networkId,
            venueIds: venueConfigs.map(v => v.venueId),
            status: 'failed',
            message: `${activity.name} failed`,
            error: activityDetails.error || activityDetails.message || 'Operation failed',
            activities: [...completedActivities, { activityId: activity.id, name: activity.name, status: activityDetails.status, details: activityDetails }]
          };
        }
      }

      // If some activities still pending, increment retry count
      retryCount++;
      console.log(`[RUCKUS] WiFi network activation in progress, attempt ${retryCount}/${maxRetries} (${pendingActivities.length} operations pending)`);

      if (retryCount >= maxRetries) {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));

    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);

      if (retryCount >= maxRetries) {
        return {
          networkId,
          venueIds: venueConfigs.map(v => v.venueId),
          status: 'timeout',
          message: 'WiFi network activation status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries',
          activities: completedActivities
        };
      }

      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    networkId,
    venueIds: venueConfigs.map(v => v.venueId),
    status: 'timeout',
    message: 'WiFi network activation status unknown - polling timeout',
    activities: completedActivities
  };
}

export async function activateWifiNetworkAtVenueWithRetry(
  token: string,
  networkId: string,
  venueId: string,
  venueConfig: {
    isAllApGroups: boolean;
    apGroups?: string[];
    allApGroupsRadio: 'Both' | '2.4GHz' | '5GHz' | '6GHz';
    allApGroupsRadioTypes: string[];
    scheduler: {
      type: 'ALWAYS_ON' | 'SCHEDULED';
      [key: string]: any;
    };
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  // This is a convenience wrapper around activateWifiNetworkAtVenuesWithRetry
  // for activating at a single venue
  console.log(`[RUCKUS] Activating WiFi network at single venue: ${venueId}`);

  const venueConfigs = [
    {
      venueId,
      ...venueConfig
    }
  ];

  return activateWifiNetworkAtVenuesWithRetry(
    token,
    networkId,
    venueConfigs,
    region,
    maxRetries,
    pollIntervalMs
  );
}

export async function queryWifiNetworks(
  token: string,
  region: string = '',
  filters: any = {},
  fields: string[] = ['name', 'description', 'nwSubType', 'venueApGroups', 'apSerialNumbers', 'apCount', 'clientCount', 'vlan', 'cog', 'ssid', 'vlanPool', 'captiveType', 'id', 'securityProtocol', 'dsaeOnboardNetwork', 'isOweMaster', 'owePairNetworkId', 'tunnelWlanEnable', 'isEnforced'],
  searchString: string = '',
  searchTargetFields: string[] = ['name'],
  page: number = 1,
  pageSize: number = 10,
  sortField: string = 'name',
  sortOrder: string = 'ASC'
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/wifiNetworks/query`
    : 'https://api.ruckus.cloud/wifiNetworks/query';

  const payload = {
    fields,
    searchString,
    filters,
    page,
    pageSize,
    defaultPageSize: 10,
    total: 0,
    sortField,
    sortOrder,
    searchTargetFields
  };

  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Query WiFi networks');

  return response.data;
}

export async function getWifiNetwork(
  token: string,
  networkId: string,
  region: string = ''
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/wifiNetworks/${networkId}`
    : `https://api.ruckus.cloud/wifiNetworks/${networkId}`;

  const response = await makeRuckusApiCall({
    method: 'get',
    url: apiUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Get WiFi network');

  return response.data;
}

export async function updateWifiNetworkPortalServiceProfileWithRetry(
  token: string,
  networkId: string,
  profileId: string,
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/wifiNetworks/${networkId}/portalServiceProfiles/${profileId}`
    : `https://api.ruckus.cloud/wifiNetworks/${networkId}/portalServiceProfiles/${profileId}`;

  const response = await makeRuckusApiCall({
    method: 'put',
    url: apiUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update WiFi network portal service profile');

  const updateResponse = response.data;
  
  const activityId = updateResponse.requestId;
  
  if (!activityId) {
    return {
      ...updateResponse,
      status: 'completed',
      message: 'Portal service profile associated successfully (synchronous operation)'
    };
  }

  console.log(`Starting portal service profile association status polling for activity ${activityId}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Polling attempt ${attempt}/${maxRetries} for portal service profile association activity ${activityId}`);
    
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...updateResponse,
          status: 'completed',
          message: 'Portal service profile associated successfully',
          activityDetails
        };
      } else if (activityDetails.status === 'FAILED') {
        return {
          ...updateResponse,
          status: 'failed',
          message: 'Portal service profile association failed',
          error: activityDetails.error || 'Unknown error occurred',
          activityDetails
        };
      }
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'Portal service profile association status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error: any) {
      console.error(`Error polling portal service profile association activity (attempt ${attempt}):`, error.message);
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'Portal service profile association status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...updateResponse,
    status: 'timeout',
    message: 'Portal service profile association status unknown - polling timeout',
    activityId
  };
}

export async function updateWifiNetworkRadiusServerProfileSettingsWithRetry(
  token: string,
  networkId: string,
  region: string = '',
  enableAccountingProxy: boolean = false,
  enableAuthProxy: boolean = false,
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/wifiNetworks/${networkId}/radiusServerProfileSettings`
    : `https://api.ruckus.cloud/wifiNetworks/${networkId}/radiusServerProfileSettings`;

  // Use empty object if both are false (default), otherwise send the values
  const payload = (enableAccountingProxy === false && enableAuthProxy === false)
    ? {}
    : {
        enableAccountingProxy,
        enableAuthProxy
      };

  const response = await makeRuckusApiCall({
    method: 'put',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update WiFi network RADIUS server profile settings');

  const updateResponse = response.data;
  
  const activityId = updateResponse.requestId;
  
  if (!activityId) {
    return {
      ...updateResponse,
      status: 'completed',
      message: 'RADIUS server profile settings updated successfully (synchronous operation)'
    };
  }

  console.log(`Starting RADIUS server profile settings update status polling for activity ${activityId}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Polling attempt ${attempt}/${maxRetries} for RADIUS server profile settings update activity ${activityId}`);
    
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...updateResponse,
          status: 'completed',
          message: 'RADIUS server profile settings updated successfully',
          activityDetails
        };
      } else if (activityDetails.status === 'FAILED') {
        return {
          ...updateResponse,
          status: 'failed',
          message: 'RADIUS server profile settings update failed',
          error: activityDetails.error || 'Unknown error occurred',
          activityDetails
        };
      }
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'RADIUS server profile settings update status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error: any) {
      console.error(`Error polling RADIUS server profile settings update activity (attempt ${attempt}):`, error.message);
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'RADIUS server profile settings update status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...updateResponse,
    status: 'timeout',
    message: 'RADIUS server profile settings update status unknown - polling timeout',
    activityId
  };
}

export async function updateWifiNetworkWithRetry(
  token: string,
  networkId: string,
  networkConfig: any,
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/wifiNetworks/${networkId}`
    : `https://api.ruckus.cloud/wifiNetworks/${networkId}`;

  const response = await makeRuckusApiCall({
    method: 'put',
    url: apiUrl,
    data: networkConfig,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update WiFi network');

  const updateResponse = response.data;
  
  const activityId = updateResponse.requestId;
  
  if (!activityId) {
    return {
      ...updateResponse,
      status: 'completed',
      message: 'WiFi network updated successfully (synchronous operation)'
    };
  }

  console.log(`Starting WiFi network update status polling for activity ${activityId}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Polling attempt ${attempt}/${maxRetries} for WiFi network update activity ${activityId}`);
    
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);
      console.log(`Activity status: ${activityDetails.status}`);
      
      if (activityDetails.status === 'COMPLETED') {
        return {
          ...updateResponse,
          status: 'completed',
          message: 'WiFi network updated successfully',
          activityDetails
        };
      } else if (activityDetails.status === 'FAILED') {
        return {
          ...updateResponse,
          status: 'failed',
          message: 'WiFi network update failed',
          error: activityDetails.error || 'Unknown error occurred',
          activityDetails
        };
      }
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'WiFi network update status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    } catch (error: any) {
      console.error(`Error polling WiFi network update activity (attempt ${attempt}):`, error.message);
      
      if (attempt === maxRetries) {
        return {
          ...updateResponse,
          status: 'timeout',
          message: 'WiFi network update status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...updateResponse,
    status: 'timeout',
    message: 'WiFi network update status unknown - polling timeout',
    activityId
  };
}

/**
 * Deactivate a WiFi network from one or more venues with automatic retry mechanism
 * This function handles the entire deactivation workflow:
 * 1. Retrieves full network configuration
 * 2. Updates network with empty venues array
 * 3. Resets RADIUS server profile settings
 * 4. Deletes network from each specified venue
 * 5. Polls all operations for completion
 */
export async function deactivateWifiNetworkAtVenuesWithRetry(
  token: string,
  networkId: string,
  venueIds: string[],
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  console.log('[RUCKUS] Starting WiFi network deactivation with retry...');
  console.log('[RUCKUS] Network ID:', networkId);
  console.log('[RUCKUS] Venue IDs:', venueIds);
  console.log('[RUCKUS] Max retries:', maxRetries);
  console.log('[RUCKUS] Poll interval (ms):', pollIntervalMs);

  // Step 0: Retrieve full network configuration
  console.log('[RUCKUS] Retrieving full network configuration...');
  const networkConfig = await getWifiNetwork(token, networkId, region);
  console.log('[RUCKUS] Retrieved network config:', JSON.stringify(networkConfig, null, 2));

  // Step 1: Update network with empty venues array
  const updateNetworkUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/wifiNetworks/${networkId}`
    : `https://api.ruckus.cloud/wifiNetworks/${networkId}`;

  const updateNetworkPayload = {
    ...networkConfig,
    venues: [],
    id: networkId
  };

  console.log('[RUCKUS] Step 1: Updating network with empty venues array...');
  console.log('[RUCKUS] Update network URL:', updateNetworkUrl);
  console.log('[RUCKUS] Update network payload:', JSON.stringify(updateNetworkPayload, null, 2));

  const updateNetworkResponse = await makeRuckusApiCall({
    method: 'put',
    url: updateNetworkUrl,
    data: updateNetworkPayload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update WiFi network (deactivate - set venues to empty)');

  console.log('[RUCKUS] Update network response:', JSON.stringify(updateNetworkResponse.data, null, 2));
  const updateNetworkRequestId = updateNetworkResponse.data.requestId;

  // Step 2: Reset RADIUS server profile settings
  const radiusUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/wifiNetworks/${networkId}/radiusServerProfileSettings`
    : `https://api.ruckus.cloud/wifiNetworks/${networkId}/radiusServerProfileSettings`;

  const radiusPayload = {};

  console.log('[RUCKUS] Step 2: Resetting RADIUS server profile settings...');
  console.log('[RUCKUS] RADIUS URL:', radiusUrl);
  console.log('[RUCKUS] RADIUS payload:', JSON.stringify(radiusPayload, null, 2));

  const radiusResponse = await makeRuckusApiCall({
    method: 'put',
    url: radiusUrl,
    data: radiusPayload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Update WiFi network RADIUS settings (deactivate - reset to empty)');

  console.log('[RUCKUS] RADIUS response:', JSON.stringify(radiusResponse.data, null, 2));
  const radiusRequestId = radiusResponse.data.requestId;

  // Step 3-N: Delete network from each venue
  const venueRequestIds: Array<{ id: string; name: string; venueId: string }> = [];

  for (const venueId of venueIds) {
    const deleteVenueNetworkUrl = region && region.trim() !== ''
      ? `https://api.${region}.ruckus.cloud/venues/${venueId}/wifiNetworks/${networkId}`
      : `https://api.ruckus.cloud/venues/${venueId}/wifiNetworks/${networkId}`;

    console.log(`[RUCKUS] Step 3+: Deleting network from venue ${venueId}...`);
    console.log('[RUCKUS] Delete venue network URL:', deleteVenueNetworkUrl);

    const deleteVenueNetworkResponse = await makeRuckusApiCall({
      method: 'delete',
      url: deleteVenueNetworkUrl,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, `Delete WiFi network from venue ${venueId}`);

    console.log('[RUCKUS] Delete venue network response:', JSON.stringify(deleteVenueNetworkResponse.data, null, 2));

    if (deleteVenueNetworkResponse.data.requestId) {
      venueRequestIds.push({
        id: deleteVenueNetworkResponse.data.requestId,
        name: `Delete from venue ${venueId}`,
        venueId
      });
    }
  }

  // Collect all requestIds for polling
  const requestIds = [
    { id: updateNetworkRequestId, name: 'Update network (empty venues)' },
    { id: radiusRequestId, name: 'Reset RADIUS settings' },
    ...venueRequestIds
  ];

  console.log('[RUCKUS] All request IDs to poll:', JSON.stringify(requestIds, null, 2));

  // Poll all operations for completion
  let retryCount = 0;
  const completedActivities: any[] = [];

  while (retryCount < maxRetries) {
    console.log(`[RUCKUS] Polling attempt ${retryCount + 1}/${maxRetries}...`);

    const pendingActivities = requestIds.filter(req =>
      !completedActivities.find(c => c.activityId === req.id)
    );

    if (pendingActivities.length === 0) {
      console.log('[RUCKUS] All deactivation operations completed successfully');
      return {
        status: 'completed',
        message: `WiFi network deactivated from ${venueIds.length} venue(s) successfully`,
        networkId,
        venueIds,
        updateNetworkRequestId,
        radiusRequestId,
        venueRequestIds: venueRequestIds.map(v => ({ venueId: v.venueId, requestId: v.id })),
        completedActivities
      };
    }

    for (const request of pendingActivities) {
      try {
        const activityDetails = await getRuckusActivityDetails(token, request.id, region);
        console.log(`[RUCKUS] Activity ${request.name} (${request.id}) status:`, activityDetails.status);

        if (activityDetails.status === 'COMPLETED') {
          completedActivities.push({
            activityId: request.id,
            name: request.name,
            status: activityDetails.status,
            details: activityDetails
          });
          console.log(`[RUCKUS] ✓ ${request.name} completed successfully`);
        } else if (activityDetails.status === 'FAILED') {
          console.error(`[RUCKUS] ✗ ${request.name} failed:`, activityDetails);
          return {
            status: 'failed',
            message: `WiFi network deactivation failed: ${request.name}`,
            networkId,
            venueIds,
            updateNetworkRequestId,
            radiusRequestId,
            venueRequestIds: venueRequestIds.map(v => ({ venueId: v.venueId, requestId: v.id })),
            failedActivity: activityDetails,
            completedActivities,
            error: activityDetails.error || 'Operation failed'
          };
        }
      } catch (error: any) {
        console.error(`[RUCKUS] Error checking activity ${request.id}:`, error);
        if (retryCount === maxRetries - 1) {
          return {
            status: 'timeout',
            message: 'WiFi network deactivation status unknown - polling timeout',
            networkId,
            venueIds,
            updateNetworkRequestId,
            radiusRequestId,
            venueRequestIds: venueRequestIds.map(v => ({ venueId: v.venueId, requestId: v.id })),
            completedActivities,
            error: 'Failed to get activity status after maximum retries'
          };
        }
      }
    }

    retryCount++;

    if (completedActivities.length < requestIds.length) {
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    status: 'timeout',
    message: 'WiFi network deactivation status unknown - polling timeout',
    networkId,
    venueIds,
    updateNetworkRequestId,
    radiusRequestId,
    venueRequestIds: venueRequestIds.map(v => ({ venueId: v.venueId, requestId: v.id })),
    completedActivities
  };
}

/**
 * Delete a WiFi network with automatic retry mechanism
 * This function handles the deletion workflow with polling for completion status
 */
export async function deleteWifiNetworkWithRetry(
  token: string,
  networkId: string,
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/wifiNetworks/${networkId}`
    : `https://api.ruckus.cloud/wifiNetworks/${networkId}`;

  const response = await makeRuckusApiCall({
    method: 'delete',
    url: apiUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Delete WiFi network');

  const deleteResponse = response.data;

  // Always get requestId for async tracking (delete operations always return requestId)
  const activityId = deleteResponse.requestId;

  if (!activityId) {
    throw new Error('No requestId returned from WiFi network deletion API');
  }

  // Poll for completion status
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);

      // Check if operation is completed (has endDatetime populated)
      const isCompleted = activityDetails.endDatetime !== undefined;

      // Check if operation failed (status is not SUCCESS or INPROGRESS)
      const isFailed =
        activityDetails.status !== 'SUCCESS' &&
        activityDetails.status !== 'INPROGRESS';

      if (isCompleted) {
        // Check if it completed successfully
        if (activityDetails.status === 'SUCCESS') {
          return {
            ...deleteResponse,
            activityDetails,
            status: 'completed',
            message: 'WiFi network deleted successfully'
          };
        } else {
          return {
            ...deleteResponse,
            activityDetails,
            status: 'failed',
            message: 'WiFi network deletion failed',
            error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status'
          };
        }
      }

      if (isFailed) {
        return {
          ...deleteResponse,
          activityDetails,
          status: 'failed',
          message: 'WiFi network deletion failed',
          error: activityDetails.error || activityDetails.message || 'Unknown error'
        };
      }

      // If still in progress, increment retry count and continue
      retryCount++;
      console.log(`[RUCKUS] WiFi network deletion in progress, attempt ${retryCount}/${maxRetries}`);

      // If we've reached max retries, exit loop
      if (retryCount >= maxRetries) {
        break;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));

    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);

      // If we've reached max retries, return error
      if (retryCount >= maxRetries) {
        return {
          ...deleteResponse,
          status: 'timeout',
          message: 'WiFi network deletion status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }

      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...deleteResponse,
    status: 'timeout',
    message: 'WiFi network deletion status unknown - polling timeout',
    activityId
  };
}

/**
 * Create a guest pass credential for a WiFi network with automatic retry mechanism
 * This function handles the guest pass creation workflow with polling for completion status
 */
export async function createGuestPassWithRetry(
  token: string,
  networkId: string,
  guestPassData: {
    name: string;
    expiration: {
      duration: number;
      unit: 'Hour' | 'Day' | 'Week' | 'Month';
      activationType: 'Creation' | 'FirstUse';
    };
    maxDevices: number;
    deliveryMethods: ('PRINT' | 'EMAIL' | 'SMS')[];
    mobilePhoneNumber?: string | null;
    email?: string;
    notes?: string;
  },
  region: string = '',
  maxRetries: number = 5,
  pollIntervalMs: number = 2000
): Promise<any> {
  const apiUrl = region && region.trim() !== ''
    ? `https://api.${region}.ruckus.cloud/wifiNetworks/${networkId}/guestUsers`
    : `https://api.ruckus.cloud/wifiNetworks/${networkId}/guestUsers`;

  const payload = {
    name: guestPassData.name,
    mobilePhoneNumber: guestPassData.mobilePhoneNumber || null,
    email: guestPassData.email || '',
    notes: guestPassData.notes || '',
    expiration: guestPassData.expiration,
    maxDevices: guestPassData.maxDevices,
    deliveryMethods: guestPassData.deliveryMethods
  };

  const response = await makeRuckusApiCall({
    method: 'post',
    url: apiUrl,
    data: payload,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }, 'Create guest pass');

  const createResponse = response.data;

  // Always get requestId for async tracking (create operations always return requestId)
  const activityId = createResponse.requestId;

  if (!activityId) {
    throw new Error('No requestId returned from guest pass creation API');
  }

  // Poll for completion status
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
      const activityDetails = await getRuckusActivityDetails(token, activityId, region);

      // Check if operation is completed (has endDatetime populated)
      const isCompleted = activityDetails.endDatetime !== undefined;

      // Check if operation failed (status is not SUCCESS or INPROGRESS)
      const isFailed =
        activityDetails.status !== 'SUCCESS' &&
        activityDetails.status !== 'INPROGRESS';

      if (isCompleted) {
        // Check if it completed successfully
        if (activityDetails.status === 'SUCCESS') {
          return {
            ...createResponse,
            activityDetails,
            status: 'completed',
            message: 'Guest pass created successfully'
          };
        } else {
          return {
            ...createResponse,
            activityDetails,
            status: 'failed',
            message: 'Guest pass creation failed',
            error: activityDetails.error || activityDetails.message || 'Operation completed with non-SUCCESS status'
          };
        }
      }

      if (isFailed) {
        return {
          ...createResponse,
          activityDetails,
          status: 'failed',
          message: 'Guest pass creation failed',
          error: activityDetails.error || activityDetails.message || 'Unknown error'
        };
      }

      // If still in progress, increment retry count and continue
      retryCount++;
      console.log(`[RUCKUS] Guest pass creation in progress, attempt ${retryCount}/${maxRetries}`);

      // If we've reached max retries, exit loop
      if (retryCount >= maxRetries) {
        break;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));

    } catch (error) {
      retryCount++;
      console.error(`[RUCKUS] Error polling activity details (attempt ${retryCount}/${maxRetries}):`, error);

      // If we've reached max retries, return error
      if (retryCount >= maxRetries) {
        return {
          ...createResponse,
          status: 'timeout',
          message: 'Guest pass creation status unknown - polling timeout',
          error: 'Failed to get activity status after maximum retries'
        };
      }

      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  return {
    ...createResponse,
    status: 'timeout',
    message: 'Guest pass creation status unknown - polling timeout',
    activityId
  };
}

