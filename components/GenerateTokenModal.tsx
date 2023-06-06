import { Modal, useNotification, Input, Illustration, Button } from "web3uikit";
import { useState } from "react";
import { generateRandomString } from "@/utils/helpful-functions";

export interface GenerateTokenModalProps {
  isVisible: boolean;
  onClose: () => void;
  account: string;
  name: string;
  nftPerkAddress: string;
  tokenId: number;
}

const GenerateTokenModal = ({
  isVisible,
  onClose,
  account,
  name,
  nftPerkAddress,
  tokenId,
}: GenerateTokenModalProps) => {
  const [randomString, setRandomString] = useState("");

  const getRandomString = async () => {
    const randStr = (await generateRandomString(
      account,
      nftPerkAddress,
      tokenId
    ))!;
    setRandomString(randStr);
  };

  const handleCloseModal = () => {
    setRandomString("");
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      id="regular"
      onCancel={handleCloseModal}
      onCloseButtonPressed={handleCloseModal}
      onOk={handleCloseModal}
      title="Generate Tokens"
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div>
          <p>Perk: {name}</p>
          <p>Nft Perk Address: {nftPerkAddress}</p>
          <p>tokenId: {tokenId}</p>
        </div>

        <div className="font-bold text-2xl p-2">
          {randomString.length > 0 ? (
            randomString
          ) : (
            <div>
              <Button
                id="generate-token"
                onClick={getRandomString}
                text="Generate Token"
                theme="colored"
                color="red"
                type="button"
              />{" "}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default GenerateTokenModal;
