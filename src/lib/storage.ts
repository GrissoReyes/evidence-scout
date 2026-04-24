import { get, set } from 'idb-keyval';

export async function getCached(key: string): Promise<any> {
  try {
    return await get(key);
  } catch (error) {
    console.warn(`Failed to get cache for ${key}:`, error);
    return null;
  }
}

export async function setCached(key: string, value: any): Promise<void> {
  try {
    await set(key, value);
  } catch (error) {
    console.warn(`Failed to set cache for ${key}:`, error);
  }
}

export async function getCachedAsURL(key: string): Promise<string | null> {
  const blob = await getCached(key);
  if (blob instanceof Blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}
