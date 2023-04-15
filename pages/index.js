import Head from 'next/head';
import Navbar from "../components/Navbar";
import Cards from "../components/Cards";
import { useMoralis, useWeb3Contract } from "react-moralis";
import AddFile from "../components/AddFile";
import Footer from "../components/Footer";
import contractAddresses from '../constants/networkMapping.json';
import abi from "../constants/web3drive.json";
import { gql, useQuery } from '@apollo/client';
import axios from 'axios'
import { useState } from 'react';

function toggle() {
  var blur = document.getElementById('blur');
  blur.classList.toggle('active')
  var popup = document.getElementById('popup');
  popup.classList.toggle('active')
}

export default function Home() {
  const { chainId: chainIdHex } = useMoralis()
  const chainId = parseInt(chainIdHex);
  const web3driveAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
  let account = '0x62273214392D066823750fDaf449C57f608Fc26B'
  // if(window){
  //   account=window.ethereum.selectedAddress;
  // }
  const [tokenidindex, setTokenidindex] = useState(null);
  const [accountShare, setAccountShare] = useState(null);
  const [levelShare, setLevelShare] = useState(null);
  const [TokenID,setTokenID] = useState(null);
  if (typeof (window) != 'undefined') {
    account = window.ethereum.selectedAddress;
  }

  const GET_ACTIVE_ITEM = gql`
  {
    activeFiles(
      first: 30
    ) {
      id
      tokenId
      ipfsHash
      Account
      Privilege
    }
  }
`

  const GET_DELETE_ITEM = gql`
  {
    fileDeleteds(first: 20) {
      token
      whoDeleted
    }
  }
  `

  const { data: dataRecievedActiveFiles } = useQuery(GET_ACTIVE_ITEM);
  const { data: dataRecievedDeletedFiles } = useQuery(GET_DELETE_ITEM);

  console.log(dataRecievedActiveFiles);

  const activeItems = [];

  if (dataRecievedActiveFiles) {
    for (let i = 0; i < dataRecievedActiveFiles.activeFiles.length; i++) {
      if (dataRecievedActiveFiles.activeFiles[i].Account == account) {
        
        const temp = {
          tokenId: dataRecievedActiveFiles.activeFiles[i].tokenId,
          ipfs: dataRecievedActiveFiles.activeFiles[i].ipfsHash,
          account: dataRecievedActiveFiles.activeFiles[i].Account
        }
        activeItems.push(temp);
      }
    }
  }

  const activeFilesTokens = [];
  const deletedFileTokens = [];

  if (dataRecievedActiveFiles) {
    for (let i = 0; i < dataRecievedActiveFiles.activeFiles.length; i++) {
      if (dataRecievedActiveFiles.activeFiles[i].Account == account) {
        activeFilesTokens.push(dataRecievedActiveFiles.activeFiles[i].tokenId);
      }
    }
  }
  
  if (dataRecievedDeletedFiles) {
    for (let i = 0; i < dataRecievedDeletedFiles.fileDeleteds.length; i++) {
      deletedFileTokens.push(dataRecievedDeletedFiles.fileDeleteds[i].token);
    }
  }
  // console.log(deletedFileTokens);
  const tokens = [];
  for (let i = 0; i < activeFilesTokens.length; i++) {
    if (deletedFileTokens.indexOf(activeFilesTokens[i]) == -1) {
      tokens.push(activeFilesTokens[i]);
    }
  }
  // console.log(activeItems)
  const { runContractFunction: changeAccessLevel } = useWeb3Contract({
    abi: abi,
    contractAddress: web3driveAddress,
    functionName: "changeAccessLevel",
    params: {
      account: accountShare,
      tokenId: 4,
      level: levelShare,
    },
  });

  const { runContractFunction: deleteFile } = useWeb3Contract({
    abi: abi,
    contractAddress: web3driveAddress,
    functionName: "deleteFile",
    params: {
      tokenId: tokenidindex,
    },
  });

  async function Share() {
    var form = document.getElementById('form');
    
    form.addEventListener('submit',async function (event) {
      event.preventDefault();
      var username = document.getElementById('username').value;
      var email = document.getElementById('email').value;
      if (email > 3 || email < 0) {
        alert('Invalid level access')
      }
      console.log('1')
      setAccountShare(username);
      setLevelShare(email);
    })
    console.log(accountShare);
    await changeAccessLevel();

  }

  async function Delete() {

    const index = localStorage.getItem("Index Clicked");
    console.log(activeItems[index].ipfs)
    setTokenidindex(index);

    async function RunDeleteFunction() {
      const txResponse = await deleteFile();
    }

    await RunDeleteFunction()

    // Unpin from pinata

    let imageIPFShash;
    await axios.get(`https://ipfs.io/ipfs/${activeItems[index].ipfs}`)
      .then(function (response) {
        imageIPFShash = (response.data.imageHash);
      })
      .catch(function (error) {
        console.log(error);
      });

    const JSONurl = 'https://api.pinata.cloud/pinning/unpin/' + activeItems[index].ipfs;
    const IMGurl = 'https://api.pinata.cloud/pinning/unpin/' + imageIPFShash;
    var configJSON = {
      method: 'delete',
      url: JSONurl,
      headers: {
        pinata_api_key: `577cdfa2517b73ed5ed1`,
        pinata_secret_api_key: `135beabb2b4aa3e5939bb6ea4dde06356d96b3fc99cb953d383817d1befd5049`,
      }
    };
    const resJSON = await axios(configJSON);

    var configIMG = {
      method: 'delete',
      url: IMGurl,
      headers: {
        pinata_api_key: `577cdfa2517b73ed5ed1`,
        pinata_secret_api_key: `135beabb2b4aa3e5939bb6ea4dde06356d96b3fc99cb953d383817d1befd5049`,
      }
    };
    const resIMG = await axios(configIMG);

  }
  function Open() {
    const index = localStorage.getItem("Index Clicked");
    let url = "https://ipfs.io/ipfs/" + activeItems[index].ipfs
    window.open(url);
  }
  function reset(){
    localStorage.clear();
    document.getElementById("hideNavbar").style.display = 'none';
    // setTokenID(null);
  }

  async function Edit(){
    setTokenID(7);
  }

  return (
    <>
      <div class="container" id="blur" >
        <div onClick={reset}>
          <Head>
            <title>Web3 Drive</title>
            <meta name="description" content="Generated by create next app" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Navbar />
          <AddFile web3driveAddress={web3driveAddress} abi={abi} tokenId={TokenID} />
        </div>
        <div id='hideNavbar'><button id='internal' onClick={Open}>Open</button><button id='internal' onClick={Edit} >Edit</button><button id='internal'>Comment</button><button id='internal' onClick={toggle}>Share</button><button id='internal' onClick={Delete}>Delete</button></div>
        
        <div className='wrapper'>
          {activeItems ? activeItems.map((a, index) => {
            return (
              <>
                {tokens.indexOf(a.tokenId) != -1 ? <Cards ipfs={a.ipfs} index={index} /> : <div></div>}
              </>
            )
          }) : <div className='loading'>Loading...</div>}

        </div>
      </div>

      <div id="popup">
        Allow access<a href="#" id="cross" onClick={toggle}>X</a>
        <form id="form" autocomplete="off">

          <input type="text" id="username" placeholder="Enter wallet address" required /><br />
          <input type="emai" id="email" placeholder="Access Level" required /><br />
          <input type="submit" className="access" value="Share" onClick={Share}></input>
        </form>
        Access level 1: View<br/>
        Access level 2: Comments & View<br/>
        Access level 3: Admin Privilege

      </div>
      <Footer web3driveAddress={web3driveAddress} />
    </>
  )
}
