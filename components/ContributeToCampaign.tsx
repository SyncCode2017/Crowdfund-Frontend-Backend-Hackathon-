import { useWeb3Contract, useMoralis } from "react-moralis";
import { fundABizAbi, contractAddresses } from "../constants";
import { useEffect, useState } from "react";
import { BigNumber, ethers, ContractTransaction } from "ethers";
import { useNotification } from "web3uikit";

interface contractAddressesInterface {
  [key: string]: { [key: string]: string[] };
}
// { "31337": { FundABusiness: string[]; }; }
export default function ContributeToCampaign() {
  const addresses: contractAddressesInterface = contractAddresses;
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId: string = parseInt(chainIdHex!).toString();
  const fundABizAddress =
    chainId in addresses ? addresses[chainId]["FundABusiness"][0] : null;
  const { runContractFunction: contributeToCampaign } = useWeb3Contract({
    abi: fundABizAbi,
    contractAddress: fundABizAddress!,
    functionName: "contribute",
    // params: {_tier: tier, _quantity: quantity},
  });
  return <div>Hi from FundCampaign</div>;
}
