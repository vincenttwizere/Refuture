import axios from 'axios';

const testProfileCreation = async () => {
  try {
    console.log('Testing profile creation...');
    
    const testData = new FormData();
    testData.append('option', 'student');
    testData.append('fullName', 'Test User');
    testData.append('age', '25');
    testData.append('gender', 'male');
    testData.append('nationality', 'Test Country');
    testData.append('currentLocation', 'Test City');
    testData.append('email', 'test@example.com');
    testData.append('skills', JSON.stringify(['JavaScript', 'React']));
    testData.append('language', JSON.stringify(['English', 'French']));
    testData.append('tags', JSON.stringify(['student', 'tech']));
    testData.append('education', JSON.stringify([]));
    testData.append('experience', JSON.stringify([]));
    testData.append('academicRecords', JSON.stringify([]));
    testData.append('portfolio', JSON.stringify([]));
    testData.append('highSchoolSubjects', 'Math, Science');
    testData.append('desiredField', 'Computer Science');
    
    const response = await axios.post('http://localhost:5001/api/profiles', testData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ Profile creation successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Profile creation failed:');
    console.error('Error:', error.response?.data || error.message);
  }
};

testProfileCreation(); 