import { fundABizAbi, contractAddresses } from "../constants";
import { useEffect, useState } from "react";
import { Input, Button, useNotification } from "web3uikit";
import { useWeb3Contract, useMoralis } from "react-moralis";

interface contractAddressesInterface {
  [key: string]: { [key: string]: string[] };
}

export default function ClaimRefund() {
  const addresses: contractAddressesInterface = contractAddresses;
  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
  const chainId = chainIdHex ? parseInt(chainIdHex).toString() : "31337";

  // @ts-ignore
  const { runContractFunction } = useWeb3Contract();
  const dispatch = useNotification();

  console.log("chainId", chainId);
  const fundABizAddress =
    chainId in addresses ? addresses[chainId]["FundABusiness"][0] : null;

  const [tierRefundToClaim, setTierRefundToClaim] = useState("");
  const [campaignVerdict, setCampaignVerdict] = useState("");

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [account, isWeb3Enabled, chainId]);

  const updateUI = async () => {
    setCampaignVerdict((await getCampaignState())!);
  };

  const handleClaimTierRefundSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Refund for the purchased tier claimed successfully",
      title: "Refund Claiming",
      position: "topR",
    });
    setTierRefundToClaim("");
  };

  const { runContractFunction: claimRefundInContract } = useWeb3Contract({
    abi: fundABizAbi,
    contractAddress: fundABizAddress!,
    functionName: "claimRefund",
    params: { _tier: tierRefundToClaim },
  });

  const claimTierRefund = async () => {
    await claimRefundInContract({
      onSuccess: (tx) => handleClaimTierRefundSuccess(tx),
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

  return (
    <div>
      {fundABizAddress ? (
        Number(campaignVerdict) === 1 ? (
          <div className="flex flex-col m-10">
            <div className="flex flex-row m-5">
              <div className="mr-4">
                <Input
                  label="Enter tier number to claim refund"
                  name="Tier Perk Number"
                  onChange={(event) => {
                    setTierRefundToClaim(event.target.value);
                  }}
                  type="number"
                />
              </div>
              <div>
                {tierRefundToClaim ? (
                  <Button
                    id="claim-tier-refund"
                    onClick={claimTierRefund}
                    text="Claim Tier Refund"
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
            <p>Sorry, this page is unavailable.</p>
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
