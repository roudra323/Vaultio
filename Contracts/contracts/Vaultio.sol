// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Vaultio
 * @dev Token locking vault with time-based withdrawals
 * @notice Users can lock ERC-20 tokens for a specified duration
 * @notice Uses SafeERC20 for secure token transfers and proper error handling
 * @notice Does not use ReentrancyGuard - protection via state updates before external calls
 */
contract Vaultio {
    using SafeERC20 for IERC20;

    // ============ Custom Errors ============

    error InvalidTokenAddress();
    error InvalidAmount();
    error InvalidDuration();
    error InsufficientTokenBalance();
    error InsufficientTokenAllowance();
    error InvalidLockId();
    error TokensAlreadyWithdrawn();
    error LockPeriodNotExpired();
    error CallerIsNotAnWalletAddress();

    // ============ Structs ============

    struct Lock {
        address token;
        uint256 amount;
        uint256 startTime;
        uint256 unlockTime;
        bool withdrawn;
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
     * @dev Uses SafeERC20 to handle non-standard ERC20 tokens properly
     */
    function lockTokens(
        address token,
        uint256 amount,
        uint256 durationInMinutes
    ) external returns (uint256 lockId) {
        // ============ Checks ============

        if (msg.sender.code.length != 0) revert CallerIsNotAnWalletAddress();
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

        // SafeERC20 will automatically revert if transfer fails
        // Handles tokens that don't return bool, return false, or revert
        tokenContract.safeTransferFrom(msg.sender, address(this), amount);

        emit TokenLocked(msg.sender, token, lockId, amount, unlockTime);

        return lockId;
    }

    /**
     * @notice Withdraw tokens from a specific lock
     * @param lockId The ID of the lock to withdraw from
     * @dev State is updated before external call (withdrawn = true) to prevent reentrancy
     * @dev SafeERC20.safeTransfer will revert if transfer fails for any reason
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

        IERC20(token).safeTransfer(msg.sender, amount);

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
}
