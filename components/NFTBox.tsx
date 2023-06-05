import type { NextPage } from "next";
import { Card } from "web3uikit";
import Image from "next/image";
import { useState, useEffect } from "react";
import GenerateTokenModal from "./GenerateTokenModal";

interface NFTBoxProps {
  name: string;
  account: string;
  imageURI: string;
  description: string;
  nftPerkAddress: string;
  tokenId: string;
}

const NFTBox: NextPage<NFTBoxProps> = ({
  name,
  account,
  imageURI,
  description,
  nftPerkAddress,
  tokenId,
}: NFTBoxProps) => {
  const [showModal, setShowModal] = useState(false);
  const hideModal = () => setShowModal(false);

  const imageSub = imageURI.substring(67);
  imageURI = imageURI.replace(imageSub, `.ipfs.dweb.link${imageSub}`);

  const handleCardClick = () => {
    setShowModal(true);
  };

  return (
    <div className="flex flex-col p-2 items-center">
      <GenerateTokenModal
        isVisible={showModal}
        name={name}
        account={account}
        nftPerkAddress={nftPerkAddress}
        tokenId={Number(tokenId)}
        onClose={hideModal}
      />
      <Card
        id={tokenId}
        title={name}
        description={description}
        onClick={() => handleCardClick()}
      >
        <Image
          loader={() => imageURI}
          src={imageURI}
          height="250"
          width="250"
          alt={name}
        />
      </Card>
      <p className="text-lg">tokenId: {tokenId}</p>
    </div>
  );
};

export default NFTBox;
