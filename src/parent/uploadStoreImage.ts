import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../lib/firebase.ts'

const MAX_BYTES = 10 * 1024 * 1024

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/heic': '.heic',
  'image/heif': '.heif',
}

export function storeImageError(file: File) {
  if (!file.type.startsWith('image/')) return 'Choose a photo.'
  if (file.size <= 0 || file.size >= MAX_BYTES) return 'Use a photo under 10MB.'
  return null
}

export async function uploadStoreImage(familyId: string, file: File) {
  const problem = storeImageError(file)
  if (problem) throw new Error(problem)

  const extension = EXTENSIONS[file.type] ?? ''
  const objectRef = ref(storage, `families/${familyId}/store/item-${Date.now()}${extension}`)
  try {
    await uploadBytes(objectRef, file, { contentType: file.type })
    return await getDownloadURL(objectRef)
  } catch {
    throw new Error('Could not save that photo.')
  }
}
