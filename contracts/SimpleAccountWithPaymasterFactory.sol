// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;


import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "./SimpleAccountWithPaymaster.sol";

contract SimpleAccountWithPaymasterFactory {
    SimpleAccountWithPaymaster public immutable accountImplementation;

    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new SimpleAccountWithPaymaster(_entryPoint);
    }

    /**
     * create an account, and return its address.
     * returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
     */
    function createAccount(address owner,uint256 salt, address dest, uint256 value, bytes calldata func) public returns (SimpleAccountWithPaymaster ret) {
        address addr = getAddress(owner, salt, dest, value, func);
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return SimpleAccountWithPaymaster(payable(addr));
        }
        ret = SimpleAccountWithPaymaster(payable(new ERC1967Proxy{salt : bytes32(salt)}(
                address(accountImplementation),
                abi.encodeCall(SimpleAccountWithPaymaster.initialize, (owner, dest, value, func))
            )));
    }

    /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     */
    function getAddress(address owner,uint256 salt, address dest, uint256 value, bytes calldata func) public view returns (address) {
        return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
                type(ERC1967Proxy).creationCode,
                abi.encode(
                    address(accountImplementation),
                    abi.encodeCall(SimpleAccountWithPaymaster.initialize, (owner, dest,value, func))
                )
            )));
    }

}