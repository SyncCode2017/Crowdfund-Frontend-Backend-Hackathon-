# Project Moat Overview

Project moat is a decentralised crowd-funding platform that allow businesses
to raise funds through crowd-funding. Contributors would be rewarded once the
with nft of diffrent perks based on how much the contributor contributed during the
campaign period or funding round once the target amount is met.

Contributors would be able to contribute through fiat (banking system) and through
cryptocurrency during the funding round. The nft perks given as the reward to the
contributors will guarantee the contributor a special discount and vip access with
the business. The contributor would also have the option of selling the nft perk on
the secondary market to recover his/her investment anytime. The new buyer have
to patronise the business to claim the discounts and vip access attached to the nft
perks. This way, the business customer base keeps growing, the business itself keeps
growing and the values of the nft perks also increase in the secondary market.

However, if the target amount is not met during the funding round and the campaign
fail all the contributors or funders will be able to claim their refund or it
may be refunded to their wallets.

### Benefits of Project Moat

1. Unlike the traditional crowd-funding space, the businesses do not have to promise
   unrealistic return on investment to the contributors. The contributors are not shareholders
   in the business. This gives sufficient time to the startup (business) to grow and expand
   carefully.

2. The contributors also become customer to the business as they can only use their NFT perks
   to claim discounts and vip access with the business.

3. Anytime these NFT perks are sold in the secondary markets, the business gets royalties and gain
   a new customer. Royalties from the secondary markets gives the business additional cash flow.

4. Contributors are able to see how and when funds-raised are released to the business according
   to the milestones define in the contract as the approval and release of fund will be done on chain.
   This guarantees transparency.

5. Since fiat contributions will be accepted, many more new users will be brought to the web3 space.

Project Moat will generate cash flow by taking fractions of the fund raised and the NFT royalties
in the secondary market. Project Moat team plan to develop NFT marketplace as secondary market for
the NFTs and hopes to eventually become a DAO. As a DAO, the project will be community-owned and the team
can continue to effectively screen every business that comes to raise fund on the platform.

## Implementation

The Figure 1 below shows the overview implementation of the project. Two smart contracts were written; the
FundABusiness.sol and the NFTperks.sol. The FundABusiness.sol contract manages the crowd-funding campaign.
It has the minter role of the NFTperks.sol contract and it would be able to mint NFTs to funders or
contributors once the campaign is declared succesful and the NFT contracts are set.
![`Figure 1`](moat-overview.jpg)

The Figure 2 below describes all the callable functions in the FundABusiness.sol. All the functions have
a period of time when they are callable. For example, the contribute function is only available when the campaign period is open while claimRefund function can only be called when the campaign has failed.
The Project Moat manager would be able to use the contributeOnBehalfOf function to deposit fiat
contributions o
![alt text](fund-a-business-functions.jpg)

![alt text](moat-proveddit.jpg)

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
