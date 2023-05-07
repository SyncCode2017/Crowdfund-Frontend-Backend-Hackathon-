import { fundABizAbi, mockErc20Abi, contractAddresses } from "../constants";
import { useEffect, useState } from "react";
import { BigNumber, ethers, ContractTransaction } from "ethers";
import type { NextPage } from "next";
import { Form, Input, Button, useNotification } from "web3uikit";
import { useWeb3Contract, useMoralis } from "react-moralis";

interface contractAddressesInterface {
  [key: string]: { [key: string]: string[] };
}

export default function ManageTheCampaign() {
  const addresses: contractAddressesInterface = contractAddresses;
  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
  const chainId = chainIdHex ? parseInt(chainIdHex).toString() : "31337";

  // @ts-ignore
  const { runContractFunction } = useWeb3Contract();

  console.log("chainId", chainId);
  const fundABizAddress =
    chainId in addresses ? addresses[chainId]["FundABusiness"][0] : null;

  const [hasManagerRole, setHasManagerRole] = useState("");
  const [allowedErc20TokenAddress, setAllowedErc20TokenAddress] = useState("");
  const [newTreasuryAddress, setNewTreasuryAddress] = useState("");
  const [reasonForEarlyClosure, setReasonForEarlyClosure] = useState("");
  const [newManager, setNewManager] = useState("");
  const [managerRoleHex, setManagerRoleHex] = useState("");
  const [pauserRoleHex, setPauserRoleHex] = useState("");
  const [newFeeNumerator, setNewFeeNumerator] = useState("");
  const [newBusinessAddress, setNewBusinessAddress] = useState("");
  const [milestoneId, setMilestoneId] = useState("");
  const [tierPerk, setTierPerk] = useState("0");
  const [tierPerkQuantityBought, setTierPerkQuantityBought] = useState("");

  const dispatch = useNotification();

  const handleApproveMilestoneSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Milestone approved successfully",
      title: "Approving Milestone",
      position: "topR",
    });
    setMilestoneId("");
  };

  const handleUpdateAllowedTokenSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Allowed token changed successfully",
      title: "Allowed token changed",
      position: "topR",
    });
    setAllowedErc20TokenAddress("");
  };

  const handleUpdateBusinessAddressSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Business address changed successfully",
      title: "Business Address Updated",
      position: "topR",
    });
    setNewBusinessAddress("");
  };

  const handleUpdateCrowdditFeeSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Crowddit fee changed successfully",
      title: "Crowddit Fee Updated",
      position: "topR",
    });
    setNewFeeNumerator("");
  };

  const handleUpdateTreasuryAddressSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Treasury Address changed successfully",
      title: "Treasury address changed",
      position: "topR",
    });
    setNewTreasuryAddress("");
  };

  const handleCloseCampaignSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "Campaign closed successfully",
      title: "Early Campaign Closure",
      position: "topR",
    });
  };

  const handleAddNewManagerSuccess = async (tx: unknown) => {
    // @ts-ignore
    await tx.wait(1);
    dispatch({
      type: "success",
      message: "New manager added successfully",
      title: "New Manager Added",
      position: "topR",
    });
    setNewManager("");
  };

  const { runContractFunction: approveMilestoneInContract } = useWeb3Contract({
    abi: fundABizAbi,
    contractAddress: fundABizAddress!,
    functionName: "approveMilestoneAndReleaseFund",
    params: {
      _milestoneNumber: milestoneId,
    },
  });

  const { runContractFunction: updateCrowdditFeeInContract } = useWeb3Contract({
    abi: fundABizAbi,
    contractAddress: fundABizAddress!,
    functionName: "setMOATFee",
    params: {
      _feeFraction: newFeeNumerator,
    },
  });

  const { runContractFunction: updateBusinessAddressInContract } =
    useWeb3Contract({
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "setBusinessAddress",
      params: {
        _businessAddress: newBusinessAddress,
      },
    });

  const { runContractFunction: updateErc20TokenInContract } = useWeb3Contract({
    abi: fundABizAbi,
    contractAddress: fundABizAddress!,
    functionName: "setAllowedToken",
    params: {
      _allowedErc20Token: allowedErc20TokenAddress,
    },
  });

  const { runContractFunction: addNewManagerInContract } = useWeb3Contract({
    abi: fundABizAbi,
    contractAddress: fundABizAddress!,
    functionName: "grantRole",
    params: {
      role: managerRoleHex,
      account: newManager,
    },
  });

  const { runContractFunction: closeCampaignInContract } = useWeb3Contract({
    abi: fundABizAbi,
    contractAddress: fundABizAddress!,
    functionName: "closeFundingRound",
    params: {
      _reasonForEnding: reasonForEarlyClosure,
    },
  });

  const { runContractFunction: updateTreasuryAddressInContract } =
    useWeb3Contract({
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "setTreasuryAddress",
      params: {
        _treasuryAddress: newTreasuryAddress,
      },
    });

  const addNewManager = async (): Promise<void> => {
    await addNewManagerInContract({
      onSuccess: () => (tx: unknown) => handleAddNewManagerSuccess(tx),
      onError: (error) => console.log(error),
    });
  };

  const getManagerRoleHex = async (): Promise<string | null> => {
    const managerHexOptions = {
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "MANAGER_ROLE",
      params: {},
    };

    const managerHex = (await runContractFunction({
      params: managerHexOptions,
      onError: (error) => console.log(error),
    })) as string;
    if (managerHex) {
      return managerHex;
    }
    return null;
  };

  const getPauserRoleHex = async (): Promise<string | null> => {
    const pauserHexOptions = {
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "PAUSER_ROLE",
      params: {},
    };

    const pauserHex = (await runContractFunction({
      params: pauserHexOptions,
      onError: (error) => console.log(error),
    })) as string;
    if (pauserHex) {
      return pauserHex;
    }
    return null;
  };

  const getTierPerkQuantityBought = async (): Promise<void> => {
    const getTierPerkQuantityOptions = {
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "getQuantityOfTierBought",
      params: {
        _tier: tierPerk,
      },
    };

    const boughtQtty: string = String(
      await runContractFunction({
        params: getTierPerkQuantityOptions,
        onError: (error) => console.log(error),
      })
    );
    console.log("boughtQtty", boughtQtty);
    boughtQtty ? setTierPerkQuantityBought(boughtQtty) : null;
  };

  const isACampaignManager = async (): Promise<string | null> => {
    // const managerRoleHex = await getManagerRoleHex();
    console.log("managerRoleHex", managerRoleHex);
    console.log("account is", account);

    const isAManagerOptions = {
      abi: fundABizAbi,
      contractAddress: fundABizAddress!,
      functionName: "hasRole",
      params: {
        role: managerRoleHex,
        account: account,
      },
    };

    const response = (await runContractFunction({
      params: isAManagerOptions,
      onError: (error) => console.log(error),
    })) as string;
    console.log("Is a manager?", response);
    if (response) {
      return response;
    }
    return null;
  };

  const updateTokenAddress = async () => {
    await updateErc20TokenInContract({
      onSuccess: (tx) => handleUpdateAllowedTokenSuccess(tx),
      onError: (error) => console.log(error),
    });
  };

  const closeCampaign = async () => {
    await closeCampaignInContract({
      onSuccess: (tx) => handleCloseCampaignSuccess(tx),
      onError: (error) => console.log(error),
    });
  };

  const updateUI = async () => {
    setHasManagerRole((await isACampaignManager())!);
    setManagerRoleHex((await getManagerRoleHex())!);
    setPauserRoleHex((await getPauserRoleHex())!);
    Number(tierPerk) > 0 ? await getTierPerkQuantityBought() : null;

    console.log("Account has Manager Role?", hasManagerRole);
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [account, isWeb3Enabled, chainId]);

  const updateTreasuryAddress = async () => {
    await updateTreasuryAddressInContract({
      onSuccess: (tx) => handleUpdateTreasuryAddressSuccess(tx),
      onError: (error) => console.log(error),
    });
  };

  const updateBusinessAddress = async () => {
    await updateBusinessAddressInContract({
      onSuccess: (tx) => handleUpdateBusinessAddressSuccess(tx),
      onError: (error) => console.log(error),
    });
  };

  const updateCrowdditFeeNum = async () => {
    await updateCrowdditFeeInContract({
      onSuccess: (tx) => handleUpdateCrowdditFeeSuccess(tx),
      onError: (error) => console.log(error),
    });
  };

  const approveMilestone = async () => {
    await approveMilestoneInContract({
      onSuccess: (tx) => handleApproveMilestoneSuccess(tx),
      onError: (error) => console.log(error),
    });
  };

  return (
    <div>
      {Boolean(hasManagerRole) ? (
        <div>
          {fundABizAddress ? (
            <div className="flex flex-col py-10">
              <div className="flex flex-row m-5">
                <div className="mr-4">
                  <Input
                    label="Update allowed Erc-20 token address"
                    name="New Erc-20 token address"
                    onChange={(event) => {
                      setAllowedErc20TokenAddress(event.target.value);
                    }}
                    type="text"
                  />
                </div>
                <div>
                  {allowedErc20TokenAddress ? (
                    <Button
                      id="update-allowedToken"
                      onClick={updateTokenAddress}
                      text="Update Allowed Token"
                      theme="colored"
                      color="blue"
                      type="button"
                    />
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>
              <div className="flex flex-row m-5">
                <div className="mr-4">
                  <Input
                    label="Update treasury address"
                    name="New treasury address"
                    onChange={(event) => {
                      setNewTreasuryAddress(event.target.value);
                    }}
                    type="text"
                  />
                </div>
                <div>
                  {newTreasuryAddress ? (
                    <Button
                      id="update-treasuryAddress"
                      onClick={updateTreasuryAddress}
                      text="Update Treasury Address"
                      theme="colored"
                      color="blue"
                      type="button"
                    />
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>
              <div className="flex flex-row m-5">
                <div className="mr-4">
                  <Input
                    label="Enter reason for campaign closure"
                    name="Reason for early closure"
                    onChange={(event) => {
                      setReasonForEarlyClosure(event.target.value);
                    }}
                    type="number"
                  />
                </div>
                <div>
                  {reasonForEarlyClosure ? (
                    <Button
                      id="close-campaign"
                      onClick={closeCampaign}
                      text="Close Campaign"
                      theme="colored"
                      color="blue"
                      type="button"
                    />
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>
              <div className="flex flex-row m-5">
                <div className="mr-4">
                  <Input
                    label="Add new manager address"
                    name="Adding New Manager"
                    onChange={(event) => {
                      setNewManager(event.target.value);
                    }}
                    type="text"
                  />
                </div>
                <div>
                  {newManager ? (
                    <Button
                      id="add-new-manager"
                      onClick={addNewManager}
                      text="Add new campaign manager"
                      theme="colored"
                      color="blue"
                      type="button"
                    />
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>
              <div className="flex flex-row m-5">
                <div className="mr-4">
                  <Input
                    label="Update business address"
                    name="New Business Address"
                    onChange={(event) => {
                      setNewBusinessAddress(event.target.value);
                    }}
                    type="text"
                  />
                </div>
                <div>
                  {newBusinessAddress ? (
                    <Button
                      id="update-business-address"
                      onClick={updateBusinessAddress}
                      text="Update business address"
                      theme="colored"
                      color="blue"
                      type="button"
                    />
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>
              <div className="flex flex-row m-5">
                <div className="mr-4">
                  <Input
                    label="Update crowddit fee"
                    name="Crowddit Fee Numerator"
                    onChange={(event) => {
                      setNewFeeNumerator(event.target.value);
                    }}
                    type="number"
                  />
                </div>
                <div>
                  {newFeeNumerator ? (
                    <Button
                      id="update-crowddit-fee"
                      onClick={updateCrowdditFeeNum}
                      text="Update Crowddit Fee Numerator"
                      theme="colored"
                      color="blue"
                      type="button"
                    />
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>
              <div className="flex flex-row m-5">
                <div className="mr-4">
                  <Input
                    label="Approve milestone and release fund"
                    name="Milestone to Approve"
                    onChange={(event) => {
                      setMilestoneId(event.target.value);
                    }}
                    type="number"
                  />
                </div>
                <div>
                  {milestoneId ? (
                    <Button
                      id="approve-milestone"
                      onClick={approveMilestone}
                      text="Approve milestone"
                      theme="colored"
                      color="blue"
                      type="button"
                    />
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>
              <div className="flex flex-row m-5">
                <div className="mr-4">
                  <div>
                    <Input
                      label="Enter tier to get quantity bought"
                      name="Tier Perk Quantity Bought"
                      onChange={(event) => {
                        setTierPerk(event.target.value);
                      }}
                      type="number"
                    />
                  </div>
                  <div>
                    {Number(tierPerk) > 0 ? (
                      <div>
                        {tierPerkQuantityBought ? (
                          <p>
                            Tier {tierPerk} Quantity Bought is{" "}
                            {tierPerkQuantityBought}
                          </p>
                        ) : (
                          <p></p>
                        )}
                      </div>
                    ) : (
                      <p></p>
                    )}
                  </div>
                </div>
                <div>
                  {Number(tierPerk) > 0 ? (
                    <div className="mr-4">
                      <Button
                        id="get-tier-quantity-bought"
                        onClick={getTierPerkQuantityBought}
                        text="Get Quantity Bought"
                        theme="colored"
                        color="blue"
                        type="button"
                      />
                    </div>
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>
              {/* <Form
            onSubmit={}
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
          /> */}
            </div>
          ) : (
            <div
              className="bg-orange-100 border-l-4 border-blue-500 text-blue-700 p-4"
              role="alert"
            >
              <p className="font-bold">Unsupported Network!</p>
              <p>Please switch the network in your wallet!</p>
            </div>
          )}
        </div>
      ) : (
        <div
          className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4"
          role="alert"
        >
          <p className="font-bold">Not a Manager!</p>
          <p>Only managers are allowed on this page.</p>
        </div>
      )}
    </div>
  );
}
