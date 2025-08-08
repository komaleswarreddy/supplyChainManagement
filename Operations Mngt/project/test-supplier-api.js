const axios = require('axios');

// Test data for supplier creation
const testSupplierData = {
  name: "Test Supplier Company",
  code: "SUP1234567890ABC",
  type: "MANUFACTURER",
  status: "DRAFT",
  taxId: "12-3456789",
  registrationNumber: "REG123456",
  website: "https://testsupplier.com",
  industry: "Electronics",
  description: "A test supplier for development",
  yearEstablished: 2020,
  annualRevenue: 1000000,
  employeeCount: 50,
  businessClassifications: ["SMALL_BUSINESS"],
  categories: ["Electronics", "Components"],
  paymentTerms: "Net 30",
  preferredCurrency: "USD",
  notes: "Test supplier created for development",
  addresses: [
    {
      type: "HEADQUARTERS",
      street: "123 Test Street",
      city: "Test City",
      state: "Test State",
      country: "Test Country",
      postalCode: "12345",
      isPrimary: true,
    }
  ],
  contacts: [
    {
      firstName: "John",
      lastName: "Doe",
      title: "Manager",
      email: "john.doe@testsupplier.com",
      phone: "+1-555-123-4567",
      isPrimary: true,
      department: "Sales",
    }
  ],
  bankInformation: {
    bankName: "Test Bank",
    accountName: "Test Supplier Company",
    accountNumber: "1234567890",
    routingNumber: "987654321",
    currency: "USD",
    swiftCode: "TESTUS33",
    iban: "US12345678901234567890",
  }
};

async function testSupplierCreation() {
  try {
    console.log('Testing supplier creation API...');
    
    // Test the API endpoint
    const response = await axios.post('http://localhost:3000/api/suppliers', testSupplierData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
        'X-Tenant-ID': 'tenant-1'
      }
    });
    
    console.log('✅ Supplier created successfully!');
    console.log('Response:', response.data);
    
    // Test getting the created supplier
    const supplierId = response.data.id;
    const getResponse = await axios.get(`http://localhost:3000/api/suppliers/${supplierId}`, {
      headers: {
        'Authorization': 'Bearer mock-token',
        'X-Tenant-ID': 'tenant-1'
      }
    });
    
    console.log('✅ Supplier retrieved successfully!');
    console.log('Retrieved supplier:', getResponse.data);
    
  } catch (error) {
    console.error('❌ Error testing supplier API:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Run the test
testSupplierCreation();
