// Novu service for EU region (GDPR compliant)
import { Novu } from '@novu/api';

// Initialize Novu client with EU region
const novu = new Novu({
  secretKey: process.env.NOVU_SECRET_KEY!,
  serverURL: "https://eu.api.novu.co"  // EU region for GDPR compliance
});

export { novu };

// Helper functions for Novu EU integration
export async function createNovuSubscriber(subscriberId: string, email?: string, firstName?: string, lastName?: string) {
  try {
    const response = await novu.subscribers.create({
      subscriberId,
      email,
      firstName,
      lastName,
    });
    console.log(`✅ Novu EU subscriber created: ${subscriberId}`);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Error creating Novu EU subscriber:', error);
    return { success: false, error };
  }
}

export async function updateNovuSubscriber(subscriberId: string, data: {
  email?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}) {
  try {
    const response = await novu.subscribers.patch(data, subscriberId);
    console.log(`✅ Novu EU subscriber updated: ${subscriberId}`);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Error updating Novu EU subscriber:', error);
    return { success: false, error };
  }
}

export async function triggerNovuNotification(workflowId: string, subscriberId: string, payload: any) {
  try {
    const response = await novu.trigger({
      workflowId,
      to: { 
        subscriberId,
        timezone: 'Europe/Copenhagen'
      },
      payload,
    });
    console.log(`✅ Novu EU notification triggered: ${workflowId} -> ${subscriberId}`);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Error triggering Novu EU notification:', error);
    return { success: false, error };
  }
}

export async function deleteNovuSubscriber(subscriberId: string) {
  try {
    const response = await novu.subscribers.delete(subscriberId);
    console.log(`✅ Novu EU subscriber deleted: ${subscriberId}`);
    return { success: true, data: response };
  } catch (error) {
    console.error('❌ Error deleting Novu EU subscriber:', error);
    return { success: false, error };
  }
}
