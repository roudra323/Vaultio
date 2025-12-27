// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Vaultio
 * @dev Token locking vault with time-based withdrawals
 * @notice Users can lock ERC-20 tokens for a specified duration
 * @notice Does not use ReentrancyGuard - protection via state updates before external calls
 */
contract Vaultio {
    // ============ Custom Errors ============

    error InvalidTokenAddress();
    error InvalidAmount();
    error InvalidDuration();
    error InsufficientTokenBalance();
    error InsufficientTokenAllowance();
    error TokenTransferFailed();
    error InvalidLockId();
    error TokensAlreadyWithdrawn();
    error LockPeriodNotExpired();

    // ============ Structs ============

    struct Lock {
        address token; // ERC-20 token address
        uint256 amount; // Locked token amount
        uint256 startTime; // Block timestamp when locked
        uint256 unlockTime; // Block timestamp when withdrawable
        bool withdrawn; // Whether tokens have been withdrawn
    }

    // ============ State Variables ============

    // Mapping: user address => array of their locks
    mapping(address => Lock[]) private userLocks;

    // ============ Events ============

    event TokenLocked(
        address indexed user,
        address indexed token,
        uint256 indexed lockId,
        uint256 amount,
        uint256 unlockTime
    );

    event TokenWithdrawn(
        address indexed user,
        address indexed token,
        uint256 indexed lockId,
        uint256 amount
    );

    // ============ Main Functions ============

    /**
     * @notice Lock ERC-20 tokens for a specified duration
     * @param token The address of the ERC-20 token to lock
     * @param amount The amount of tokens to lock
     * @param durationInMinutes Lock duration in minutes
     * @return lockId The ID of the created lock
     * @dev This contract does not use ReentrancyGuard because:
     *      1. The withdrawn flag is set to true before any external token transfers
     *      2. All state changes follow the Checks-Effects-Interactions pattern
     *      3. The require(!lock.withdrawn) check prevents reentrancy attacks
     */
    function lockTokens(
        address token,
        uint256 amount,
        uint256 durationInMinutes
    ) external returns (uint256 lockId) {
        // ============ Checks ============
        if (token == address(0)) revert InvalidTokenAddress();
        if (amount == 0) revert InvalidAmount();
        if (durationInMinutes == 0) revert InvalidDuration();

        IERC20 tokenContract = IERC20(token);

        // Verify user has sufficient balance
        if (tokenContract.balanceOf(msg.sender) < amount) {
            revert InsufficientTokenBalance();
        }

        // Verify user has approved sufficient allowance
        if (tokenContract.allowance(msg.sender, address(this)) < amount) {
            revert InsufficientTokenAllowance();
        }

        // ============ Effects ============

        uint256 unlockTime = block.timestamp + (durationInMinutes * 60);

        // Create new lock
        Lock memory newLock = Lock({
            token: token,
            amount: amount,
            startTime: block.timestamp,
            unlockTime: unlockTime,
            withdrawn: false
        });

        // Store lock and get its ID
        userLocks[msg.sender].push(newLock);
        lockId = userLocks[msg.sender].length - 1;

        // ============ Interactions ============

        // Transfer tokens from user to this contract
        bool success = tokenContract.transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (!success) revert TokenTransferFailed();

        emit TokenLocked(msg.sender, token, lockId, amount, unlockTime);

        return lockId;
    }

    /**
     * @notice Withdraw tokens from a specific lock
     * @param lockId The ID of the lock to withdraw from
     * @dev State is updated before external call (withdrawn = true) to prevent reentrancy
     */
    function withdrawTokens(uint256 lockId) external {
        // ============ Checks ============
        if (lockId >= userLocks[msg.sender].length) revert InvalidLockId();

        Lock storage lock = userLocks[msg.sender][lockId];

        if (lock.withdrawn) revert TokensAlreadyWithdrawn();
        if (block.timestamp < lock.unlockTime) revert LockPeriodNotExpired();

        // ============ Effects ============

        // Mark as withdrawn BEFORE transferring (reentrancy protection)
        lock.withdrawn = true;

        uint256 amount = lock.amount;
        address token = lock.token;

        // ============ Interactions ============

        // Transfer tokens back to user
        bool success = IERC20(token).transfer(msg.sender, amount);
        if (!success) revert TokenTransferFailed();

        emit TokenWithdrawn(msg.sender, token, lockId, amount);
    }

    // ============ View Functions ============

    /**
     * @notice Get all locks for a specific user
     * @param user The address of the user
     * @return Array of all locks for the user
     */
    function getUserLocks(address user) external view returns (Lock[] memory) {
        return userLocks[user];
    }

    /**
     * @notice Get a specific lock for a user
     * @param user The address of the user
     * @param lockId The ID of the lock
     * @return The lock details
     */
    function getLock(
        address user,
        uint256 lockId
    ) external view returns (Lock memory) {
        if (lockId >= userLocks[user].length) revert InvalidLockId();
        return userLocks[user][lockId];
    }

    /**
     * @notice Get the number of locks for a user
     * @param user The address of the user
     * @return The number of locks
     */
    function getUserLockCount(address user) external view returns (uint256) {
        return userLocks[user].length;
    }

    /**
     * @notice Check if a lock is withdrawable
     * @param user The address of the user
     * @param lockId The ID of the lock
     * @return True if withdrawable, false otherwise
     */
    function isWithdrawable(
        address user,
        uint256 lockId
    ) external view returns (bool) {
        if (lockId >= userLocks[user].length) {
            return false;
        }

        Lock memory lock = userLocks[user][lockId];
        return !lock.withdrawn && block.timestamp >= lock.unlockTime;
    }

    /**
     * @notice Get time remaining until unlock (0 if already unlocked)
     * @param user The address of the user
     * @param lockId The ID of the lock
     * @return Seconds remaining until unlock
     */
    function getTimeUntilUnlock(
        address user,
        uint256 lockId
    ) external view returns (uint256) {
        if (lockId >= userLocks[user].length) revert InvalidLockId();

        Lock memory lock = userLocks[user][lockId];

        if (block.timestamp >= lock.unlockTime) {
            return 0;
        }

        return lock.unlockTime - block.timestamp;
    }
}
