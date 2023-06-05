import { fundABizAbi, contractAddresses } from "../constants";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
// import type { NextPage } from "next";
import { Button, useNotification } from "web3uikit";
import { useWeb3Contract, useMoralis } from "react-moralis";

interface contractAddressesInterface {
  [key: string]: { [key: string]: string[] };
}

export default function BusinessWithdrawal() {
  const addresses: contractAddressesInterface = contractAddresses;
  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
  const chainId = chainIdHex ? parseInt(chainIdHex).toString() : "31337";

  // @ts-ignore
  const { runContractFunction } = useWeb3Contract();
  const dispatch = useNotification();

  console.log("chainId", chainId);
  const fundABizAddress =
    chainId in addresses ? addresses[chainId]["FundABusiness"][0] : null;

  const [isBusinessAddress, setIsBusinessAddress] = useState("");
  const [businessBalance, setBusinessBalance] = useState("");
  // const [allowedErc20Symbol, setAllowedErc20Symbol] = useState("");
  // const [allowedErc20TokenAddress, setAllowedErc20TokenAddress] = useState("");

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [account, isWeb3Enabled, chainId]);

  const updateUI = async () => {
    setIsBusinessAddress((await getBusinessAccess())!);
    setBusinessBalance((await getBusinessBalance())!);
    // setAllowedErc20TokenAddress((await getAllowedTokenAddress())!);
    // setAllowedErc20Symbol((await getAllowedTokenSymbol())!);
    console.log("is it the business address ", isBusinessAddress);
  };

  const handleWithdrawReleasedFundSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Funds withdrawn successfully",
      title: "Funds Withdrawal",
      position: "topR",
    });
    setBusinessBalance("");
  };

  const { runContractFunction: withdrawReleasedFundInContract } =
    useWeb3Contract({
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "withdrawFundRaised",
      params: {},
    });

  const withdrawReleasedFund = async () => {
    await withdrawReleasedFundInContract({
      onSuccess: (tx) => handleWithdrawReleasedFundSuccess(tx),
      onError: (error) => console.log(error),
    });
  };

  const getBusinessBalance = async (): Promise<string | null> => {
    const getBusinessBalanceOptions = {
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "getBusinessBalance",
      params: {},
    };

    const businessBalanceInWei = (await runContractFunction({
      params: getBusinessBalanceOptions,
      onError: (error) => console.log(error),
    })) as string;

    const businessBalanceInEth = ethers.utils.formatEther(businessBalanceInWei);
    console.log("businessBalance is", businessBalanceInEth);
    console.log("connected account is", account);
    if (businessBalanceInEth) {
      return businessBalanceInEth;
    }
    return null;
  };

  async function getAllowedTokenAddress(): Promise<string | null> {
    const getErc20TokenOptions = {
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "allowedErc20Token",
      params: {},
    };
    const returnedAddress = (await runContractFunction({
      params: getErc20TokenOptions,
      onError: (error) => console.log(error),
    })) as string;
    if (returnedAddress) {
      return returnedAddress;
    }
    return null;
  }

  // async function getAllowedTokenSymbol(): Promise<string | null> {
  //   const getErc20SymbolOptions = {
  //     abi: mockErc20Abi,
  //     contractAddress: allowedErc20TokenAddress,
  //     functionName: "symbol",
  //     params: {},
  //   };
  //   const returnedSymbol = (await runContractFunction({
  //     params: getErc20SymbolOptions,
  //     onError: (error) => console.log(error),
  //   })) as string;
  //   console.log("token symbol", returnedSymbol);
  //   if (returnedSymbol) {
  //     return returnedSymbol;
  //   }
  //   return null;
  // }

  const getBusinessAccess = async (): Promise<string | null> => {
    const getBusinessAddressOptions = {
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "businessAddress",
      params: {},
    };

    const businessAddress = (
      (await runContractFunction({
        params: getBusinessAddressOptions,
        onError: (error) => console.log(error),
      })) as string
    ).toLowerCase();
    console.log("businessAddress is", businessAddress);
    console.log("connected account is", account);
    if (account == businessAddress) {
      return "true";
    }
    return null;
  };

  return (
    <div>
      {fundABizAddress ? (
        isBusinessAddress ? (
          <div className="flex flex-col m-10">
            <div
              className="bg-orange-100 border-l-4 border-black-500 text-black-700 p-4"
              role="alert"
            >
              <h2>Available balance is {businessBalance} ETH tokens</h2>
            </div>
            <div className="p-5">
              {Number(businessBalance) > 0 ? (
                <Button
                  id="withdraw-fund"
                  onClick={withdrawReleasedFund}
                  text="Withdraw Fund"
                  theme="colored"
                  color="blue"
                  type="button"
                />
              ) : (
                <p></p>
              )}
            </div>
          </div>
        ) : (
          <div
            className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
            role="alert"
          >
            <p className="font-bold">Not Business-A!</p>
            <p>Only Business-A is allowed on this page.</p>
          </div>
        )
      ) : (
        <div
          className="bg-orange-100 border-l-4 border-blue-500 text-blue-700 p-4"
          role="alert"
        >
          <p className="font-bold">Unsupported Network!</p>
          <p>Please switch the network in your wallet.</p>
        </div>
      )}
    </div>
  );
}
