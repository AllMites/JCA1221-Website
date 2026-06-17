/**
 * API client stub — replace with your own implementation.
 * This file exists so exported components compile standalone.
 */

export interface ContactPayload {
  fullName: string
  email: string
  organization: string
  message: string
  phone?: string
  role?: string
  projectType?: string
  estimatedTimeline?: string
}

/**
 * Submit a contact form. Replace with your own fetch/post logic.
 */
export async function submitContact(_data: ContactPayload): Promise<void> {
  // TODO: implement your API call here
  console.warn('[product-plan] submitContact called — implement your own API logic')
}
