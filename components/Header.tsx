import { ConnectButton } from "web3uikit";

export default function Header() {
  return (
    <div>
      Crowd Funding
      <ConnectButton moralisAuth={false} />
    </div>
  );
}
