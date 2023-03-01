// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import '@account-abstraction/contracts/samples/SimpleAccount.sol';
import './EllipticCurve.sol';
import './Base64.sol';
import 'hardhat/console.sol';

contract WebauthnAccount is SimpleAccount {
    using Base64 for string;

    address public ec;
    uint256[2] public q;
    bytes public authenticatorDataBytes;

    // The constructor is used only for the "implementation" and only sets immutable values.
    // Mutable value slots for proxy accounts are set by the 'initialize' function.
    constructor(IEntryPoint anEntryPoint) SimpleAccount(anEntryPoint) {}

    function initialize(
        address anEllipticCurve,
        uint256[2] memory _q,
        bytes memory _authenticatorDataBytes
    ) public virtual initializer {
        super._initialize(address(0));
        ec = anEllipticCurve;
        q = _q;
        authenticatorDataBytes = _authenticatorDataBytes;
    }

    function _getRSValues(bytes calldata signature)
        external
        pure
        returns (uint256 r, uint256 s)
    {
        r = uint256(bytes32(signature[0:32]));
        s = uint256(bytes32(signature[32:64]));
    }

    function _getRequestId(bytes calldata clientDataJSON)
        external
        pure
        returns (bytes memory requestIdFromClientDataJSON)
    {
        return clientDataJSON[40:];
    }

    /// implement template method of BaseWallet
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 requestId
    ) internal view virtual override returns (uint256 deadline) {
        (bytes memory signature, bytes memory clientDataJSON) = abi.decode(
            userOp.signature,
            (bytes, bytes)
        );

        (uint256 r, uint256 s) = this._getRSValues(signature);

        bytes memory base64EncodedRequestId = Base64.encode(requestId);

        console.logBytes32(requestId);
        console.logBytes(base64EncodedRequestId);

        bytes memory requestIdFromClientDataJSON = this._getRequestId(
            clientDataJSON
        );

        // TODO encodedBuffer = Buffer.from(base64url.encode(requestId)).toString('hex')
        // TODO Find the encodedBuffer in clientDataJSON, we need to ski
        // TODO Buffer.concat[authenticatorDataBytes, SHA256(clientDataJSON)]
        // TODO messageHash = '0x' + toHash(signatureBase).toString('hex');

        console.logBytes(requestIdFromClientDataJSON);
        require(EllipticCurve(ec).validateSignature(requestId, [r, s], q));
        return 0;
    }
}
