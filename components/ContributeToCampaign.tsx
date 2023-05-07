import { fundABizAbi, mockErc20Abi, contractAddresses } from "../constants";
import { useEffect, useState } from "react";
import { BigNumber, ethers, ContractTransaction } from "ethers";
import type { NextPage } from "next";
import Image from "next/image";
import { Form, Button, useNotification } from "web3uikit";
import { useWeb3Contract, useMoralis } from "react-moralis";
import Link from "next/link";

interface contractAddressesInterface {
  [key: string]: { [key: string]: string[] };
}

export default function ContributeToCampaign() {
  const addresses: contractAddressesInterface = contractAddresses;
  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
  const chainId = chainIdHex ? parseInt(chainIdHex).toString() : "31337";
  console.log("chainId", chainId);
  const fundABizAddress =
    chainId in addresses ? addresses[chainId]["FundABusiness"][0] : null;

  const [allowedErc20TokenAddress, setAllowedErc20TokenAddress] = useState("");
  const [allowedErc20Symbol, setAllowedErc20Symbol] = useState("");
  const [campaignVerdict, setCampaignVerdict] = useState("");

  // @ts-ignore
  const { runContractFunction } = useWeb3Contract();
  const dispatch = useNotification();

  async function getAllowedTokenSymbol(): Promise<string | null> {
    const getErc20SymbolOptions = {
      abi: mockErc20Abi,
      contractAddress: allowedErc20TokenAddress,
      functionName: "symbol",
      params: {},
    };
    const returnedSymbol = (await runContractFunction({
      params: getErc20SymbolOptions,
      onError: (error) => console.log(error),
    })) as string;
    console.log("token symbol", returnedSymbol);
    if (returnedSymbol) {
      return returnedSymbol;
    }
    return null;
  }

  async function getCampaignState(): Promise<string | null> {
    const getCampaignStateOptions = {
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "verdict",
      params: {},
    };
    const returnedState = (await runContractFunction({
      params: getCampaignStateOptions,
      onError: (error) => console.log(error),
    })) as string;
    console.log("Verdict is", returnedState);
    if (returnedState) {
      return returnedState;
    }
    return null;
  }

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

  async function getAmountToContribute(
    tier: string,
    quantity: string
  ): Promise<number | null> {
    const getTierCostOptions = {
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "getTierPrice",
      params: {
        _tier: tier,
      },
    };
    const returnedCost = (await runContractFunction({
      params: getTierCostOptions,
      onError: (error) => console.log(error),
    })) as string;
    console.log("fundABizAddress", fundABizAddress);
    console.log("Tier cost is", returnedCost);
    if (returnedCost) {
      return Number(ethers.utils.formatEther(returnedCost)) * Number(quantity);
    }
    return null;
  }

  async function handleApproveSuccess(tier: number, quantity: number) {
    console.log("Ok... Now contributing for the campaign...");

    const options = {
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "contribute",
      params: {
        _tier: tier,
        _quantity: quantity,
      },
    };

    await runContractFunction({
      params: options,
      onSuccess: (tx) => handleContributeSuccess(tx),
      onError: (error) => console.log(error),
    });
  }

  const handleContributeSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Contribution received successfully",
      title: "Contribution Recieved - please refresh",
      position: "topR",
    });
  };
  const updateUI = async () => {
    setCampaignVerdict((await getCampaignState())!);
    setAllowedErc20TokenAddress((await getAllowedTokenAddress())!);
    setAllowedErc20Symbol((await getAllowedTokenSymbol())!);
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [account, isWeb3Enabled, chainId]);

  async function approveAndContribute(data: any) {
    console.log("Approving...");
    const tier = data.data[0].inputResult;
    const quantity = data.data[1].inputResult;

    const amountErc20InEth = await getAmountToContribute(tier, quantity);
    console.log(amountErc20InEth);
    const amountErc20InWei: BigNumber = ethers.utils.parseEther(
      amountErc20InEth!.toString()
    );

    const options = {
      abi: mockErc20Abi,
      contractAddress: allowedErc20TokenAddress!,
      functionName: "approve",
      params: {
        spender: fundABizAddress!,
        amount: amountErc20InWei,
      },
    };

    await runContractFunction({
      params: options,
      onSuccess: () => handleApproveSuccess(tier, quantity),
      onError: (error) => {
        console.log(error);
      },
    });
  }

  return (
    <div className="flex justify-between flex-row my-5">
      <div>
        {account ? (
          fundABizAddress ? (
            Number(campaignVerdict) > 1 ? (
              <div>
                <Form
                  onSubmit={approveAndContribute}
                  customFooter={
                    <Button
                      type="submit"
                      text="Contribute to Campaign"
                      color="blue"
                      bg-iconColor="blue"
                    />
                  }
                  data={[
                    {
                      name: "Funding Tier",
                      type: "number",
                      value: "",
                      key: "tier",
                    },
                    {
                      name: "Quantity",
                      type: "number",
                      value: "",
                      key: "quantity",
                    },
                  ]}
                  title="Contribute to Business-A Campaign"
                  id="Main Form"
                />
                <p className="pt-10">
                  Note: please ensure you have sufficient {allowedErc20Symbol}{" "}
                  token with address {allowedErc20TokenAddress} in your wallet.
                </p>
              </div>
            ) : Number(campaignVerdict) == 0 ? (
              <div
                className="bg-orange-100 border-l-4 border-green-500 text-green-700 p-4"
                role="alert"
              >
                <p className="font-bold">
                  Business-A funding round was successfully completed!
                </p>
                <p>
                  Thank you for participating. Please claim your Nft perks{" "}
                  <Link
                    href="/claim-reward"
                    className="text-blue-700 underline"
                  >
                    here.
                  </Link>
                </p>
              </div>
            ) : Number(campaignVerdict) == 1 ? (
              <div
                className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
                role="alert"
              >
                <p className="font-bold">Business-A Funding Round Failed!</p>
                <p>
                  Thank you for participating. Please claim your refund{" "}
                  <Link href="/claim-refund" className="text-red-700 underline">
                    here.
                  </Link>
                </p>
              </div>
            ) : (
              <p></p>
            )
          ) : (
            <div
              className="bg-orange-100 border-l-4 border-blue-500 text-blue-700 p-8"
              role="alert"
            >
              <p className="font-bold text-3xl pb-5">Unsupported Network!</p>
              <p>Please switch the network in your wallet!</p>
            </div>
          )
        ) : (
          <div className="bg-orange-100 border-l-4 border-blue-500 text-blue-600 p-20">
            <h1 className="font-bold text-3xl pb-5">
              Welcome to Decentralized Crowd-Funding!
            </h1>
            <h2 className="text-2xl">Please connect your wallet!</h2>
          </div>
        )}
      </div>
      <div className="items-right">
        <Image
          src="/crowdFundImageP.png"
          height="800"
          width="800"
          alt="crowdFundImageP"
        />
      </div>
    </div>
  );
}
