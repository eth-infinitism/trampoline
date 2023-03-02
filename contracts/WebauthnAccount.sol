// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import '@account-abstraction/contracts/samples/SimpleAccount.sol';
import './IEllipticCurve.sol';
import './Base64.sol';
import 'hardhat/console.sol';

contract WebauthnAccount is SimpleAccount {
    address public ec;
    uint256[2] public q;

    // The constructor is used only for the "implementation" and only sets immutable values.
    // Mutable value slots for proxy accounts are set by the 'initialize' function.
    constructor(IEntryPoint anEntryPoint) SimpleAccount(anEntryPoint) {}

    function initialize(address anEllipticCurve, uint256[2] memory _q)
        public
        virtual
        initializer
    {
        super._initialize(address(0));
        ec = anEllipticCurve;
        q = _q;
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

    function concatBytes(bytes memory a, bytes memory b)
        public
        pure
        returns (bytes memory)
    {
        bytes memory result = new bytes(a.length + b.length);
        uint256 i;
        uint256 j;

        for (i = 0; i < a.length; i++) {
            result[j++] = a[i];
        }
        for (i = 0; i < b.length; i++) {
            result[j++] = b[i];
        }
        return result;
    }

    function toHex16(bytes16 data) internal pure returns (bytes32 result) {
        result =
            (bytes32(data) &
                0xFFFFFFFFFFFFFFFF000000000000000000000000000000000000000000000000) |
            ((bytes32(data) &
                0x0000000000000000FFFFFFFFFFFFFFFF00000000000000000000000000000000) >>
                64);
        result =
            (result &
                0xFFFFFFFF000000000000000000000000FFFFFFFF000000000000000000000000) |
            ((result &
                0x00000000FFFFFFFF000000000000000000000000FFFFFFFF0000000000000000) >>
                32);
        result =
            (result &
                0xFFFF000000000000FFFF000000000000FFFF000000000000FFFF000000000000) |
            ((result &
                0x0000FFFF000000000000FFFF000000000000FFFF000000000000FFFF00000000) >>
                16);
        result =
            (result &
                0xFF000000FF000000FF000000FF000000FF000000FF000000FF000000FF000000) |
            ((result &
                0x00FF000000FF000000FF000000FF000000FF000000FF000000FF000000FF0000) >>
                8);
        result =
            ((result &
                0xF000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000) >>
                4) |
            ((result &
                0x0F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F00) >>
                8);
        result = bytes32(
            0x3030303030303030303030303030303030303030303030303030303030303030 +
                uint256(result) +
                (((uint256(result) +
                    0x0606060606060606060606060606060606060606060606060606060606060606) >>
                    4) &
                    0x0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F) *
                7
        );
    }

    function toHex(bytes32 data) public pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '0x',
                    toHex16(bytes16(data)),
                    toHex16(bytes16(data << 128))
                )
            );
    }

    function lower(string memory _base) internal pure returns (string memory) {
        bytes memory _baseBytes = bytes(_base);
        for (uint256 i = 0; i < _baseBytes.length; i++) {
            _baseBytes[i] = _lower(_baseBytes[i]);
        }
        return string(_baseBytes);
    }

    function _lower(bytes1 _b1) private pure returns (bytes1) {
        if (_b1 >= 0x41 && _b1 <= 0x5A) {
            return bytes1(uint8(_b1) + 32);
        }

        return _b1;
    }

    function getRequestIdFromClientDataJSON(bytes calldata clientDataJSON)
        public
        pure
        returns (bytes calldata)
    {
        return clientDataJSON[36:124];
    }

    function compareBytes(bytes memory b1, bytes memory b2)
        public
        pure
        returns (bool)
    {
        if (b1.length != b2.length) {
            return false;
        }
        for (uint256 i = 0; i < b1.length; i++) {
            if (b1[i] != b2[i]) {
                return false;
            }
        }
        return true;
    }

    /// implement template method of BaseWallet
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 requestId
    ) internal view virtual override returns (uint256 deadline) {
        (
            bytes memory signature,
            bytes memory clientDataJSON,
            bytes memory authenticatorDataBytes
        ) = abi.decode(userOp.signature, (bytes, bytes, bytes));

        (uint256 r, uint256 s) = this._getRSValues(signature);

        string memory requestIdHex = lower(toHex(requestId));

        bytes memory base64RequestId = bytes(Base64.encode(requestIdHex));

        bytes memory base64RequestIdFromClientDataJSON = this
            .getRequestIdFromClientDataJSON(clientDataJSON);

        require(
            compareBytes(base64RequestId, base64RequestIdFromClientDataJSON)
        );

        bytes32 clientDataHash = sha256(clientDataJSON);

        bytes memory signatureBase = abi.encodePacked(
            authenticatorDataBytes,
            clientDataHash
        );

        bytes32 signatureBaseTohash = sha256(signatureBase);
        bool validSinature = IEllipticCurve(ec).validateSignature(
            signatureBaseTohash,
            [r, s],
            q
        );

        require(validSinature);
        return 0;
    }
}
