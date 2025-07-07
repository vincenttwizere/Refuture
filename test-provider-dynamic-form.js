const puppeteer = require('puppeteer');

async function testProviderDynamicForm() {
  console.log('🧪 Testing Provider Dashboard Dynamic Form...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the application
    console.log('📱 Navigating to application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Check if we need to login
    const loginButton = await page.$('button:has-text("Login")');
    if (loginButton) {
      console.log('🔐 Logging in as provider...');
      await loginButton.click();
      await page.waitForTimeout(1000);
      
      // Fill login form
      await page.type('input[name="email"]', 'provider@test.com');
      await page.type('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Navigate to Provider Dashboard
    console.log('🏢 Navigating to Provider Dashboard...');
    const dashboardLink = await page.$('a[href="/provider-dashboard"]');
    if (dashboardLink) {
      await dashboardLink.click();
    } else {
      // Try to navigate directly
      await page.goto('http://localhost:5173/provider-dashboard', { waitUntil: 'networkidle0' });
    }
    await page.waitForTimeout(2000);
    
    // Click on Create Opportunity
    console.log('➕ Opening Create Opportunity form...');
    const createButton = await page.$('button:has-text("Create Opportunity")');
    if (createButton) {
      await createButton.click();
    } else {
      // Try clicking on the sidebar item
      const sidebarItem = await page.$('button:has-text("Create Opportunity")');
      if (sidebarItem) {
        await sidebarItem.click();
      }
    }
    await page.waitForTimeout(1000);
    
    // Test Job Opportunity Form
    console.log('💼 Testing Job Opportunity form...');
    await page.select('select[name="type"]', 'job');
    await page.waitForTimeout(500);
    
    // Check if job-specific fields appear
    const salaryFields = await page.$$('input[name="salary.min"], input[name="salary.max"]');
    const experienceField = await page.$('select[name="requirements.experience"]');
    const workArrangementField = await page.$('select[name="workArrangement"]');
    
    if (salaryFields.length >= 2 && experienceField && workArrangementField) {
      console.log('✅ Job-specific fields displayed correctly');
    } else {
      console.log('❌ Job-specific fields not found');
    }
    
    // Test Internship Form
    console.log('🎓 Testing Internship form...');
    await page.select('select[name="type"]', 'internship');
    await page.waitForTimeout(500);
    
    const stipendField = await page.$('input[name="stipend"]');
    const durationField = await page.$('select[name="internshipDuration"]');
    const learningObjectivesField = await page.$('textarea[name="learningObjectives"]');
    
    if (stipendField && durationField && learningObjectivesField) {
      console.log('✅ Internship-specific fields displayed correctly');
    } else {
      console.log('❌ Internship-specific fields not found');
    }
    
    // Test Scholarship Form
    console.log('🏆 Testing Scholarship form...');
    await page.select('select[name="type"]', 'scholarship');
    await page.waitForTimeout(500);
    
    const scholarshipAmountField = await page.$('input[name="scholarshipAmount"]');
    const scholarshipTypeField = await page.$('select[name="scholarshipType"]');
    const eligibilityField = await page.$('textarea[name="eligibilityCriteria"]');
    
    if (scholarshipAmountField && scholarshipTypeField && eligibilityField) {
      console.log('✅ Scholarship-specific fields displayed correctly');
    } else {
      console.log('❌ Scholarship-specific fields not found');
    }
    
    // Test Mentorship Form
    console.log('🤝 Testing Mentorship form...');
    await page.select('select[name="type"]', 'mentorship');
    await page.waitForTimeout(500);
    
    const mentorshipDurationField = await page.$('select[name="mentorshipDuration"]');
    const focusAreasField = await page.$('input[name="focusAreas"]');
    const mentorBackgroundField = await page.$('textarea[name="mentorBackground"]');
    
    if (mentorshipDurationField && focusAreasField && mentorBackgroundField) {
      console.log('✅ Mentorship-specific fields displayed correctly');
    } else {
      console.log('❌ Mentorship-specific fields not found');
    }
    
    // Test Funding Form
    console.log('💰 Testing Funding form...');
    await page.select('select[name="type"]', 'funding');
    await page.waitForTimeout(500);
    
    const fundingAmountField = await page.$('input[name="fundingAmount"]');
    const fundingTypeField = await page.$('select[name="fundingType"]');
    const projectDescriptionField = await page.$('textarea[name="projectDescription"]');
    
    if (fundingAmountField && fundingTypeField && projectDescriptionField) {
      console.log('✅ Funding-specific fields displayed correctly');
    } else {
      console.log('❌ Funding-specific fields not found');
    }
    
    // Test form submission with job data
    console.log('📝 Testing form submission with job data...');
    await page.select('select[name="type"]', 'job');
    await page.waitForTimeout(500);
    
    // Fill in required fields
    await page.type('input[name="title"]', 'Test Software Engineer Position');
    await page.type('textarea[name="description"]', 'This is a test job opportunity for software engineers.');
    await page.select('select[name="category"]', 'Technology');
    await page.type('input[name="location"]', 'San Francisco, CA');
    await page.type('input[name="salary.min"]', '80000');
    await page.type('input[name="salary.max"]', '120000');
    await page.select('select[name="requirements.experience"]', 'Mid Level');
    await page.type('input[name="applicationDeadline"]', '2024-12-31');
    
    console.log('✅ Form filled with job data successfully');
    
    // Test form validation
    console.log('🔍 Testing form validation...');
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      const isDisabled = await submitButton.evaluate(button => button.disabled);
      if (!isDisabled) {
        console.log('✅ Submit button is enabled with valid data');
      } else {
        console.log('❌ Submit button is disabled unexpectedly');
      }
    }
    
    console.log('🎉 Dynamic form test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testProviderDynamicForm().catch(console.error); 