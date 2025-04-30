// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// contract BookStorePayment {
//     address public admin;

//     constructor(address _admin) {
//         admin = _admin;
//     }

//     // Pay for a book
//     function buyBook() public payable {
//         require(msg.value > 0, "Must send some Ether");

//         // Transfer Ether to Admin
//         payable(admin).transfer(msg.value);
//     }

//     // Allow admin to update their address if needed
//     function updateAdmin(address _newAdmin) public {
//         require(msg.sender == admin, "Only admin can update admin address");
//         admin = _newAdmin;
//     }
// }
