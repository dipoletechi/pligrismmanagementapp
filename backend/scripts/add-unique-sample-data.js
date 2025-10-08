const { sequelize } = require('../config/database');
const { TransportVendor, Bus, Driver } = require('../models');

async function addUniqueSampleData() {
  try {
    console.log('Adding unique sample data...');
    
    // Create a sample transport vendor
    const vendor = await TransportVendor.create({
      title: 'Pilgrim Transport Co.',
      description: 'Premium transport services for religious journeys',
      address: 'Delhi, India',
      phone: '+91-9876543215',
      email: 'info@pilgrimtransport.com'
    });
    
    console.log('✓ Created sample vendor:', vendor.title);
    
    // Create sample buses for the vendor
    const bus1 = await Bus.create({
      title: 'Pilgrim Bus 1',
      rc_no: 'DL01-9999',
      model: 'Mercedes Benz',
      type: 'bus',
      no_of_sittings: 45,
      make_year: 2022,
      transport_vendor_id: vendor.id
    });
    
    const bus2 = await Bus.create({
      title: 'Pilgrim Traveller 1',
      rc_no: 'DL01-8888',
      model: 'Force Traveller',
      type: 'traveller',
      no_of_sittings: 15,
      make_year: 2023,
      transport_vendor_id: vendor.id
    });
    
    console.log('✓ Created sample buses for vendor');
    
    // Create sample drivers for the vendor
    const driver1 = await Driver.create({
      first_name: 'Amit',
      last_name: 'Sharma',
      phone_number: '+91-9876543216',
      driving_license_no: 'DL111111111',
      aadhar_no: '111111111111',
      transport_vendor_id: vendor.id
    });
    
    const driver2 = await Driver.create({
      first_name: 'Vikram',
      last_name: 'Gupta',
      phone_number: '+91-9876543217',
      driving_license_no: 'DL222222222',
      aadhar_no: '222222222222',
      transport_vendor_id: vendor.id
    });
    
    console.log('✓ Created sample drivers for vendor');
    
    console.log('✅ Unique sample data created successfully!');
    console.log('You can now test the vendor details with buses and drivers.');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
addUniqueSampleData();
