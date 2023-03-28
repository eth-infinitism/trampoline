<p align="center">
<img src="https://github.com/scaling-eth-2023/.github/blob/623accd27ebbf04ef8b4df8715a84eedcff6c988/profile/fuchsia-banner-github.png"/>

`Fuchsia, wallet for community`

<p align="center">
Reward your members for personalizing their on-chain membership benefits using account abstraction

---

🖥️ Contract: <https://github.com/scaling-eth-2023/contracts>

🖥️ Frontend: <https://github.com/scaling-eth-2023/client>

💡 Live Site: <https://fuchsia-app.vercel.app/>

---

## Project Description

### What is Fushsia?

Fushsia Wallet aims to provide an `innovative payment experience` that offers users `on-chain benefits and rewards for their transactions`. By creating a membership payment system that utilizes blockchain technology --using Account Abstraction for customization, users can potentially receive discounts on gas fees and even pay gas with native tokens -- can be anything! Additionally, the ability to customize benefits based on membership tier could provide a `personalized experience for users while also allowing communities to set specific conditions for each tier`.

### Usecase

For example, 0xumiswap setting a paymaster contract is a great illustration of how this membership payment system could work. By setting different membership tiers based on transaction activity, users can receive different benefits based on their level of engagement with the community.

<p align="center">
<img src="https://github.com/scaling-eth-2023/.github/blob/main/profile/tier.png" width=400/>

For instance, when user decided to subscribe `0xumiswap gasgee discount tier system`. User will become Tier 3, which can get 30% gasfee discount benefit from `0xumiswap.swapAtoB` transactions.

After, when user make that transactions more than 10 times will be upgrade in to Tier 2, which can get 50% gasfee discount benefit from `0xumiswap.swapBtoA` transactions.

Then, membership contract still count user activity until `0xumiswap.swapBtoA` transactions are more than 5 times, level up to Tier 1. Users who reached Tier 1 will get 100% gasfee support.

### Summurize

Fushsia Wallet has the potential to provide a `unique payment experience that offers users and communities on-chain benefits and rewards`.

---

## User Flows (user = wallet user)

### Create Wallet

<p align="center">
<img src="https://github.com/scaling-eth-2023/.github/blob/main/profile/create-wallet.jpeg" width=400/>

- User enter password and create wallet
- (optional) User can set social recovery through email

### Join Membership

<p align="center">
<img src="https://github.com/scaling-eth-2023/.github/blob/main/profile/join-membership.jpeg" width=400/>

- Join membership button allows user to join membership
- User can see list of memberships in website or individual membership in protocol page itself

### Execute Transaction

<p align="center">
<img src="https://github.com/scaling-eth-2023/.github/blob/main/profile/execute-transaction.jpeg" width=400/>

- User do transactions or conditions about the specific membership requires (i.g. make more than 5 transactions, get NFT etc)
- If user's Fuchsia gets certain membership, they will get benefit from membership's community (i.g. get gas fee discount 30%, pay gas fee with $GOV token etc)

### Recover Wallet

<p align="center">
<img src="https://github.com/scaling-eth-2023/.github/blob/main/profile/recover-wallet.jpeg" width=400/>

- If user forgot private key or move the wallet into different browser, enter email used for social recovery, and can successfully change owner

---

## User Flows (user = community owner)

### Create Membership

<p align="center">
<img src="https://github.com/scaling-eth-2023/.github/blob/main/profile/create-membership.jpeg" width=400/>

- Create membership tiers. Each tier should contain conditions to become and benefits for them.
