const mysql = require('mysql2/promise');
require('dotenv').config();

class VendorFeedbackInserter {
  constructor() {
    this.connection = null;
    this.dbName = process.env.DB_NAME || 'tirthyatra';
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 3306;
    this.user = process.env.DB_USER || 'root';
    this.password = process.env.DB_PASSWORD || '';
  }

  async connect() {
    try {
      // Try with empty password first
      this.connection = await mysql.createConnection({
        host: this.host,
        port: this.port,
        user: this.user,
        password: ''
      });
      console.log('✅ Connected to MySQL server');
    } catch (error) {
      console.log('❌ Failed with empty password, trying "root"...');
      try {
        // Try with 'root' password
        this.connection = await mysql.createConnection({
          host: this.host,
          port: this.port,
          user: this.user,
          password: 'root'
        });
        this.password = 'root';
        console.log('✅ Connected to MySQL server (password: root)');
      } catch (error2) {
        console.error('❌ Database connection error:', error2.message);
        throw error2;
      }
    }
  }

  async createDatabase() {
    try {
      await this.connection.query(`CREATE DATABASE IF NOT EXISTS ${this.dbName}`);
      console.log(`✅ Database '${this.dbName}' created or already exists`);
      
      // Close current connection and reconnect to specific database
      await this.connection.end();
      
      // Reconnect to the specific database
      this.connection = await mysql.createConnection({
        host: this.host,
        port: this.port,
        user: this.user,
        password: this.password,
        database: this.dbName
      });
      
      console.log(`✅ Connected to database '${this.dbName}'`);
    } catch (error) {
      console.error('Error creating database:', error.message);
      throw error;
    }
  }

