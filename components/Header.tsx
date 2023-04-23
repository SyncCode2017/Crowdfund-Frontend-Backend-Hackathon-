import { ConnectButton } from "web3uikit";
import Link from "next/link";
export default function Header() {
  return (
    <nav>
      <Link href="/">Fund A Campaign</Link>
      <Link href="/manager">Manager Page</Link>
      <Link href="/business-client">Clients Page</Link>
      <ConnectButton moralisAuth={false} />
    </nav>
  );
}
