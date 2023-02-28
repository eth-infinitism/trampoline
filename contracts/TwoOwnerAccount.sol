// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import '@account-abstraction/contracts/samples/SimpleAccount.sol';
import 'hardhat/console.sol';

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

    function external_validateSignature(
        bytes memory signature,
        bytes32 userOpHash
    ) external view returns (uint256 validationData) {
        (signature, userOpHash);
        console.log('HERE');

        bytes32 hash = userOpHash.toEthSignedMessageHash();

        console.logBytes32(userOpHash);
        console.logBytes32(hash);

        (bytes memory signatureOne, bytes memory signatureTwo) = abi.decode(
            signature,
            (bytes, bytes)
        );

        address recoveryOne = hash.recover(signatureOne);
        address recoveryTwo = hash.recover(signatureTwo);

        console.logAddress(recoveryOne);
        console.logAddress(recoveryTwo);

        bool ownerOneCheck = ownerOne == recoveryOne;
        bool ownerTwoCheck = ownerTwo == recoveryTwo;

        if (ownerOneCheck && ownerTwoCheck) return 0;

        return SIG_VALIDATION_FAILED;
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view returns (uint256 validationData) {
        return 0;
        (userOp, userOpHash);
        console.log('HERE');

        bytes32 hash = userOpHash.toEthSignedMessageHash();

        console.logBytes32(userOpHash);
        console.logBytes32(hash);

        (bytes memory signatureOne, bytes memory signatureTwo) = abi.decode(
            userOp.signature,
            (bytes, bytes)
        );

        address recoveryOne = hash.recover(signatureOne);
        address recoveryTwo = hash.recover(signatureTwo);

        console.logAddress(recoveryOne);
        console.logAddress(recoveryTwo);

        bool ownerOneCheck = ownerOne == recoveryOne;
        bool ownerTwoCheck = ownerTwo == recoveryTwo;

        if (ownerOneCheck && ownerTwoCheck) return 0;

        return 0;
    }

    function encodeSignature(
        bytes memory signatureOne,
        bytes memory signatureTwo
    ) public pure returns (bytes memory) {
        return (abi.encode(signatureOne, signatureTwo));
    }
}
