import {
  fundABizAbi,
  mockErc20Abi,
  contractAddresses,
  nftContractAddresses,
} from "../constants";
import { useEffect, useState } from "react";
import { BigNumber, ethers, ContractTransaction } from "ethers";
import type { NextPage } from "next";
import { Form, Input, Button, useNotification, Card } from "web3uikit";
import { useWeb3Contract, useMoralis } from "react-moralis";
import Image from "next/image";
import axios from "axios";
import { TIERS } from "../constants/index";

interface contractAddressesInterface {
  [key: string]: { [key: string]: string[] };
}

interface OwnedNftsDataInterface {
  [x: string]: {};
  contract: { address: string };
  metadata: { image: string; name: unknown; description: unknown };
  id: { tokenId: string };
}

interface APIResponseDataInterface {
  ownedNfts: OwnedNftsDataInterface;
}

export default function ViewAccountNFTs() {
  const addresses: contractAddressesInterface = contractAddresses;
  const nftContracts: contractAddressesInterface = nftContractAddresses;

  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
  const chainId = chainIdHex ? parseInt(chainIdHex).toString() : "31337";

  // @ts-ignore
  const { runContractFunction } = useWeb3Contract();
  const [accountNfts, setAccountNfts] = useState([]);

  console.log("chainId", chainId);
  const fundABizAddress =
    chainId in addresses ? addresses[chainId]["FundABusiness"][0] : null;

  const nftPerk1 =
    chainId in nftContracts ? nftContracts[chainId]["NftPerks1"][0] : null;
  const nftPerk2 =
    chainId in nftContracts ? nftContracts[chainId]["NftPerks2"][0] : null;
  const nftPerk3 =
    chainId in nftContracts ? nftContracts[chainId]["NftPerks3"][0] : null;

  const oldNft1 = "0x9194d1f7f6930d6381b171656fa03c03b964fb22";
  const oldNft2 = "0x9691B52B783a821ceCfB6E21752bF715C577F1cA";
  const oldNft3 = "0xC1543E787f7396B8F8E5f8C07DccEF3FcF696A19";
  const moatNftAddresses = [
    nftPerk1!.toLowerCase(),
    nftPerk2!.toLowerCase(),
    nftPerk3!.toLowerCase(),
    oldNft1.toLowerCase(),
    oldNft2.toLowerCase(),
    oldNft3.toLowerCase(),
  ];

  async function updateUI() {
    let accountAllNftsApiRes: APIResponseDataInterface =
      (await getAllAccountNfts())!;
    //@ts-ignore
    let accountAllNfts: OwnedNftsDataInterface[] =
      accountAllNftsApiRes.ownedNfts;

    const accountCrowdditNftsGen = accountAllNfts.map(function (
      nftData: OwnedNftsDataInterface
    ) {
      for (let moatNft of moatNftAddresses) {
        if (nftData.contract.address === moatNft) {
          return nftData;
        }
      }
    });
    const accountCrowdditNfts = accountCrowdditNftsGen.filter(function (
      nftData: OwnedNftsDataInterface | undefined
    ) {
      if (nftData) {
        return nftData;
      }
    });
    //@ts-ignore
    setAccountNfts(accountCrowdditNfts);
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [chainId, account, isWeb3Enabled]);

  const getAllAccountNfts =
    async (): Promise<APIResponseDataInterface | null> => {
      // Alchemy URL
      const baseURL = process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_API_KEY;
      const url = `${baseURL}/getNFTs/?owner=${account}`;
      console.log("url", url);
      // Make the request
      try {
        const response = await axios.get(url);
        console.log(response["data"]);
        return response["data"];
      } catch (error) {
        console.log("error", error);
      }
      return null;
    };

  return (
    <div>
      <div>
        {isWeb3Enabled ? (
          accountNfts ? (
            <div>
              <div className="text-2xl font-bold items-center p-5">
                <p>Moat NFTs in your wallet ...</p>
              </div>
              <div className="flex flex-wrap">
                {accountNfts.map((nft) => {
                  //@ts-ignore
                  let imageURI = (nft.metadata.image as string).replace(
                    "ipfs://",
                    "https://"
                  );
                  //@ts-ignore
                  const tokenId = parseInt(nft.id.tokenId);
                  //@ts-ignore
                  const name = nft.metadata.name;
                  //@ts-ignore
                  const description = nft.metadata.description;

                  const imageSub = imageURI.substring(67);
                  imageURI = imageURI.replace(
                    imageSub,
                    `.ipfs.dweb.link${imageSub}`
                  );

                  return (
                    <div className="flex flex-col p-2 items-center">
                      <Card title={name} description={description}>
                        <Image
                          loader={() => imageURI}
                          src={imageURI}
                          height="250"
                          width="250"
                          alt={name}
                        />
                      </Card>
                      <p>tokenId: {tokenId}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              className="bg-orange-100 border-l-4 border-blue-500 text-blue-700 p-4"
              role="alert"
            >
              <p className="font-bold">No NFT found!</p>
            </div>
          )
        ) : (
          <div className="bg-orange-100 border-l-4 border-blue-500 text-blue-600 p-5">
            <h1 className="font-bold text-2xl pb-4">
              Want to view your Moat Nfts?!
            </h1>
            <h2 className="text-1xl">Please connect your wallet ...</h2>
          </div>
        )}
      </div>
    </div>
  );
}
