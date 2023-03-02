// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import '@openzeppelin/contracts/utils/Create2.sol';
import '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol';

import './WebauthnAccount.sol';

contract WebauthnAccountFactory {
    WebauthnAccount public immutable accountImplementation;

    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new WebauthnAccount(_entryPoint);
    }

    /**
     * create an account, and return its address.
     * returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
     */
    function createAccount(
        address anEllipticCurve,
        uint256[2] memory _q,
        uint256 salt
    ) public returns (WebauthnAccount ret) {
        address addr = getAddress(anEllipticCurve, _q, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return WebauthnAccount(payable(addr));
        }
        ret = WebauthnAccount(
            payable(
                new ERC1967Proxy{salt: bytes32(salt)}(
                    address(accountImplementation),
                    abi.encodeCall(
                        WebauthnAccount.initialize,
                        (anEllipticCurve, _q)
                    )
                )
            )
        );
    }

    /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     */
    function getAddress(
        address anEllipticCurve,
        uint256[2] memory _q,
        uint256 salt
    ) public view returns (address) {
        return
            Create2.computeAddress(
                bytes32(salt),
                keccak256(
                    abi.encodePacked(
                        type(ERC1967Proxy).creationCode,
                        abi.encode(
                            address(accountImplementation),
                            abi.encodeCall(
                                WebauthnAccount.initialize,
                                (anEllipticCurve, _q)
                            )
                        )
                    )
                )
            );
    }
}
