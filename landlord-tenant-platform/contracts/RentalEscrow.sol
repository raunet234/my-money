// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title RentalEscrow
 * @dev Smart contract for managing rental agreements with cryptocurrency payments and yield generation
 */
contract RentalEscrow is ReentrancyGuard, Ownable, Pausable {
    
    struct Agreement {
        uint256 id;
        address landlord;
        address tenant;
        address tokenAddress;
        uint256 rentAmount;
        uint256 securityDeposit;
        uint256 startDate;
        uint256 endDate;
        uint256 paymentDay; // Day of month (1-28)
        string propertyAddress;
        AgreementStatus status;
        uint256 totalYieldEarned;
        uint256 lastRentPayment;
        bytes32 agreementHash;
        mapping(address => bytes) signatures;
    }
    
    enum AgreementStatus {
        PendingTenantSignature,
        PendingLandlordSignature,
        Active,
        Completed,
        Disputed,
        Cancelled
    }
    
    // Events
    event AgreementCreated(
        uint256 indexed agreementId,
        address indexed landlord,
        address indexed tenant,
        uint256 rentAmount,
        uint256 securityDeposit
    );
    
    event AgreementSigned(
        uint256 indexed agreementId,
        address indexed signer,
        AgreementStatus newStatus
    );
    
    event SecurityDepositPaid(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 amount
    );
    
    event RentPaid(
        uint256 indexed agreementId,
        address indexed tenant,
        uint256 amount,
        uint256 rewardAmount
    );
    
    event YieldDistributed(
        uint256 indexed agreementId,
        address indexed landlord,
        uint256 amount
    );
    
    event AgreementCompleted(
        uint256 indexed agreementId,
        uint256 securityDepositReturned
    );
    
    // State variables
    uint256 private nextAgreementId;
    mapping(uint256 => Agreement) public agreements;
    mapping(address => uint256[]) public userAgreements;
    
    // Yield configuration
    uint256 public constant YIELD_APY = 450; // 4.5% APY (basis points)
    uint256 public constant TENANT_REWARD_RATE = 100; // 1% reward for on-time payments
    uint256 public constant LATE_PAYMENT_GRACE_DAYS = 5;
    
    // Fee configuration
    uint256 public platformFeeRate = 250; // 2.5% (basis points)
    address public feeCollector;
    
    constructor(address _feeCollector) {
        feeCollector = _feeCollector;
        nextAgreementId = 1;
    }
    
    /**
     * @dev Create a new rental agreement
     */
    function createAgreement(
        address _tenant,
        address _tokenAddress,
        uint256 _rentAmount,
        uint256 _securityDeposit,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _paymentDay,
        string memory _propertyAddress,
        bytes32 _agreementHash
    ) external whenNotPaused returns (uint256) {
        require(_tenant != address(0), "Invalid tenant address");
        require(_tenant != msg.sender, "Landlord cannot be tenant");
        require(_tokenAddress != address(0), "Invalid token address");
        require(_rentAmount > 0, "Rent amount must be positive");
        require(_securityDeposit > 0, "Security deposit must be positive");
        require(_startDate > block.timestamp, "Start date must be in future");
        require(_endDate > _startDate, "End date must be after start date");
        require(_paymentDay >= 1 && _paymentDay <= 28, "Invalid payment day");
        
        uint256 agreementId = nextAgreementId++;
        
        Agreement storage agreement = agreements[agreementId];
        agreement.id = agreementId;
        agreement.landlord = msg.sender;
        agreement.tenant = _tenant;
        agreement.tokenAddress = _tokenAddress;
        agreement.rentAmount = _rentAmount;
        agreement.securityDeposit = _securityDeposit;
        agreement.startDate = _startDate;
        agreement.endDate = _endDate;
        agreement.paymentDay = _paymentDay;
        agreement.propertyAddress = _propertyAddress;
        agreement.status = AgreementStatus.PendingTenantSignature;
        agreement.agreementHash = _agreementHash;
        
        userAgreements[msg.sender].push(agreementId);
        userAgreements[_tenant].push(agreementId);
        
        emit AgreementCreated(agreementId, msg.sender, _tenant, _rentAmount, _securityDeposit);
        
        return agreementId;
    }
    
    /**
     * @dev Tenant signs agreement and deposits security deposit
     */
    function signAgreementAndDeposit(
        uint256 _agreementId,
        bytes memory _signature
    ) external nonReentrant whenNotPaused {
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.tenant == msg.sender, "Only tenant can sign");
        require(agreement.status == AgreementStatus.PendingTenantSignature, "Invalid status");
        
        // Verify signature
        require(_verifySignature(agreement.agreementHash, _signature, msg.sender), "Invalid signature");
        
        // Transfer security deposit from tenant to contract
        IERC20 token = IERC20(agreement.tokenAddress);
        require(
            token.transferFrom(msg.sender, address(this), agreement.securityDeposit),
            "Security deposit transfer failed"
        );
        
        agreement.signatures[msg.sender] = _signature;
        agreement.status = AgreementStatus.PendingLandlordSignature;
        
        emit AgreementSigned(_agreementId, msg.sender, AgreementStatus.PendingLandlordSignature);
        emit SecurityDepositPaid(_agreementId, msg.sender, agreement.securityDeposit);
    }
    
    /**
     * @dev Landlord confirms and activates agreement
     */
    function confirmAgreement(
        uint256 _agreementId,
        bytes memory _signature
    ) external whenNotPaused {
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.landlord == msg.sender, "Only landlord can confirm");
        require(agreement.status == AgreementStatus.PendingLandlordSignature, "Invalid status");
        
        // Verify signature
        require(_verifySignature(agreement.agreementHash, _signature, msg.sender), "Invalid signature");
        
        agreement.signatures[msg.sender] = _signature;
        agreement.status = AgreementStatus.Active;
        
        emit AgreementSigned(_agreementId, msg.sender, AgreementStatus.Active);
    }
    
    /**
     * @dev Pay monthly rent
     */
    function payRent(uint256 _agreementId) external nonReentrant whenNotPaused {
        Agreement storage agreement = agreements[_agreementId];
        require(agreement.tenant == msg.sender, "Only tenant can pay rent");
        require(agreement.status == AgreementStatus.Active, "Agreement not active");
        require(block.timestamp >= agreement.startDate, "Lease not started");
        require(block.timestamp <= agreement.endDate, "Lease expired");
        
        // Calculate if payment is on time
        bool isOnTime = _isRentOnTime(_agreementId);
        uint256 rewardAmount = 0;
        
        if (isOnTime) {
            rewardAmount = (agreement.rentAmount * TENANT_REWARD_RATE) / 10000;
        }
        
        // Transfer rent from tenant to landlord
        IERC20 token = IERC20(agreement.tokenAddress);
        uint256 totalAmount = agreement.rentAmount + rewardAmount;
        
        require(
            token.transferFrom(msg.sender, agreement.landlord, agreement.rentAmount),
            "Rent payment failed"
        );
        
        // Pay reward to tenant if on time
        if (rewardAmount > 0) {
            require(
                token.transfer(msg.sender, rewardAmount),
                "Reward payment failed"
            );
        }
        
        agreement.lastRentPayment = block.timestamp;
        
        emit RentPaid(_agreementId, msg.sender, agreement.rentAmount, rewardAmount);
        
        // Distribute yield to landlord
        _distributeYield(_agreementId);
    }
    
    /**
     * @dev Complete agreement and return security deposit
     */
    function completeAgreement(
        uint256 _agreementId,
        uint256 _deductionAmount
    ) external nonReentrant whenNotPaused {
        Agreement storage agreement = agreements[_agreementId];
        require(
            agreement.landlord == msg.sender || agreement.tenant == msg.sender,
            "Only parties can complete agreement"
        );
        require(agreement.status == AgreementStatus.Active, "Agreement not active");
        require(block.timestamp > agreement.endDate, "Lease not expired");
        require(_deductionAmount <= agreement.securityDeposit, "Deduction exceeds deposit");
        
        uint256 returnAmount = agreement.securityDeposit - _deductionAmount;
        
        IERC20 token = IERC20(agreement.tokenAddress);
        
        // Return remaining deposit to tenant
        if (returnAmount > 0) {
            require(token.transfer(agreement.tenant, returnAmount), "Deposit return failed");
        }
        
        // Transfer deduction to landlord
        if (_deductionAmount > 0) {
            require(token.transfer(agreement.landlord, _deductionAmount), "Deduction transfer failed");
        }
        
        agreement.status = AgreementStatus.Completed;
        
        emit AgreementCompleted(_agreementId, returnAmount);
    }
    
    /**
     * @dev Internal function to distribute yield
     */
    function _distributeYield(uint256 _agreementId) internal {
        Agreement storage agreement = agreements[_agreementId];
        
        // Calculate yield based on time and APY
        uint256 timeSinceStart = block.timestamp - agreement.startDate;
        uint256 yieldAmount = (agreement.securityDeposit * YIELD_APY * timeSinceStart) / 
                             (365 days * 10000);
        
        if (yieldAmount > 0) {
            // In a real implementation, this would come from DeFi protocols
            // For now, we'll track it and pay from contract balance
            agreement.totalYieldEarned += yieldAmount;
            
            IERC20 token = IERC20(agreement.tokenAddress);
            if (token.balanceOf(address(this)) >= yieldAmount) {
                require(token.transfer(agreement.landlord, yieldAmount), "Yield transfer failed");
                emit YieldDistributed(_agreementId, agreement.landlord, yieldAmount);
            }
        }
    }
    
    /**
     * @dev Check if rent payment is on time
     */
    function _isRentOnTime(uint256 _agreementId) internal view returns (bool) {
        Agreement storage agreement = agreements[_agreementId];
        
        // Calculate the due date for current month
        uint256 currentTime = block.timestamp;
        uint256 currentMonth = _getMonth(currentTime);
        uint256 currentYear = _getYear(currentTime);
        
        uint256 dueDate = _calculateDueDate(currentYear, currentMonth, agreement.paymentDay);
        
        return currentTime <= (dueDate + (LATE_PAYMENT_GRACE_DAYS * 1 days));
    }
    
    /**
     * @dev Verify signature
     */
    function _verifySignature(
        bytes32 _hash,
        bytes memory _signature,
        address _signer
    ) internal pure returns (bool) {
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
        );
        
        return _recover(ethSignedMessageHash, _signature) == _signer;
    }
    
    /**
     * @dev Recover signer from signature
     */
    function _recover(bytes32 _hash, bytes memory _signature) internal pure returns (address) {
        if (_signature.length != 65) {
            return address(0);
        }
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
        
        if (v < 27) {
            v += 27;
        }
        
        if (v != 27 && v != 28) {
            return address(0);
        }
        
        return ecrecover(_hash, v, r, s);
    }
    
    // Helper functions for date calculations
    function _getYear(uint256 timestamp) internal pure returns (uint256) {
        // Simplified year calculation - in production use a proper datetime library
        return 1970 + (timestamp / 365 days);
    }
    
    function _getMonth(uint256 timestamp) internal pure returns (uint256) {
        // Simplified month calculation - in production use a proper datetime library
        return ((timestamp / 30 days) % 12) + 1;
    }
    
    function _calculateDueDate(uint256 year, uint256 month, uint256 day) internal pure returns (uint256) {
        // Simplified due date calculation - in production use a proper datetime library
        return (year - 1970) * 365 days + (month - 1) * 30 days + (day - 1) * 1 days;
    }
    
    // View functions
    function getAgreement(uint256 _agreementId) external view returns (
        uint256 id,
        address landlord,
        address tenant,
        address tokenAddress,
        uint256 rentAmount,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate,
        uint256 paymentDay,
        string memory propertyAddress,
        AgreementStatus status,
        uint256 totalYieldEarned,
        uint256 lastRentPayment
    ) {
        Agreement storage agreement = agreements[_agreementId];
        return (
            agreement.id,
            agreement.landlord,
            agreement.tenant,
            agreement.tokenAddress,
            agreement.rentAmount,
            agreement.securityDeposit,
            agreement.startDate,
            agreement.endDate,
            agreement.paymentDay,
            agreement.propertyAddress,
            agreement.status,
            agreement.totalYieldEarned,
            agreement.lastRentPayment
        );
    }
    
    function getUserAgreements(address _user) external view returns (uint256[] memory) {
        return userAgreements[_user];
    }
    
    // Admin functions
    function setPlatformFeeRate(uint256 _feeRate) external onlyOwner {
        require(_feeRate <= 1000, "Fee rate too high"); // Max 10%
        platformFeeRate = _feeRate;
    }
    
    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector");
        feeCollector = _feeCollector;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency functions
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}