// import ManualHeader from "@/components/ManualHeader";
import Header from "../components/Header";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import BusinessWithdrawal from "@/components/BusinessWithdrawal";

export default function BusinessClient() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Clients Page</title>
        <meta
          name="description"
          content="Business functions to withdraw fund raised"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <BusinessWithdrawal />
    </div>
  );
}
