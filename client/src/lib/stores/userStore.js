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

function getTokenFromStorage() {
    if (!browser) return null;
    return localStorage.getItem('accessToken') || null; // ← NO JSON.parse
}

function setTokenToStorage(value) {
    if (!browser) return;
    if (value) localStorage.setItem('accessToken', value); // ← NO JSON.stringify
    else localStorage.removeItem('accessToken');
}


// Initialize from localStorage
const storedUser = getFromLocalStorage('authUser');
const storedToken = getTokenFromStorage();

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
        setTokenToStorage(value); // ← use new function
        tokenStore.set(value);
    },
    reset: () => {
        setTokenToStorage(null);
        tokenStore.set(null);
    }
};;

// export const logout = () => {
//   if (browser) {
//     localStorage.removeItem('authUser');
//     localStorage.removeItem('accessToken');
//      localStorage.removeItem('currentApplicationId');
//   }
//   userStore.set(null);
//   tokenStore.set(null);
//   applicationIdStore.set(null); 
// };

export const logout = () => {
  if (browser) {
    localStorage.removeItem('authUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentApplicationId');
    document.cookie = 'token=; path=/; max-age=0'; // clear cookie
    document.cookie = 'refreshToken=; path=/; max-age=0'; 
  }
  userStore.set(null);
  tokenStore.set(null);
  applicationIdStore.set(null);
};