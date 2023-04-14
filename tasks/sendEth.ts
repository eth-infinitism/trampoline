task('sendETH', 'Send ETH')
  .addPositionalParam('to')
  .addPositionalParam('value')
  .setAction(async (args) => {
    const [signer] = await ethers.getSigners();
    await signer.sendTransaction({
      to: args.to,
      value: ethers.utils.parseEther(args.value),
    });

    console.log('After Balance: %s', await ethers.provider.getBalance(args.to));
  });