  async insertVendorFeedback() {
    try {
      console.log('🚀 Inserting vendor feedback sample data...');

      // Sample vendor feedback data for trip ID 1
      const vendorFeedbacks = [
        // Transport Vendors (vendorid 1-3)
        {
          tripid: 1,
          userId: 4,
          ratings: 5,
          vendorid: 1,
          comment: "Excellent bus service, very comfortable seats and punctual driver. Highly recommended!",
          datetime: new Date('2025-01-15 08:30:00')
        },
        {
          tripid: 1,
          userId: 5,
          ratings: 4,
          vendorid: 1,
          comment: "Good service but could improve on cleanliness. Driver was very helpful.",
          datetime: new Date('2025-01-15 09:15:00')
        },
        {
          tripid: 1,
          userId: 6,
          ratings: 5,
          vendorid: 2,
          comment: "Outstanding transport service! Modern buses, professional staff, and excellent route planning.",
          datetime: new Date('2025-01-15 10:00:00')
        },
        {
          tripid: 1,
          userId: 7,
          ratings: 3,
          vendorid: 2,
          comment: "Average service. Bus was clean but driver was not very communicative.",
          datetime: new Date('2025-01-15 11:30:00')
        },
        {
          tripid: 1,
          userId: 4,
          ratings: 2,
          vendorid: 3,
          comment: "Poor service. Bus was old and uncomfortable. Driver was rude and unprofessional.",
          datetime: new Date('2025-01-15 12:00:00')
        },
        {
          tripid: 1,
          userId: 8,
          ratings: 4,
          vendorid: 3,
          comment: "Decent service overall. Bus was clean and on time, but could be more comfortable.",
          datetime: new Date('2025-01-15 13:15:00')
        },

        // Accommodation Vendors (vendorid 4-6)
        {
          tripid: 1,
          userId: 5,
          ratings: 5,
          vendorid: 4,
          comment: "Amazing hotel! Clean rooms, excellent food, and very helpful staff. Perfect location too.",
          datetime: new Date('2025-01-15 14:00:00')
        },
        {
          tripid: 1,
          userId: 6,
          ratings: 4,
          vendorid: 4,
          comment: "Great accommodation with good facilities. Food quality was excellent and staff was courteous.",
          datetime: new Date('2025-01-15 15:30:00')
        },
        {
          tripid: 1,
          userId: 7,
          ratings: 3,
          vendorid: 5,
          comment: "Average stay. Rooms were clean but food could be better. Staff was helpful though.",
          datetime: new Date('2025-01-15 16:00:00')
        },
        {
          tripid: 1,
          userId: 8,
          ratings: 2,
          vendorid: 5,
          comment: "Disappointing experience. Poor room maintenance and unhygienic conditions. Not recommended.",
          datetime: new Date('2025-01-15 17:00:00')
        },
        {
          tripid: 1,
          userId: 4,
          ratings: 5,
          vendorid: 6,
          comment: "Luxury experience! Beautiful rooms, world-class amenities, and exceptional service. Worth every penny!",
          datetime: new Date('2025-01-15 18:00:00')
        },
        {
          tripid: 1,
          userId: 9,
          ratings: 4,
          vendorid: 6,
          comment: "Very good luxury accommodation. Excellent facilities and professional staff. Highly recommended for special occasions.",
          datetime: new Date('2025-01-15 19:00:00')
        },

        // Event Vendors (vendorid 7-9)
        {
          tripid: 1,
          userId: 5,
          ratings: 5,
          vendorid: 7,
          comment: "Fantastic event management! Everything was perfectly organized and executed. Great cultural programs.",
          datetime: new Date('2025-01-15 20:00:00')
        },
        {
          tripid: 1,
          userId: 6,
          ratings: 4,
          vendorid: 7,
          comment: "Good event coordination. Programs were well-planned and engaging. Could improve on timing.",
          datetime: new Date('2025-01-15 21:00:00')
        },
        {
          tripid: 1,
          userId: 7,
          ratings: 3,
          vendorid: 8,
          comment: "Average event management. Some programs were good but overall coordination could be better.",
          datetime: new Date('2025-01-15 22:00:00')
        },
        {
          tripid: 1,
          userId: 8,
          ratings: 2,
          vendorid: 8,
          comment: "Poor event management. Programs were disorganized and staff was not helpful. Needs improvement.",
          datetime: new Date('2025-01-15 23:00:00')
        },
        {
          tripid: 1,
          userId: 9,
          ratings: 5,
          vendorid: 9,
          comment: "Exceptional event services! Professional team, creative programs, and excellent execution. Outstanding experience!",
          datetime: new Date('2025-01-16 08:00:00')
        },
        {
          tripid: 1,
          userId: 4,
          ratings: 4,
          vendorid: 9,
          comment: "Very good event management. Creative programs and good coordination. Recommended for future events.",
          datetime: new Date('2025-01-16 09:00:00')
        }
      ];

      // Insert vendor feedback data
      for (const feedback of vendorFeedbacks) {
        try {
          await this.connection.query(
            `INSERT INTO vendor_feedback (tripid, userId, ratings, vendorid, comment, datetime, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              feedback.tripid,
              feedback.userId,
              feedback.ratings,
              feedback.vendorid,
              feedback.comment,
              feedback.datetime
            ]
          );
          console.log(`✅ Inserted feedback for user ${feedback.userId}, vendor ${feedback.vendorid}, rating ${feedback.ratings}`);
        } catch (error) {
          if (error.message.includes('Duplicate entry')) {
            console.log(`⚠️  Skipping duplicate entry for user ${feedback.userId}, vendor ${feedback.vendorid}`);
            continue;
          } else {
            console.error(`❌ Error inserting feedback for user ${feedback.userId}, vendor ${feedback.vendorid}:`, error.message);
            throw error;
          }
        }
      }

      console.log('\n🎉 Vendor feedback sample data inserted successfully!');
      console.log(`📊 Total feedback entries: ${vendorFeedbacks.length}`);

      // Show summary
      const [transportCount] = await this.connection.query(
        'SELECT COUNT(*) as count FROM vendor_feedback WHERE tripid = 1 AND vendorid <= 3'
      );
      const [accommodationCount] = await this.connection.query(
        'SELECT COUNT(*) as count FROM vendor_feedback WHERE tripid = 1 AND vendorid > 3 AND vendorid <= 6'
      );
      const [eventCount] = await this.connection.query(
        'SELECT COUNT(*) as count FROM vendor_feedback WHERE tripid = 1 AND vendorid > 6'
      );

      console.log('\n📈 Summary:');
      console.log(`🚌 Transport Vendors: ${transportCount[0].count} feedback entries`);
      console.log(`🏨 Accommodation Vendors: ${accommodationCount[0].count} feedback entries`);
      console.log(`🎉 Event Vendors: ${eventCount[0].count} feedback entries`);

    } catch (error) {
      console.error('❌ Error inserting vendor feedback:', error.message);
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('Database connection closed');
    }
  }

  async run() {
    try {
      console.log('🚀 Starting vendor feedback data insertion...');
      await this.connect();
      await this.createDatabase();
      await this.insertVendorFeedback();
      console.log('✅ Vendor feedback data insertion completed successfully!');
    } catch (error) {
      console.error('❌ Vendor feedback insertion failed:', error.message);
      process.exit(1);
    } finally {
      await this.close();
    }
  }
}

// Run insertion if this file is executed directly
if (require.main === module) {
  const inserter = new VendorFeedbackInserter();
  inserter.run();
}

module.exports = VendorFeedbackInserter;
