import Head from 'next/head';
import Navbar from "../components/Navbar";
import Cards from "../components/Cards";
import { useMoralis } from "react-moralis";
import AddFile from "../components/AddFile";
import Footer from "../components/Footer";
import contractAddresses from '../constants/networkMapping.json';
import abi from "../constants/web3drive.json";
import GET_ACTIVE_ITEM from "../constants/subGraphQuery"
import { useQuery } from '@apollo/client';
import { Loading, Update } from 'web3uikit';
import { data } from 'autoprefixer';


export default function Home() {

  const { chainId: chainIdHex } = useMoralis()
  const chainId = parseInt(chainIdHex);
  const web3driveAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

  const { loading, error, data: dataRecieved } = useQuery(GET_ACTIVE_ITEM);
  const alldata = [];

  return (
    <>

      <Head>
        <title>Web3 Drive</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <AddFile web3driveAddress={web3driveAddress} abi={abi} />
      {console.log("SS")}
      <div className='wrapper'>
        {dataRecieved ? dataRecieved.activeFiles.map((a,index) => {
          return(
          <Cards ipfs={a.ipfsHash} index={index}/>
          )
        }) : <div className='loading'>Loading...</div>}

      </div>
      <Footer web3driveAddress={web3driveAddress} abi={abi} />
    </>
  )
}
