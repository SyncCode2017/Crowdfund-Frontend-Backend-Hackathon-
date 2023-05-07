import Header from "../components/Header";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import ClaimReward from "@/components/ClaimReward";

export default function FundersReward() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Claiming Nft</title>
        <meta
          name="description"
          content="Claiming NFT perks rewards by funders"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <ClaimReward />
    </div>
  );
}
