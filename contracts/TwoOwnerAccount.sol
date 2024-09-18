// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import '@account-abstraction/contracts/samples/SimpleAccount.sol';

contract TwoOwnerAccount is SimpleAccount {
    using ECDSA for bytes32;
    address public ownerOne;
    address public ownerTwo;

    constructor(IEntryPoint anEntryPoint) SimpleAccount(anEntryPoint) {}

    function initialize(
        address _ownerOne,
        address _ownerTwo
    ) public virtual initializer {
        super._initialize(address(0));
        ownerOne = _ownerOne;
        ownerTwo = _ownerTwo;
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view override returns (uint256 validationData) {
        (userOp, userOpHash);

        bytes32 hash = userOpHash.toEthSignedMessageHash();
        (bytes memory signatureOne, bytes memory signatureTwo) = abi.decode(
            userOp.signature,
            (bytes, bytes)
        );

        address recoverOne = hash.recover(signatureOne);
        address recoverTwo = hash.recover(signatureTwo);

        bool ownerOneCheck = recoverOne == ownerOne;
        bool ownerTwoCheck = recoverTwo == ownerTwo;

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
