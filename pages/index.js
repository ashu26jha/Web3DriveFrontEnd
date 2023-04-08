import Head from 'next/head';
import Navbar from "../components/Navbar";
import { useMoralis } from "react-moralis";
import Footer from "../components/Footer";
import contractAddresses from '../constants/networkMapping.json';


export default function Home() {
  
  const {chainId: chainIdHex } = useMoralis()
  const chainId = parseInt(chainIdHex);
  const web3driveAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

  return (
    <>

      <Head>
        <title>Web3 Drive</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <Header/> */}
      <Navbar />
      <Footer web3driveAddress={web3driveAddress}/>
    </>
  )
}
