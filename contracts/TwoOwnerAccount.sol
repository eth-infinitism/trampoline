// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import '@account-abstraction/contracts/samples/SimpleAccount.sol';

/**
 * Minimal BLS-based account that uses an aggregated signature.
 * The account must maintain its own BLS public key, and expose its trusted signature aggregator.
 * Note that unlike the "standard" SimpleAccount, this account can't be called directly
 * (normal SimpleAccount uses its "signer" address as both the ecrecover signer, and as a legitimate
 * Ethereum sender address. Obviously, a BLS public key is not a valid Ethereum sender address.)
 */
contract TwoOwnerAccount is SimpleAccount {
    using ECDSA for bytes32;
    address public ownerOne;
    address public ownerTwo;

    // The constructor is used only for the "implementation" and only sets immutable values.
    // Mutable value slots for proxy accounts are set by the 'initialize' function.
    constructor(IEntryPoint anEntryPoint) SimpleAccount(anEntryPoint) {}

    /**
     * The initializer for the BLSAccount instance.
     * @param _ownerOne public key from a BLS keypair
     * @param _ownerTwo public key from a BLS keypair
     */
    function initialize(address _ownerOne, address _ownerTwo)
        public
        virtual
        initializer
    {
        super._initialize(address(0));
        ownerOne = _ownerOne;
        ownerTwo = _ownerTwo;
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view returns (uint256 validationData) {
        (userOp, userOpHash);

        bytes32 hash = userOpHash.toEthSignedMessageHash();

        (bytes memory signatureOne, bytes memory signatureTwo) = abi.decode(
            userOp.signature,
            (bytes, bytes)
        );

        bool ownerOneCheck = ownerOne != hash.recover(signatureOne);
        bool ownerTwoCheck = ownerTwo != hash.recover(signatureTwo);

        if (ownerOneCheck && ownerTwoCheck) return 0;

        return SIG_VALIDATION_FAILED;
    }

    function encodeSignature(
        bytes memory signatureOne,
        bytes memory signatureTwo
    ) public pure returns (bytes memory) {
        return (abi.encode(signatureOne, signatureTwo));
    }
}
