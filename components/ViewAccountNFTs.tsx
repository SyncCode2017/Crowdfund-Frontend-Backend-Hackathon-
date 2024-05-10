import { contractAddresses, nftContractAddresses } from "../constants";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Image from "next/image";
import axios from "axios";
import NFTBox from "./NFTBox";

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

  const [accountNfts, setAccountNfts] = useState([]);

  console.log("chainId", chainId);
  const fundABizAddress =
    chainId in addresses ? addresses[chainId]["FundABusiness"][0] : null;

  const getMoatNftAddresses = (): string[] | null => {
    let nftPerk1 =
      chainId in nftContracts ? nftContracts[chainId]["NftPerks1"] : null;
    let nftPerk2 =
      chainId in nftContracts ? nftContracts[chainId]["NftPerks2"] : null;
    let nftPerk3 =
      chainId in nftContracts ? nftContracts[chainId]["NftPerks3"] : null;

    if (nftPerk1 === null && nftPerk2 === null && nftPerk3 === null) {
      return null;
    } else {
      nftPerk1 =
        nftPerk1!.length > 0
          ? nftPerk1!.map((x) => {
            return x.toLowerCase();
          })
          : null;
      nftPerk2 =
        nftPerk2!.length > 0
          ? nftPerk2!.map((x) => {
            return x.toLowerCase();
          })
          : null;
      nftPerk3 =
        nftPerk3!.length > 0
          ? nftPerk3!.map((x) => {
            return x.toLowerCase();
          })
          : null;

      const moatNftAddrs = [...nftPerk1!, ...nftPerk2!, ...nftPerk3!];
      return moatNftAddrs;
    }
  };

  const moatNftAddresses = getMoatNftAddresses()!;

  console.log("moatNftAddresses", moatNftAddresses);

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
      updateUI()
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
        if (chainId === "80001") {
          const response = await axios.get(url);
          console.log(response["data"]);
          return response["data"];
        } else {
          return null;
        }
      } catch (error) {
        console.log("error", error);
      }
      return null;
    }

  return (
    <div>
      <div>
        {isWeb3Enabled ? (
          accountNfts.length > 0 ? (
            <div>
              <div className="text-2xl font-bold items-center p-5">
                <p>Click your desired NFT to generate token ...</p>
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
                  //@ts-ignore
                  const nftPerkAddress = nft.contract.address;

                  return (
                    <NFTBox
                      name={name}
                      account={account!}
                      imageURI={imageURI}
                      description={description}
                      nftPerkAddress={nftPerkAddress}
                      tokenId={tokenId.toString()}
                    />
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
          <div className="bg-orange-100 border-l-4 border-blue-500 text-blue-600 p-10">
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
