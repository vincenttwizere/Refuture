// Debug Test for Messaging System
// This file helps identify why messages aren't showing up in the refugee dashboard

console.log('=== Messaging Debug Test ===');

// Test 1: Check if messages are being sent
console.log('1. Message Sending Process:');
console.log('- Provider clicks "Send Message" from profile');
console.log('- MessageCenter opens with pre-selected recipient');
console.log('- Provider enters title and message content');
console.log('- sendNewMessage function is called');
console.log('- API call to POST /api/messages');
console.log('- Message saved to database with sender and recipient IDs');

// Test 2: Check if messages are being retrieved
console.log('\n2. Message Retrieval Process:');
console.log('- Refugee dashboard loads');
console.log('- useMessages hook calls fetchMessages()');
console.log('- API call to GET /api/messages');
console.log('- Backend queries database for messages where user is sender OR recipient');
console.log('- Messages are populated with sender/recipient names');
console.log('- Response sent back to frontend');

// Test 3: Potential Issues
console.log('\n3. Potential Issues to Check:');
console.log('✓ User Authentication: Is the user properly logged in?');
console.log('✓ User Roles: Are provider and refugee roles correctly set?');
console.log('✓ Database Connection: Is MongoDB running and connected?');
console.log('✓ Message Creation: Are messages actually being saved?');
console.log('✓ Message Retrieval: Are messages being found for the user?');
console.log('✓ Frontend State: Is the messages state being updated?');

// Test 4: Debug Steps
console.log('\n4. Debug Steps:');
console.log('1. Check browser console for any errors');
console.log('2. Check backend console for message sending/receiving logs');
console.log('3. Verify MongoDB has messages in the database');
console.log('4. Check if user IDs match between sender and recipient');
console.log('5. Verify the useMessages hook is being called');
console.log('6. Check if messages array is empty or has data');

// Test 5: Database Query Check
console.log('\n5. Database Query to Run:');
console.log('In MongoDB shell or Compass:');
console.log('db.messages.find({}) - Check if messages exist');
console.log('db.messages.find({sender: ObjectId("user_id")}) - Check sent messages');
console.log('db.messages.find({recipient: ObjectId("user_id")}) - Check received messages');

// Test 6: API Endpoints to Test
console.log('\n6. API Endpoints to Test:');
console.log('GET /api/messages - Should return user messages');
console.log('POST /api/messages - Should create new message');
console.log('PUT /api/messages/:id/read - Should mark message as read');

console.log('\n=== Debug Test Complete ===');
console.log('Check the console logs in both frontend and backend to identify the issue.'); 