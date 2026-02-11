export const safeStorageGet = async (key, isGlobal = false) => {
  try {
    return await window.storage.get(key, isGlobal);
  } catch (err) {
    console.error('Storage get error for key:', key, err);
    return null;
  }
};

export const safeStorageSet = async (key, value, isGlobal = false) => {
  try {
    await window.storage.set(key, value, isGlobal);
  } catch (err) {
    console.error('Storage set error for key:', key, err);
  }
};

