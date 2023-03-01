// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import '@account-abstraction/contracts/samples/SimpleAccount.sol';
import './EllipticCurve.sol';

/**
 * Minimal BLS-based account that uses an aggregated signature.
 * The account must maintain its own BLS public key, and expose its trusted signature aggregator.
 * Note that unlike the "standard" SimpleAccount, this account can't be called directly
 * (normal SimpleAccount uses its "signer" address as both the ecrecover signer, and as a legitimate
 * Ethereum sender address. Obviously, a BLS public key is not a valid Ethereum sender address.)
 */
contract WebauthnAccount is SimpleAccount {
    address public ec;
    uint256[2] public q;

    // The constructor is used only for the "implementation" and only sets immutable values.
    // Mutable value slots for proxy accounts are set by the 'initialize' function.
    constructor(IEntryPoint anEntryPoint) SimpleAccount(anEntryPoint) {}

    /**
     * The initializer for the BLSAccount instance.
     */
    function initialize(address anEllipticCurve, uint256[2] memory _q)
        public
        virtual
        initializer
    {
        super._initialize(address(0));
        ec = anEllipticCurve;
        q = _q;
    }

    /// implement template method of BaseWallet
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 requestId
    ) internal view virtual override returns (uint256 deadline) {
        uint256 r = uint256(bytes32(userOp.signature[0:32]));
        uint256 s = uint256(bytes32(userOp.signature[32:64]));
        require(EllipticCurve(ec).validateSignature(requestId, [r, s], q));
        return 0;
    }
}
