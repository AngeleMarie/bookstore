
import User from '../models/User.js'; 
import Book from '../models/Book.js';

const getStatistics = async (req, res) => {
  try {
    const totalUsers = await User.count({
      where: { role: 'client' }
    });

    const admin = await User.findOne({ where: { role: 'admin' } });

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const totalBooks = await Book.count();

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        adminBalance: admin.transactionBalance,  
        totalBooks,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export default { getStatistics };
