import { fundABizAbi, mockErc20Abi, contractAddresses } from "../constants";
import { useEffect, useState } from "react";
import { BigNumber, ethers, ContractTransaction } from "ethers";
import type { NextPage } from "next";
import { Form, Input, Button, useNotification } from "web3uikit";
import { useWeb3Contract, useMoralis } from "react-moralis";

interface contractAddressesInterface {
  [key: string]: { [key: string]: string[] };
}

export default function ClaimReward() {
  const addresses: contractAddressesInterface = contractAddresses;
  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
  const chainId = chainIdHex ? parseInt(chainIdHex).toString() : "31337";

  // @ts-ignore
  const { runContractFunction } = useWeb3Contract();
  const dispatch = useNotification();

  console.log("chainId", chainId);
  const fundABizAddress =
    chainId in addresses ? addresses[chainId]["FundABusiness"][0] : null;

  const [tierPerkToClaim, setTierPerkToClaim] = useState("");
  const [campaignVerdict, setCampaignVerdict] = useState("");
  const [areNftSetInContract, setAreNftSetInContract] = useState("");

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [account, isWeb3Enabled, chainId]);

  const updateUI = async () => {
    setCampaignVerdict((await getCampaignState())!);
    setAreNftSetInContract((await getFundABizNftState())!);
    console.log("areNftSetInContract", areNftSetInContract);
  };

  const handleClaimNftPerksSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Nft perks claimed successfully",
      title: "NFT Perks Claiming",
      position: "topR",
    });
    setTierPerkToClaim("");
  };

  const { runContractFunction: claimNftPerkInContract } = useWeb3Contract({
    abi: fundABizAbi,
    contractAddress: fundABizAddress!,
    functionName: "claimNft",
    params: { _tier: tierPerkToClaim },
  });

  const claimNftPerk = async () => {
    await claimNftPerkInContract({
      onSuccess: (tx) => handleClaimNftPerksSuccess(tx),
      onError: (error) => console.log(error),
    });
  };

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
  const getFundABizNftState = async (): Promise<string | null> => {
    const options = {
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "areNftTokensSet",
      params: {},
    };

    const areNftsSet = (await runContractFunction({
      params: options,
      onError: (error) => console.log(error),
    })) as string;

    console.log("areNftsSet", areNftsSet);
    if (Boolean(areNftsSet) === true) {
      return areNftsSet;
    }

    return null;
  };

  return (
    <div>
      {fundABizAddress ? (
        Number(campaignVerdict) === 0 ? (
          Boolean(areNftSetInContract) ? (
            <div className="flex flex-col m-10">
              <div className="flex flex-row m-5">
                <div className="mr-4">
                  <Input
                    label="Enter tier number to claim"
                    name="Tier Perk Number"
                    onChange={(event) => {
                      setTierPerkToClaim(event.target.value);
                    }}
                    type="number"
                  />
                </div>
                <div>
                  {tierPerkToClaim ? (
                    <Button
                      id="claim-nft-perks"
                      onClick={claimNftPerk}
                      text="Claim NFT Tier Perks"
                      theme="colored"
                      color="blue"
                      type="button"
                    />
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
              role="alert"
            >
              <p className="font-bold">Page Unavailable!</p>
              <p>Sorry, the NFT perks are not ready distribution.</p>
            </div>
          )
        ) : (
          <div
            className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
            role="alert"
          >
            <p className="font-bold">Page Unavailable!</p>
            <p>Sorry, the campaign has not been declared successful.</p>
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
