const { sequelize } = require('./config/database');

async function insertSampleLogs() {
  try {
    console.log('🔧 Inserting sample accommodation and events data for user 7...');

    // Sample accommodation logs
    const accommodationLogs = [
      {
        user_id: 7,
        trip_id: 48,
        log_type: 'AccommodationCheckIn',
        log_item_id: '1', // Accommodation vendor ID
        trip_check_date: '2025-10-14',
        scanned_at: '2025-10-14 20:00:00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 7,
        trip_id: 48,
        log_type: 'AccommodationCheckOut',
        log_item_id: '1',
        trip_check_date: '2025-10-15',
        scanned_at: '2025-10-15 08:00:00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 7,
        trip_id: 48,
        log_type: 'AccommodationCheckIn',
        log_item_id: '2', // Different accommodation vendor
        trip_check_date: '2025-10-15',
        scanned_at: '2025-10-15 20:30:00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 7,
        trip_id: 48,
        log_type: 'AccommodationCheckOut',
        log_item_id: '2',
        trip_check_date: '2025-10-16',
        scanned_at: '2025-10-16 09:00:00',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Sample events logs
    const eventsLogs = [
      {
        user_id: 7,
        trip_id: 48,
        log_type: 'EventCheckIn',
        log_item_id: 'Temple Visit',
        trip_check_date: '2025-10-14',
        scanned_at: '2025-10-14 10:00:00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 7,
        trip_id: 48,
        log_type: 'EventCheckOut',
        log_item_id: 'Temple Visit',
        trip_check_date: '2025-10-14',
        scanned_at: '2025-10-14 12:00:00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 7,
        trip_id: 48,
        log_type: 'EventCheckIn',
        log_item_id: 'Prayer Ceremony',
        trip_check_date: '2025-10-15',
        scanned_at: '2025-10-15 18:00:00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 7,
        trip_id: 48,
        log_type: 'EventCheckOut',
        log_item_id: 'Prayer Ceremony',
        trip_check_date: '2025-10-15',
        scanned_at: '2025-10-15 20:00:00',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insert accommodation logs
    for (const log of accommodationLogs) {
      await sequelize.query(`
        INSERT INTO triplog (user_id, trip_id, log_type, log_item_id, trip_check_date, scanned_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          log.user_id,
          log.trip_id,
          log.log_type,
          log.log_item_id,
          log.trip_check_date,
          log.scanned_at,
          log.created_at,
          log.updated_at
        ]
      });
    }

    console.log('✅ Inserted accommodation logs');

    // Insert events logs
    for (const log of eventsLogs) {
      await sequelize.query(`
        INSERT INTO triplog (user_id, trip_id, log_type, log_item_id, trip_check_date, scanned_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          log.user_id,
          log.trip_id,
          log.log_type,
          log.log_item_id,
          log.trip_check_date,
          log.scanned_at,
          log.created_at,
          log.updated_at
        ]
      });
    }

    console.log('✅ Inserted events logs');

    // Verify the data
    const allLogs = await sequelize.query(`
      SELECT id, user_id, trip_id, log_type, log_item_id, trip_check_date, scanned_at
      FROM triplog 
      WHERE user_id = 7 AND trip_id = 48
      ORDER BY scanned_at ASC
    `);

    console.log('📊 Sample data inserted for user 7:');
    console.table(allLogs[0]);

    console.log('🎉 Sample accommodation and events data has been inserted!');

  } catch (error) {
    console.error('❌ Error inserting sample data:', error.message);
  } finally {
    await sequelize.close();
  }
}

insertSampleLogs();
