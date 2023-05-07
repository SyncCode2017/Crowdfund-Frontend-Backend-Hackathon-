import Header from "../components/Header";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import ClaimRefund from "../components/ClaimRefund";

export default function FundersRefund() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Claiming Refund</title>
        <meta
          name="description"
          content="Funders of a failed campaign claim refund"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <ClaimRefund />
    </div>
  );
}
