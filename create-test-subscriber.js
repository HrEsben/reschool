// Script to properly configure subscriber for inbox channel
// Run this: node create-test-subscriber.js

const { Novu } = require('@novu/api');
require('dotenv').config({ path: '.env.local' });

const novu = new Novu({
  secretKey: process.env.NOVU_SECRET_KEY,
  serverURL: "https://eu.api.novu.co",
  serverIdx: 1
});

async function fixSubscriberChannels() {
  try {
    const subscriberId = '68cbb9ae95046b25527aa677';
    
    console.log('🔧 Fixing subscriber channel configuration...');
    
    // First, let's check current subscriber status
    try {
      const subscriber = await novu.subscribers.get(subscriberId);
      console.log('📋 Current subscriber:', JSON.stringify(subscriber, null, 2));
    } catch (error) {
      console.log('⚠️ Could not fetch subscriber details');
    }
    
    // Delete and recreate subscriber to reset channel configuration
    try {
      console.log('🗑️ Deleting existing subscriber...');
      await novu.subscribers.delete(subscriberId);
      console.log('✅ Subscriber deleted');
    } catch (error) {
      console.log('ℹ️ Subscriber may not exist, continuing...');
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create fresh subscriber
    console.log('👤 Creating fresh subscriber...');
    const createResponse = await novu.subscribers.create({
      subscriberId: subscriberId,
      email: 'esben@proeye.com',
      firstName: 'Esben',
      lastName: 'Pro'
    });
    
    console.log('✅ Subscriber created:', createResponse);
    
    // Set preferences using the correct API method
    console.log('⚙️ Setting channel preferences...');
    try {
      await novu.subscribers.setOnlineStatus(subscriberId, true);
      console.log('✅ Subscriber set to online');
      
      // Try updating preferences with correct API
      const preferencesResponse = await novu.subscribers.getPreferences(subscriberId);
      console.log('📋 Current preferences:', preferencesResponse);
    } catch (prefError) {
      console.log('⚠️ Preference setting error:', prefError.message);
    }
    
    console.log('\n🎯 Try your workflow test now with:');
    console.log('Subscriber ID:', subscriberId);
    console.log('Payload:', JSON.stringify({
      "submission_child_name": "Emma Test",
      "submission_tool_name": "Følelsesbarometer",
      "submission_tool_type": "barometer",
      "submission_submitted_by_name": "Test Forælder",
      "submission_timestamp": new Date().toISOString()
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixSubscriberChannels();
