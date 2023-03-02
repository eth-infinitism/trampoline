// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

interface IEllipticCurve {
    function validateSignature(
        bytes32 message,
        uint256[2] memory rs,
        uint256[2] memory Q
    ) external pure returns (bool);
}
