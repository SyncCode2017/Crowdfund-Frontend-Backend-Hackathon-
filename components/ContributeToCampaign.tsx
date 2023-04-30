import { fundABizAbi, mockErc20Abi, contractAddresses } from "../constants";
import { useEffect, useState } from "react";
import { BigNumber, ethers, ContractTransaction } from "ethers";
import type { NextPage } from "next";
import { Form, Button, useNotification } from "web3uikit";
import { useWeb3Contract, useMoralis } from "react-moralis";

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

  async function getAllowedTokenSymbol(): Promise<void> {
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
    if (returnedSymbol) {
      setAllowedErc20Symbol(returnedSymbol);
    }
  }

  async function getCampaignState(): Promise<void> {
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
      setCampaignVerdict(returnedState);
    }
  }

  async function getAllowedTokenAddress(): Promise<void> {
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
      setAllowedErc20TokenAddress(returnedAddress);
    }
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
      onSuccess: () => handleContributeSuccess(),
      onError: (error) => console.log(error),
    });
  }

  const handleContributeSuccess = async () => {
    // await tx.wait();
    dispatch({
      type: "success",
      message: "Contribution received successfully",
      title: "Contribution Recieved - please refresh",
      position: "topR",
    });
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      getCampaignState();
      getAllowedTokenAddress();
      getAllowedTokenSymbol();
    }
  }, [account, isWeb3Enabled, chainId]);

  async function approveAndContribute(data: any) {
    console.log("Approving...");
    const tier = data.data[0].inputResult;
    const quantity = data.data[1].inputResult;

    // const allowedErc20Address = await getAllowedTokenAddress();
    console.log(allowedErc20TokenAddress);

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
    <div>
      {fundABizAddress ? (
        campaignVerdict == "2" ? (
          <div>
            <Form
              onSubmit={approveAndContribute}
              buttonConfig={{
                isLoading: false,
                type: "submit",
                theme: "primary",
                text: "Contribute to Campaign",
              }}
              data={[
                // {
                //   inputWidth: "50%",
                //   name: "NFT Address",
                //   type: "text",
                //   value: "",
                //   key: "nftAddress",
                // },
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
            <p tw="text-[40px]">
              Note: please ensure you have sufficient {allowedErc20Symbol} token
              with address {allowedErc20TokenAddress} in your wallet.
            </p>
          </div>
        ) : (
          <p>Campaign has ended.</p>
        )
      ) : (
        <p>Unsupported network. Please switch the network in your wallet!</p>
      )}
    </div>
  );
}
