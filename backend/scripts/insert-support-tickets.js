const { sequelize } = require('../config/database');
const SupportTicket = require('../models/SupportTicket');

const insertDummySupportTickets = async () => {
  try {
    console.log('Inserting dummy support tickets...');

    const dummyTickets = [
      {
        user_id: 2,
        trip_id: 1,
        subject: 'Bus AC not working',
        description: 'The air conditioning in the bus is not working properly. It gets very hot during the journey.',
        priority: 'high',
        status: 'open',
        assigned_to: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2,
        trip_id: 2,
        subject: 'Food quality issue',
        description: 'The food provided during the trip was not up to the expected quality. Some items were cold and tasteless.',
        priority: 'medium',
        status: 'in_progress',
        assigned_to: 1,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        user_id: 2,
        trip_id: 1,
        subject: 'Driver behavior complaint',
        description: 'The driver was driving recklessly and not following safety protocols. Please address this issue.',
        priority: 'high',
        status: 'closed',
        assigned_to: 1,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        user_id: 2,
        trip_id: 3,
        subject: 'Accommodation booking issue',
        description: 'The hotel room was not as per the booking confirmation. Room was smaller and facilities were different.',
        priority: 'medium',
        status: 'open',
        assigned_to: 1,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        user_id: 2,
        trip_id: 2,
        subject: 'Payment refund request',
        description: 'I need a refund for the trip as I had to cancel due to emergency. Please process the refund.',
        priority: 'high',
        status: 'in_progress',
        assigned_to: 1,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        user_id: 2,
        trip_id: 1,
        subject: 'Itinerary change request',
        description: 'Can we change the itinerary to include one more temple? Please let me know if this is possible.',
        priority: 'low',
        status: 'open',
        assigned_to: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2,
        trip_id: 3,
        subject: 'Group size mismatch',
        description: 'The group size mentioned in the booking was 20 but only 15 people are traveling. What about the remaining seats?',
        priority: 'medium',
        status: 'closed',
        assigned_to: 1,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        user_id: 2,
        trip_id: 2,
        subject: 'Emergency contact update',
        description: 'I need to update my emergency contact information for the upcoming trip.',
        priority: 'low',
        status: 'open',
        assigned_to: 1,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
      }
    ];

    // Clear existing support tickets first
    await SupportTicket.destroy({ where: {} });
    console.log('Cleared existing support tickets');

    // Insert dummy data
    for (const ticket of dummyTickets) {
      await SupportTicket.create(ticket);
    }

    console.log(`Successfully inserted ${dummyTickets.length} dummy support tickets`);
    
    // Display summary
    const statusCounts = await SupportTicket.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    console.log('\nSupport Ticket Status Summary:');
    statusCounts.forEach(item => {
      console.log(`${item.status}: ${item.count}`);
    });

    const priorityCounts = await SupportTicket.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['priority'],
      raw: true
    });

    console.log('\nSupport Ticket Priority Summary:');
    priorityCounts.forEach(item => {
      console.log(`${item.priority}: ${item.count}`);
    });

  } catch (error) {
    console.error('Error inserting dummy support tickets:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the script
insertDummySupportTickets();
