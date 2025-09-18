// Novu service for EU region (GDPR compliant)
import { Novu } from '@novu/api';

// Initialize Novu client with EU region
const novu = new Novu({
  secretKey: process.env.NOVU_SECRET_KEY!,
  serverURL: "https://eu.api.novu.co",  // EU region for GDPR compliance
  serverIdx: 1  // EU server index
});

export { novu };

// Helper functions for Novu EU integration
export async function createNovuSubscriber(subscriberId: string, email?: string, firstName?: string, lastName?: string, additionalData?: Record<string, any>) {
  try {
    const response = await novu.subscribers.create({
      subscriberId,
      email,
      firstName,
      lastName,
      ...(additionalData && { data: additionalData })
    });
    console.log(`✅ Novu EU subscriber created/updated: ${subscriberId}`);
    return { success: true, data: response };
  } catch (error: any) {
    // Handle subscriber already exists - this is normal and ok
    if (error?.message?.includes('already exists') || error?.statusCode === 409) {
      console.log(`ℹ️ Novu subscriber already exists: ${subscriberId} - this is fine`);
      return { success: true, data: null, message: 'Subscriber already exists' };
    }
    
    console.error('❌ Error creating Novu EU subscriber:', error);
    return { success: false, error: error.message || error };
  }
}

export async function updateNovuSubscriber(subscriberId: string, data: {
  email?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}) {
  try {
    // TODO: Fix the patch method signature
    // const response = await novu.subscribers.patch(subscriberId, {}, data);
    console.log(`⚠️ Novu EU subscriber update not implemented yet: ${subscriberId}`);
    return { success: false, error: 'Update method not implemented' };
  } catch (error) {
    console.error('❌ Error updating Novu EU subscriber:', error);
    return { success: false, error };
  }
}

// Add FCM device token to subscriber for push notifications
export async function addFCMTokenToSubscriber(subscriberId: string, fcmToken: string) {
  try {
    // For now, let's use the direct API approach instead of the SDK method
    const response = await fetch(`${process.env.NOVU_API_URL || 'https://eu.api.novu.co'}/v1/subscribers/${subscriberId}/credentials`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${process.env.NOVU_SECRET_KEY}`
      },
      body: JSON.stringify({
        providerId: 'fcm',
        credentials: {
          deviceTokens: [fcmToken]
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ HTTP error adding FCM token:', response.status, result);
      throw new Error(`HTTP error! status: ${response.status}, body: ${JSON.stringify(result)}`);
    }

    console.log(`✅ FCM token added to Novu subscriber: ${subscriberId}`);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error adding FCM token to Novu subscriber:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
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

// Helper function for specific notification types
export async function notifyAdultConnectedToChild(
  subscriberIds: string[],
  adultName: string,
  childName: string,
  adultRelation: string,
  inviterName: string
) {
  const results = [];
  for (const subscriberId of subscriberIds) {
    const result = await triggerNovuNotification(
      'ny-voksen-til-barn',
      subscriberId,
      {
        adult_name: adultName,
        child_name: childName,
        adult_relation: adultRelation,
        inviter_name: inviterName,
        timestamp: new Date().toISOString()
      }
    );
    results.push({ subscriberId, ...result });
  }
  return results;
}

// Helper function for child tool submission notifications
export async function notifyChildSubmission(
  subscriberIds: string[],
  childName: string,
  toolName: string,
  toolType: 'barometer' | 'dagens-smiley' | 'sengetider',
  submittedByName: string,
  submissionData: Record<string, any>
) {
  const results = [];
  for (const subscriberId of subscriberIds) {
    // Use the exact variable names that match your Novu workflow schema
    const payload = {
      // Core submission info with submission_ prefix as required by workflow
      submission_child_name: childName,
      submission_tool_name: toolName,
      submission_tool_type: toolType,
      submission_submitted_by_name: submittedByName,
      submission_timestamp: new Date().toISOString(),
      // Barometer specific fields
      ...(submissionData.rating && { submission_rating: submissionData.rating }),
      ...(submissionData.comment && { submission_comment: submissionData.comment }),
      ...(submissionData.scale_min && { submission_scale_min: submissionData.scale_min }),
      ...(submissionData.scale_max && { submission_scale_max: submissionData.scale_max }),
      // Dagens smiley specific fields
      ...(submissionData.selected_emoji && { submission_selected_emoji: submissionData.selected_emoji }),
      ...(submissionData.reasoning && { submission_reasoning: submissionData.reasoning }),
      // Sengetider specific fields
      ...(submissionData.entry_date && { submission_entry_date: submissionData.entry_date }),
      ...(submissionData.puttetid && { submission_puttetid: submissionData.puttetid }),
      ...(submissionData.sov_kl && { submission_sov_kl: submissionData.sov_kl }),
      ...(submissionData.vaagnede && { submission_vaagnede: submissionData.vaagnede }),
      ...(submissionData.notes && { submission_notes: submissionData.notes })
    };

    const result = await triggerNovuNotification(
      'ny-registrering-til-barn',
      subscriberId,
      payload
    );
    results.push({ subscriberId, ...result });
  }
  return results;
}
