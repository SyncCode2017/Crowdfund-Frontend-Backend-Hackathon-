// import ManualHeader from "@/components/ManualHeader";
import Header from "../components/Header";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import ManageTheCampaign from "../components/ManageTheCampaign";

export default function ManageCampaign() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Manager Page</title>
        <meta
          name="description"
          content="Manager functions to manage a campaign"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <ManageTheCampaign />
      Hello from Manager
    </div>
  );
}
