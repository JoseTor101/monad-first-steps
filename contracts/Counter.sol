// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Counter
/// @notice A tiny, beginner-friendly smart contract for a Monad hackathon.
/// @dev Stores a number on-chain. Anyone can read it for free, and anyone
///      can change it by sending a transaction (which costs a little gas).
contract Counter {
    // `count` is stored permanently on the blockchain.
    // `public` auto-generates a free getter function called count().
    uint256 public count;

    // Events are logs the blockchain emits. Frontends listen to them
    // to react to on-chain changes without constantly polling.
    event CountChanged(uint256 newCount, address changedBy);

    /// @notice Increase the counter by 1.
    function increment() external {
        count += 1;
        emit CountChanged(count, msg.sender);
    }

    /// @notice Decrease the counter by 1 (won't go below 0).
    function decrement() external {
        require(count > 0, "Counter: cannot go below zero");
        count -= 1;
        emit CountChanged(count, msg.sender);
    }

    /// @notice Set the counter to any specific value.
    /// @param newCount the value to store.
    function setCount(uint256 newCount) external {
        count = newCount;
        emit CountChanged(count, msg.sender);
    }
}
