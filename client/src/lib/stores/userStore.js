import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Helper functions for localStorage
function getFromLocalStorage(key) {
  if (!browser) return null;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
}

function setToLocalStorage(key, value) {
  if (!browser) return;
  if (value) {
    localStorage.setItem(key, JSON.stringify(value));
  } else {
    localStorage.removeItem(key);
  }
}

// Initialize from localStorage
const storedUser = getFromLocalStorage('authUser');
const storedToken = getFromLocalStorage('accessToken');

const userStore = writable(storedUser);
const tokenStore = writable(storedToken);

const storedAppId = getFromLocalStorage('currentApplicationId');
const applicationIdStore = writable(storedAppId);

export const user = {
  subscribe: userStore.subscribe,
  set: (value) => {
    setToLocalStorage('authUser', value);
    userStore.set(value);
  },
  reset: () => {
    setToLocalStorage('authUser', null);
    userStore.set(null);
  }
};

export const applicationId = {
  subscribe: applicationIdStore.subscribe,
  set: (value) => {
    setToLocalStorage('currentApplicationId', value);
    applicationIdStore.set(value);
  },
  reset: () => {
    setToLocalStorage('currentApplicationId', null);
    applicationIdStore.set(null);
  }
};

export const token = {
  subscribe: tokenStore.subscribe,
  set: (value) => {
    setToLocalStorage('accessToken', value);
    tokenStore.set(value);
  },
  reset: () => {
    setToLocalStorage('accessToken', null);
    tokenStore.set(null);
  }
};

export const logout = () => {
  if (browser) {
    localStorage.removeItem('authUser');
    localStorage.removeItem('accessToken');
     localStorage.removeItem('currentApplicationId');
  }
  userStore.set(null);
  tokenStore.set(null);
  applicationIdStore.set(null); 
};