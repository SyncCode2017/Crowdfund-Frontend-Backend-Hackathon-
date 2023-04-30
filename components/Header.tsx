import { ConnectButton } from "web3uikit";
import Link from "next/link";
export default function Header() {
  return (
    <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
      <Link href="/">
        <h1 className="py-4 px-4 font-bold text-3xl">Crowd-Fund Businesses</h1>
      </Link>
      <Link href="/" className="mr-4 p-6">
        Fund A Campaign
      </Link>
      <div className="flex flex-row items-center">
        <Link href="/manager" className="mr-4 p-6">
          Manager Page
        </Link>
        <Link href="/business-client" className="mr-4 p-6">
          Clients Page
        </Link>
        <ConnectButton moralisAuth={false} />
      </div>
    </nav>
  );
}
