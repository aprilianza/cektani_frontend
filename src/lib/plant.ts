// lib/plant.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export interface Diagnosis {
  id: string;
  result: string;
  confidence: number;
  notes: string;
  photo_url: string;
  checked_at: string;
}

export interface Plant {
  id: string;
  name: string;
  description: string;
  diagnosis: Diagnosis[];
}

// Get all plants
export const getPlants = async (token: string): Promise<Plant[]> => {
  const response = await fetch(`${API_URL}/plants`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch plants');
  }
  
  return response.json();
};

// Add new plant
export const addPlant = async (token: string, plantData: { name: string; description: string }): Promise<Plant> => {
  const response = await fetch(`${API_URL}/plants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(plantData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to add plant');
  }
  
  return response.json();
};

// Delete plant
export const deletePlant = async (token: string, plantId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/plants/${plantId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete plant');
  }
};
const getLocalISOString = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();
  const localTime = new Date(now.getTime() - (timezoneOffset * 60000));
  return localTime.toISOString();
};
export const diagnosePlant = async (
  token: string,
  plantId: string,
  file: File
): Promise<Diagnosis> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Tetap kirim waktu asli ke backend
  const now = getLocalISOString();
  formData.append('checked_at', now);

  const response = await fetch(`${API_URL}/diagnose/${plantId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to diagnose plant');
  }

  const result = await response.json();
  
  return {
    ...result,
    checked_at: new Date().toISOString() 
  };
};


// quick diagnose plant
export const quickDiagnose = async (token: string, file: File): Promise<Diagnosis> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_URL}/diagnose/quick`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to perform quick diagnosis');
  }
  
  return response.json();
};

// Add these to plant.ts

// Update plant
export const updatePlant = async (
  token: string,
  plantId: string,
  plantData: { name: string; description: string }
): Promise<Plant> => {
  const response = await fetch(`${API_URL}/plants/${plantId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(plantData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update plant');
  }
  
  return response.json();
};

// Delete diagnosis
export const deleteDiagnosis = async (
  token: string,
  plantId: string,
  diagnosisId: string
): Promise<void> => {
  const response = await fetch(`${API_URL}/diagnose/${plantId}/${diagnosisId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete diagnosis');
  }
};