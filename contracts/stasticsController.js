// import User from '../models/user.model.js'; // your User model
// import Book from '../models/book.model.js'; // your Book model
// import Web3 from 'web3';

// // Smart contract info
// const web3 = new Web3(process.env.RPC_URL); // Your testnet RPC URL, e.g. Infura or Alchemy
// const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS; // Store in .env file

// const getStatistics = async (req, res) => {
//   try {
//     // 1. Get total users
//     const totalUsers = await User.count();

//     // 2. Get admin balance
//     const balanceInWei = await web3.eth.getBalance(adminWalletAddress);
//     const balanceInEther = web3.utils.fromWei(balanceInWei, 'ether');

//     // 3. Get number of books
//     const totalBooks = await Book.count();

//     return res.status(200).json({
//       success: true,
//       data: {
//         totalUsers,
//         adminBalance: balanceInEther,
//         totalBooks,
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching statistics:', error);
//     return res.status(500).json({ success: false, message: 'Server Error' });
//   }
// };

// export default { getStatistics };