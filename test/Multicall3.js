// import { Interface, JsonRpcProvider } from 'ethers'
const { ethers } = require("hardhat");
const { Interface, JsonRpcProvider, Signer, parseUnits } = require('ethers')

const Web3EthAbi = require('web3-eth-abi');
const { padLeft, web3 } = require('web3-utils');

const WTON_ABI = require("../abis/WTON.json");

// const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
// if (!MAINNET_RPC_URL) throw new Error('Please set the MAINNET_RPC_URL environment variable.');
const provider = new JsonRpcProvider("https://goerli.infura.io/v3/086aad6219cf436eb12e2ceae00e3b29");

describe("Multicall3", function () {
  let richAccount = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea";
  let testAccount

  let Multicall3
  let MultiCont

  let wtonContract

  let wtonAddress = "0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6";
  const ensRegistryInterface = new Interface(['function resolver(bytes32) view returns (address)']);
  const wtonInterface = new Interface(['function swapToTON(uint256) returns (bool)']);
  const wtonInterface2 = new Interface(['function balanceOf(address) view returns (uint256)']);
  const wtonInterface3 = new Interface(['function transferFrom(address,address,uint256) returns (bool)']);
  const wtonInterface4 = new Interface(['function transfer(address,uint256) returns (bool)']);
  // console.log(wtonInterface)
  let amount = 10000000
  let amount2 = parseUnits("1", 27);
  // let amount2 = BigNumber.from("1000000000000000000");
  let address = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea"
  let address2 = "0x195c1D13fC588C0b1Ca8A78dd5771E0eE5A2EAe4"
  const calldata1 = wtonInterface.encodeFunctionData('swapToTON', [amount2])
  console.log(calldata1)
  const calldata2 = wtonInterface2.encodeFunctionData('balanceOf', [address])
  console.log(calldata2)
  const calldata3 = wtonInterface3.encodeFunctionData('transferFrom', [address,address2,amount]);
  console.log(calldata3)
  const calldata4 = wtonInterface4.encodeFunctionData('transfer', [address2,amount2]);
  console.log(calldata4)

  const calls = [ 
    {
      target: wtonAddress,
      allowFailure: true, // We allow failure for all calls.
      callData: wtonInterface.encodeFunctionData('swapToTON', [amount]),
    }
  ]
  

  before("account setting",async () => {
    testAccount = await ethers.getSigner(richAccount)
    await ethers.provider.send("hardhat_impersonateAccount",[richAccount]);
    await ethers.provider.send("hardhat_setBalance", [
      richAccount,
      "0x8ac7230489e80000",
    ]);
})

  describe("Deployment", function () {
    it("Set the Mullticall3", async () => {
      Multicall3 = await ethers.getContractFactory("Multicall3");
      MultiCont = await Multicall3.deploy();
    })

    it("set wton", async () => {
      wtonContract = new ethers.Contract(wtonAddress, WTON_ABI.abi, provider );
    })
  });

  describe("Multicall Test", function () {
    it("multiCall WTON -> TON", async () => {
      let beforeWTON = await wtonContract.balanceOf(testAccount.address)
      await MultiCont.connect(testAccount).aggregate3(calls);
      let afterWTON = await wtonContract.balanceOf(testAccount.address)
      expect(afterWTON).to.be.gt(beforeWTON);
    })
  });
});
