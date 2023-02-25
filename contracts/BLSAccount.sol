// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import '@account-abstraction/contracts/samples/SimpleAccount.sol';
import './BLSHelper.sol';
import {BLSOpen} from './lib/BLSOpen.sol';

/**
 * Minimal BLS-based account that uses an aggregated signature.
 * The account must maintain its own BLS public key, and expose its trusted signature aggregator.
 * Note that unlike the "standard" SimpleAccount, this account can't be called directly
 * (normal SimpleAccount uses its "signer" address as both the ecrecover signer, and as a legitimate
 * Ethereum sender address. Obviously, a BLS public key is not a valid Ethereum sender address.)
 */
contract BLSAccount is SimpleAccount {
    uint256[4] private ownerOne;
    uint256[4] private ownerTwo;

    bytes32 public constant BLS_DOMAIN = keccak256('trampoline.blsaccount.com');

    // The constructor is used only for the "implementation" and only sets immutable values.
    // Mutable value slots for proxy accounts are set by the 'initialize' function.
    constructor(IEntryPoint anEntryPoint) SimpleAccount(anEntryPoint) {}

    /**
     * The initializer for the BLSAccount instance.
     * @param _ownerOne public key from a BLS keypair
     * @param _ownerTwo public key from a BLS keypair
     */
    function initialize(
        uint256[4] memory _ownerOne,
        uint256[4] memory _ownerTwo
    ) public virtual initializer {
        super._initialize(address(0));
        ownerOne = _ownerOne;
        ownerTwo = _ownerTwo;
    }

    function _userOpToMessage(UserOperation memory userOp)
        internal
        view
        returns (uint256[2] memory)
    {
        bytes32 userOpHash = _getUserOpHash(userOp);
        return BLSOpen.hashToPoint(BLS_DOMAIN, abi.encodePacked(userOpHash));
    }

    function _getUserOpHash(UserOperation memory userOp)
        internal
        view
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    internalUserOpHash(userOp),
                    ownerOne,
                    ownerTwo,
                    address(this),
                    block.chainid
                )
            );
    }

    /**
     * get a hash of userOp
     * NOTE: this hash is not the same as UserOperation.hash()
     *  (slightly less efficient, since it uses memory userOp)
     */
    function internalUserOpHash(UserOperation memory userOp)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    userOp.sender,
                    userOp.nonce,
                    keccak256(userOp.initCode),
                    keccak256(userOp.callData),
                    userOp.callGasLimit,
                    userOp.verificationGasLimit,
                    userOp.preVerificationGas,
                    userOp.maxFeePerGas,
                    userOp.maxPriorityFeePerGas,
                    keccak256(userOp.paymasterAndData)
                )
            );
    }

    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view returns (uint256 validationData) {
        (userOp, userOpHash);

        require(userOp.signature.length == 64, 'BLS: invalid signature');
        uint256[2] memory blsSignature = abi.decode(
            userOp.signature,
            (uint256[2])
        );

        uint256[4][] memory blsPublicKeys = new uint256[4][](2);
        uint256[2][] memory messages = new uint256[2][](2);

        blsPublicKeys[0] = ownerOne;
        blsPublicKeys[1] = ownerTwo;

        messages[0] = _userOpToMessage();
        messages[1] = _userOpToMessage();

        require(
            BLSOpen.verifyMultiple(blsSignature, blsPublicKeys, messages),
            'BLS: validateSignatures failed'
        );
        return 0;
    }

    /**
     * aggregate multiple signatures into a single value.
     * This method is called off-chain to calculate the signature to pass with handleOps()
     * bundler MAY use optimized custom code perform this aggregation
     * @param signatures array of signatures to collect the signatures from.
     * @return aggregatedSignature the aggregated signature
     */
    function aggregateSignatures(bytes[] calldata signatures)
        external
        pure
        returns (bytes memory aggregatedSignature)
    {
        BLSHelper.XY[] memory points = new BLSHelper.XY[](signatures.length);
        for (uint256 i = 0; i < points.length; i++) {
            (uint256 x, uint256 y) = abi.decode(
                signatures[i],
                (uint256, uint256)
            );
            points[i] = BLSHelper.XY(x, y);
        }
        BLSHelper.XY memory sum = BLSHelper.sum(points, N);
        return abi.encode(sum.x, sum.y);
    }
}
