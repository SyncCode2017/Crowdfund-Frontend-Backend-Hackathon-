// import ManualHeader from "@/components/ManualHeader";
import Header from "../components/Header";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import ContributeToCampaign from "../components/ContributeToCampaign";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Crowd Funding</title>
        <meta name="description" content="Crowd funding businesses" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <ContributeToCampaign />
    </div>
  );
}
