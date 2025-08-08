import axios from 'axios';

async function testSupplierAPI() {
  try {
    console.log('Testing supplier API...');
    
    const response = await axios.post('http://localhost:3000/api/suppliers', {
      name: 'Test Supplier',
      code: 'TEST001',
      type: 'MANUFACTURER',
      taxId: '123456789',
      registrationNumber: 'REG123',
      categories: ['Electronics'],
      addresses: [{
        type: 'HEADQUARTERS',
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        country: 'USA',
        postalCode: '12345',
        isPrimary: true
      }],
      contacts: [{
        firstName: 'John',
        lastName: 'Doe',
        title: 'Manager',
        email: 'john@test.com',
        phone: '1234567890',
        isPrimary: true
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': '550e8400-e29b-41d4-a716-446655440001'
      }
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testSupplierAPI();
