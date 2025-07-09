// Test Script for Message Debugging
// This script helps identify issues with message sending between specific users

console.log('=== MESSAGE DEBUGGING TEST ===');

// Test Case: provider12@gmail.com sending message to vincenttwizere12@gmail.com

console.log('1. User Verification Steps:');
console.log('   - Verify provider12@gmail.com exists in database');
console.log('   - Verify vincenttwizere12@gmail.com exists in database');
console.log('   - Get their user IDs');

console.log('\n2. Database Queries to Run:');
console.log('   // Check if users exist');
console.log('   db.users.find({email: "provider12@gmail.com"})');
console.log('   db.users.find({email: "vincenttwizere12@gmail.com"})');

console.log('\n3. Message Verification:');
console.log('   // Check if any messages exist');
console.log('   db.messages.find({})');
console.log('   // Check messages sent by provider');
console.log('   db.messages.find({sender: ObjectId("PROVIDER_USER_ID")})');
console.log('   // Check messages received by refugee');
console.log('   db.messages.find({recipient: ObjectId("REFUGEE_USER_ID")})');

console.log('\n4. API Testing Steps:');
console.log('   1. Login as provider12@gmail.com');
console.log('   2. Send a message to vincenttwizere12@gmail.com');
console.log('   3. Check backend console for debug logs');
console.log('   4. Login as vincenttwizere12@gmail.com');
console.log('   5. Check refugee dashboard for messages');
console.log('   6. Check backend console for message retrieval logs');

console.log('\n5. Expected Debug Output:');
console.log('   When sending message:');
console.log('   === SEND MESSAGE DEBUG ===');
console.log('   Sender ID: [provider_user_id]');
console.log('   Sender email: provider12@gmail.com');
console.log('   Recipient ID: [refugee_user_id]');
console.log('   Recipient verified: { id: [refugee_user_id], email: "vincenttwizere12@gmail.com" }');
console.log('   Message saved successfully with ID: [message_id]');

console.log('\n   When retrieving messages:');
console.log('   === GET MESSAGES DEBUG ===');
console.log('   User ID requesting messages: [refugee_user_id]');
console.log('   User email: vincenttwizere12@gmail.com');
console.log('   Raw messages found: 1');
console.log('   Messages details: [{ sender: "Provider Name (provider12@gmail.com)", recipient: "Vincent Name (vincenttwizere12@gmail.com)" }]');

console.log('\n6. Common Issues:');
console.log('   ✓ User IDs don\'t match between sender and recipient');
console.log('   ✓ Messages not being saved to database');
console.log('   ✓ Wrong user ID being used in queries');
console.log('   ✓ Authentication issues');
console.log('   ✓ Database connection problems');

console.log('\n=== RUN THIS TEST AND SHARE THE CONSOLE OUTPUT ==='); 