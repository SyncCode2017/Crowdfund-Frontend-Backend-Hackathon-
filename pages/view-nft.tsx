// import ManualHeader from "@/components/ManualHeader";
import Header from "../components/Header";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import ViewAccountNFTs from "../components/ViewAccountNFTs";

export default function NFTDisplay() {
  return (
    <div className={styles.container}>
      <Head>
        <title>View NFT</title>
        <meta
          name="description"
          content="Loading NFT from connected accounts"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <ViewAccountNFTs />
    </div>
  );
}
