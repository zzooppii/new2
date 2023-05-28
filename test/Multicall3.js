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
  
  let l1TokenAddress = "0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00";
  let l2TokenAddress = "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2";
  let addressTo = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea"
  let TONAmount = parseUnits("1", 18);
  let l2Gas = "200000"
  let data = "0x00"

  const ensRegistryInterface = new Interface(['function resolver(bytes32) view returns (address)']);
  const wtonInterface = new Interface(['function swapToTON(uint256) returns (bool)']);
  const wtonInterface2 = new Interface(['function balanceOf(address) view returns (uint256)']);
  const wtonInterface3 = new Interface(['function transferFrom(address,address,uint256) returns (bool)']);
  const wtonInterface4 = new Interface(['function transfer(address,uint256) returns (bool)']);
  const brigeInterface = new Interface(['function depositERC20To(address,address,address,uint256,uint32,bytes)'])
  // console.log(wtonInterface)
  let amount = 10000000
  let amount2 = parseUnits("1", 27);
  // let amount2 = BigNumber.from("1000000000000000000");
  let address = "0xf0B595d10a92A5a9BC3fFeA7e79f5d266b6035Ea"
  let address2 = "0x195c1D13fC588C0b1Ca8A78dd5771E0eE5A2EAe4"
  let address3 = "0xcA11bde05977b3631167028862bE2a173976CA11" //multicall Address
  let address4 = "0x7377f3d0f64d7a54cf367193eb74a052ff8578fd" //L1 Deposit Target
  const calldata1 = wtonInterface.encodeFunctionData('swapToTON', [amount2])
  console.log(calldata1)
  console.log("--------------------")
  const calldata2 = wtonInterface2.encodeFunctionData('balanceOf', [address])
  console.log(calldata2)
  console.log("--------------------")
  const calldata3 = wtonInterface3.encodeFunctionData('transferFrom', [address,address3,amount2]);
  console.log(calldata3)
  console.log("--------------------")
  const calldata4 = wtonInterface4.encodeFunctionData('transfer', [address2,amount2]);
  console.log(calldata4)
  console.log("--------------------")
  const calldata5 = brigeInterface.encodeFunctionData('depositERC20To', [l1TokenAddress,l2TokenAddress,addressTo,TONAmount,l2Gas,data])
  console.log(calldata5)

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
