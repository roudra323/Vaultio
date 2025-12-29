import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { Vaultio, MockERC20 } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Vaultio", function () {
    let vaultio: Vaultio;
    let mockToken: MockERC20;
    let owner: HardhatEthersSigner;
    let user1: HardhatEthersSigner;
    let user2: HardhatEthersSigner;

    const TOKEN_AMOUNT = ethers.parseEther("1000");
    const LOCK_AMOUNT = ethers.parseEther("100");
    const LOCK_DURATION_MINUTES = 60; // 1 hour

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy mock ERC20 token with 18 decimals
        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        mockToken = await MockERC20Factory.deploy("Mock Token", "MTK", 18);
        await mockToken.waitForDeployment();

        // Deploy Vaultio
        const VaultioFactory = await ethers.getContractFactory("Vaultio");
        vaultio = await VaultioFactory.deploy();
        await vaultio.waitForDeployment();

        // Mint tokens to users
        await mockToken.mint(user1.address, TOKEN_AMOUNT);
        await mockToken.mint(user2.address, TOKEN_AMOUNT);
    });

    describe("Deployment", function () {
        it("should deploy successfully", async function () {
            expect(await vaultio.getAddress()).to.be.properAddress;
        });
    });

    describe("lockTokens", function () {
        beforeEach(async function () {
            // Approve tokens for locking
            await mockToken.connect(user1).approve(await vaultio.getAddress(), LOCK_AMOUNT);
        });

        it("should lock tokens successfully", async function () {
            const tx = await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                LOCK_DURATION_MINUTES
            );

            await expect(tx).to.emit(vaultio, "TokenLocked");

            // Check lock was created
            const lock = await vaultio.getLock(user1.address, 0);
            expect(lock.token).to.equal(await mockToken.getAddress());
            expect(lock.amount).to.equal(LOCK_AMOUNT);
            expect(lock.withdrawn).to.be.false;
        });

        it("should return correct lock ID", async function () {
            const lockId = await vaultio.connect(user1).lockTokens.staticCall(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                LOCK_DURATION_MINUTES
            );

            expect(lockId).to.equal(0n);
        });

        it("should transfer tokens to vault", async function () {
            const vaultioAddress = await vaultio.getAddress();
            const initialBalance = await mockToken.balanceOf(vaultioAddress);

            await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                LOCK_DURATION_MINUTES
            );

            const finalBalance = await mockToken.balanceOf(vaultioAddress);
            expect(finalBalance - initialBalance).to.equal(LOCK_AMOUNT);
        });

        it("should set correct unlock time", async function () {
            const tx = await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                LOCK_DURATION_MINUTES
            );

            const block = await ethers.provider.getBlock(tx.blockNumber!);
            const lock = await vaultio.getLock(user1.address, 0);

            const expectedUnlockTime = BigInt(block!.timestamp) + BigInt(LOCK_DURATION_MINUTES * 60);
            expect(lock.unlockTime).to.equal(expectedUnlockTime);
        });

        it("should revert with InvalidTokenAddress for zero address", async function () {
            await expect(
                vaultio.connect(user1).lockTokens(
                    ethers.ZeroAddress,
                    LOCK_AMOUNT,
                    LOCK_DURATION_MINUTES
                )
            ).to.be.revertedWithCustomError(vaultio, "InvalidTokenAddress");
        });

        it("should revert with InvalidAmount for zero amount", async function () {
            await expect(
                vaultio.connect(user1).lockTokens(
                    await mockToken.getAddress(),
                    0,
                    LOCK_DURATION_MINUTES
                )
            ).to.be.revertedWithCustomError(vaultio, "InvalidAmount");
        });

        it("should revert with InvalidDuration for zero duration", async function () {
            await expect(
                vaultio.connect(user1).lockTokens(
                    await mockToken.getAddress(),
                    LOCK_AMOUNT,
                    0
                )
            ).to.be.revertedWithCustomError(vaultio, "InvalidDuration");
        });

        it("should revert with InsufficientTokenBalance when user has no tokens", async function () {
            const newUser = (await ethers.getSigners())[3];
            await mockToken.connect(newUser).approve(await vaultio.getAddress(), LOCK_AMOUNT);

            await expect(
                vaultio.connect(newUser).lockTokens(
                    await mockToken.getAddress(),
                    LOCK_AMOUNT,
                    LOCK_DURATION_MINUTES
                )
            ).to.be.revertedWithCustomError(vaultio, "InsufficientTokenBalance");
        });

        it("should revert with InsufficientTokenAllowance when not approved", async function () {
            await expect(
                vaultio.connect(user2).lockTokens(
                    await mockToken.getAddress(),
                    LOCK_AMOUNT,
                    LOCK_DURATION_MINUTES
                )
            ).to.be.revertedWithCustomError(vaultio, "InsufficientTokenAllowance");
        });

        it("should create multiple locks for the same user", async function () {
            await mockToken.connect(user1).approve(await vaultio.getAddress(), LOCK_AMOUNT * 3n);

            await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                LOCK_DURATION_MINUTES
            );

            await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                LOCK_DURATION_MINUTES * 2
            );

            const lockCount = await vaultio.getUserLockCount(user1.address);
            expect(lockCount).to.equal(2n);
        });
    });

    describe("withdrawTokens", function () {
        beforeEach(async function () {
            await mockToken.connect(user1).approve(await vaultio.getAddress(), LOCK_AMOUNT);
            await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                LOCK_DURATION_MINUTES
            );
        });

        it("should withdraw tokens after lock period", async function () {
            // Fast forward time
            await time.increase(LOCK_DURATION_MINUTES * 60 + 1);

            const initialBalance = await mockToken.balanceOf(user1.address);

            const tx = await vaultio.connect(user1).withdrawTokens(0);

            await expect(tx).to.emit(vaultio, "TokenWithdrawn");

            const finalBalance = await mockToken.balanceOf(user1.address);
            expect(finalBalance - initialBalance).to.equal(LOCK_AMOUNT);
        });

        it("should mark lock as withdrawn", async function () {
            await time.increase(LOCK_DURATION_MINUTES * 60 + 1);

            await vaultio.connect(user1).withdrawTokens(0);

            const lock = await vaultio.getLock(user1.address, 0);
            expect(lock.withdrawn).to.be.true;
        });

        it("should revert with InvalidLockId for non-existent lock", async function () {
            await expect(
                vaultio.connect(user1).withdrawTokens(999)
            ).to.be.revertedWithCustomError(vaultio, "InvalidLockId");
        });

        it("should revert with TokensAlreadyWithdrawn when withdrawing twice", async function () {
            await time.increase(LOCK_DURATION_MINUTES * 60 + 1);

            await vaultio.connect(user1).withdrawTokens(0);

            await expect(
                vaultio.connect(user1).withdrawTokens(0)
            ).to.be.revertedWithCustomError(vaultio, "TokensAlreadyWithdrawn");
        });

        it("should revert with LockPeriodNotExpired before unlock time", async function () {
            await expect(
                vaultio.connect(user1).withdrawTokens(0)
            ).to.be.revertedWithCustomError(vaultio, "LockPeriodNotExpired");
        });

        it("should allow withdrawal at exact unlock time", async function () {
            await time.increase(LOCK_DURATION_MINUTES * 60);

            await expect(
                vaultio.connect(user1).withdrawTokens(0)
            ).to.not.be.reverted;
        });

        it("should not allow other users to withdraw", async function () {
            await time.increase(LOCK_DURATION_MINUTES * 60 + 1);

            // user2 trying to withdraw user1's lock (will revert as they have no locks)
            await expect(
                vaultio.connect(user2).withdrawTokens(0)
            ).to.be.revertedWithCustomError(vaultio, "InvalidLockId");
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await mockToken.connect(user1).approve(await vaultio.getAddress(), LOCK_AMOUNT * 2n);

            // Create two locks
            await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                LOCK_DURATION_MINUTES
            );

            await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                LOCK_DURATION_MINUTES * 2
            );
        });

        describe("getUserLocks", function () {
            it("should return all locks for a user", async function () {
                const locks = await vaultio.getUserLocks(user1.address);
                expect(locks.length).to.equal(2);
            });

            it("should return empty array for user with no locks", async function () {
                const locks = await vaultio.getUserLocks(user2.address);
                expect(locks.length).to.equal(0);
            });
        });

        describe("getLock", function () {
            it("should return correct lock details", async function () {
                const lock = await vaultio.getLock(user1.address, 0);
                expect(lock.token).to.equal(await mockToken.getAddress());
                expect(lock.amount).to.equal(LOCK_AMOUNT);
                expect(lock.withdrawn).to.be.false;
            });

            it("should revert with InvalidLockId for non-existent lock", async function () {
                await expect(
                    vaultio.getLock(user1.address, 999)
                ).to.be.revertedWithCustomError(vaultio, "InvalidLockId");
            });
        });

        describe("getUserLockCount", function () {
            it("should return correct lock count", async function () {
                const count = await vaultio.getUserLockCount(user1.address);
                expect(count).to.equal(2n);
            });

            it("should return 0 for user with no locks", async function () {
                const count = await vaultio.getUserLockCount(user2.address);
                expect(count).to.equal(0n);
            });
        });

        describe("isWithdrawable", function () {
            it("should return false before unlock time", async function () {
                const isWithdrawable = await vaultio.isWithdrawable(user1.address, 0);
                expect(isWithdrawable).to.be.false;
            });

            it("should return true after unlock time", async function () {
                await time.increase(LOCK_DURATION_MINUTES * 60 + 1);

                const isWithdrawable = await vaultio.isWithdrawable(user1.address, 0);
                expect(isWithdrawable).to.be.true;
            });

            it("should return false for withdrawn lock", async function () {
                await time.increase(LOCK_DURATION_MINUTES * 60 + 1);
                await vaultio.connect(user1).withdrawTokens(0);

                const isWithdrawable = await vaultio.isWithdrawable(user1.address, 0);
                expect(isWithdrawable).to.be.false;
            });

            it("should return false for non-existent lock", async function () {
                const isWithdrawable = await vaultio.isWithdrawable(user1.address, 999);
                expect(isWithdrawable).to.be.false;
            });
        });
    });

    describe("Multiple Users", function () {
        it("should handle locks from multiple users independently", async function () {
            await mockToken.connect(user1).approve(await vaultio.getAddress(), LOCK_AMOUNT);
            await mockToken.connect(user2).approve(await vaultio.getAddress(), LOCK_AMOUNT);

            await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                LOCK_DURATION_MINUTES
            );

            await vaultio.connect(user2).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                LOCK_DURATION_MINUTES * 2
            );

            expect(await vaultio.getUserLockCount(user1.address)).to.equal(1n);
            expect(await vaultio.getUserLockCount(user2.address)).to.equal(1n);

            // Fast forward past user1's unlock time but before user2's
            await time.increase(LOCK_DURATION_MINUTES * 60 + 1);

            expect(await vaultio.isWithdrawable(user1.address, 0)).to.be.true;
            expect(await vaultio.isWithdrawable(user2.address, 0)).to.be.false;
        });
    });

    describe("Edge Cases", function () {
        it("should handle very small lock amounts", async function () {
            const smallAmount = 1n;
            await mockToken.mint(user1.address, smallAmount);
            await mockToken.connect(user1).approve(await vaultio.getAddress(), smallAmount);

            await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                smallAmount,
                LOCK_DURATION_MINUTES
            );

            const lock = await vaultio.getLock(user1.address, 0);
            expect(lock.amount).to.equal(smallAmount);
        });

        it("should handle very long lock durations", async function () {
            await mockToken.connect(user1).approve(await vaultio.getAddress(), LOCK_AMOUNT);

            const longDuration = 525600; // 1 year in minutes

            await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                longDuration
            );

            const lock = await vaultio.getLock(user1.address, 0);
            expect(lock.unlockTime - lock.startTime).to.equal(BigInt(longDuration * 60));
        });

        it("should handle very short lock durations (1 minute)", async function () {
            await mockToken.connect(user1).approve(await vaultio.getAddress(), LOCK_AMOUNT);

            await vaultio.connect(user1).lockTokens(
                await mockToken.getAddress(),
                LOCK_AMOUNT,
                1
            );

            await time.increase(61);

            await expect(
                vaultio.connect(user1).withdrawTokens(0)
            ).to.not.be.reverted;
        });
    });
});
