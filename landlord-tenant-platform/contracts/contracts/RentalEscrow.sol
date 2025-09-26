// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract RentalEscrow is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    enum AgreementStatus {
        PendingTenant,
        PendingLandlord,
        Active,
        Completed,
        Cancelled
    }

    struct Agreement {
        uint256 id;
        address landlord;
        address tenant;
        address token; // PYUSD or USDF
        uint256 rentAmount;
        uint256 securityDeposit;
        uint256 startDate;
        uint256 endDate;
        uint256 paymentDay; // optional: day of month for rent
        AgreementStatus status;
        uint256 lastRentPayment;
        uint256 totalYieldEarned;
    }

    uint256 public nextAgreementId;
    mapping(uint256 => Agreement) public agreements;

    // Yield & reward
    uint256 public constant YIELD_APY_BPS = 450; // 4.5%
    uint256 public constant TENANT_REWARD_BPS = 100; // 1% reward for on-time rent

    // Platform fee
    uint256 public platformFeeBps = 250; // 2.5%
    address public feeCollector;

    // Events
    event AgreementCreated(uint256 indexed id, address landlord, address tenant, uint256 rent, uint256 deposit);
    event AgreementSigned(uint256 indexed id, address signer, AgreementStatus status);
    event RentPaid(uint256 indexed id, uint256 amount, uint256 reward, uint256 fee);
    event SecurityReleased(uint256 indexed id, uint256 amount);
    event AgreementCompleted(uint256 indexed id);

    constructor(address _feeCollector) Ownable(msg.sender) {
        require(_feeCollector != address(0), "Invalid fee collector");
        feeCollector = _feeCollector;
        nextAgreementId = 1;
    }

    // ------------------
    // Agreement Flow
    // ------------------

    function createAgreement(
        address _tenant,
        address _token,
        uint256 _rentAmount,
        uint256 _securityDeposit,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _paymentDay
    ) external whenNotPaused returns (uint256) {
        require(_tenant != address(0), "Invalid tenant");
        require(_token != address(0), "Invalid token");
        require(_startDate < _endDate, "Invalid dates");
        require(_paymentDay >= 1 && _paymentDay <= 28, "Invalid payment day");

        uint256 agreementId = nextAgreementId++;
        agreements[agreementId] = Agreement({
            id: agreementId,
            landlord: msg.sender,
            tenant: _tenant,
            token: _token,
            rentAmount: _rentAmount,
            securityDeposit: _securityDeposit,
            startDate: _startDate,
            endDate: _endDate,
            paymentDay: _paymentDay,
            status: AgreementStatus.PendingTenant,
            lastRentPayment: 0,
            totalYieldEarned: 0
        });

        emit AgreementCreated(agreementId, msg.sender, _tenant, _rentAmount, _securityDeposit);
        return agreementId;
    }

    function signAgreementAndDeposit(uint256 _id) external nonReentrant whenNotPaused {
        Agreement storage agreement = agreements[_id];
        require(msg.sender == agreement.tenant, "Only tenant");
        require(agreement.status == AgreementStatus.PendingTenant, "Invalid status");

        // transfer security deposit from tenant
        IERC20(agreement.token).safeTransferFrom(msg.sender, address(this), agreement.securityDeposit);

        agreement.status = AgreementStatus.PendingLandlord;

        emit AgreementSigned(_id, msg.sender, agreement.status);
    }

    function landlordConfirm(uint256 _id) external whenNotPaused {
        Agreement storage agreement = agreements[_id];
        require(msg.sender == agreement.landlord, "Only landlord");
        require(agreement.status == AgreementStatus.PendingLandlord, "Invalid status");

        agreement.status = AgreementStatus.Active;

        emit AgreementSigned(_id, msg.sender, agreement.status);
    }

    // ------------------
    // Rent Payment
    // ------------------

    function payRent(uint256 _id) external nonReentrant whenNotPaused {
        Agreement storage agreement = agreements[_id];
        require(agreement.status == AgreementStatus.Active, "Agreement not active");
        require(msg.sender == agreement.tenant, "Only tenant");

        IERC20 token = IERC20(agreement.token);

        uint256 fee = (agreement.rentAmount * platformFeeBps) / 10000;
        uint256 landlordAmount = agreement.rentAmount - fee;
        uint256 reward = (agreement.rentAmount * TENANT_REWARD_BPS) / 10000;

        // pay landlord
        token.safeTransferFrom(msg.sender, agreement.landlord, landlordAmount);

        // platform fee
        if(fee > 0){
            token.safeTransferFrom(msg.sender, feeCollector, fee);
        }

        // tenant reward
        if(reward > 0){
            token.safeTransferFrom(agreement.landlord, msg.sender, reward);
        }

        agreement.lastRentPayment = block.timestamp;

        emit RentPaid(_id, landlordAmount, reward, fee);
    }

    // ------------------
    // Security Release
    // ------------------

    function releaseSecurity(uint256 _id) external nonReentrant {
        Agreement storage agreement = agreements[_id];
        require(agreement.status == AgreementStatus.Active, "Not active");
        require(block.timestamp >= agreement.endDate, "Lease not ended");

        IERC20 token = IERC20(agreement.token);

        token.safeTransfer(agreement.tenant, agreement.securityDeposit);

        agreement.status = AgreementStatus.Completed;

        emit SecurityReleased(_id, agreement.securityDeposit);
        emit AgreementCompleted(_id);
    }

    // ------------------
    // Admin
    // ------------------

    function setPlatformFee(uint256 _bps) external onlyOwner {
        require(_bps <= 1000, "Max 10%");
        platformFeeBps = _bps;
    }

    function setFeeCollector(address _addr) external onlyOwner {
        require(_addr != address(0), "Invalid address");
        feeCollector = _addr;
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}
