const axios = require('axios');

async function testFeedbackAPI() {
  try {
    console.log('Testing feedback API...');
    
    // Test without token
    try {
      const response = await axios.get('http://localhost:5000/api/feedback');
      console.log('✅ API accessible without token:', response.data);
    } catch (error) {
      console.log('❌ API error without token:', error.response?.status, error.response?.data);
    }
    
    // Test with dummy token
    try {
      const response = await axios.get('http://localhost:5000/api/feedback', {
        headers: {
          'Authorization': 'Bearer dummy-token'
        }
      });
      console.log('✅ API accessible with dummy token:', response.data);
    } catch (error) {
      console.log('❌ API error with dummy token:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFeedbackAPI();
