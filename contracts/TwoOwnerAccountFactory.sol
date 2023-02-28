// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import '@openzeppelin/contracts/utils/Create2.sol';
import '@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol';

import './TwoOwnerAccount.sol';
import 'hardhat/console.sol';

contract TwoOwnerAccountFactory {
    TwoOwnerAccount public immutable accountImplementation;

    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new TwoOwnerAccount(_entryPoint);
    }

    /**
     * create an account, and return its address.
     * returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
     */
    function createAccount(
        address _ownerOne,
        address _ownerTwo,
        uint256 salt
    ) public returns (TwoOwnerAccount ret) {
        console.log('Lets see if we are here');
        address addr = getAddress(_ownerOne, _ownerTwo, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return TwoOwnerAccount(payable(addr));
        }
        ret = TwoOwnerAccount(
            payable(
                new ERC1967Proxy{salt: bytes32(salt)}(
                    address(accountImplementation),
                    abi.encodeCall(
                        TwoOwnerAccount.initialize,
                        (_ownerOne, _ownerTwo)
                    )
                )
            )
        );
        console.log('We deployed it?');
        console.logAddress(address(ret));
    }

    /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     */
    function getAddress(
        address _ownerOne,
        address _ownerTwo,
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
                                TwoOwnerAccount.initialize,
                                (_ownerOne, _ownerTwo)
                            )
                        )
                    )
                )
            );
    }
}
