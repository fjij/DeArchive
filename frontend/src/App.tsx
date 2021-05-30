import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import normalizeUrl from 'normalize-url';
import { Results } from './Results';
import { Save } from './Save';
import { ethers } from 'ethers';
import base58 from 'base58-encode';

import ContractArtifact from './contracts/DeArchive.json';
import config from './contracts/config.json';
import ERC677 from '@chainlink/contracts/abi/v0.4/ERC677.json'

const LINK = ethers.BigNumber.from("1000000000000000000");
const PAGE_LENGTH = 5;

interface Entry {
  hash: string;
  time: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [entries, setEntries] = useState<Entry[]>();
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [walletConnected, setWalletConnected] = useState(false);
  const [transacting, setTransacting] = useState(false);
  const contractRef = useRef<ethers.Contract>();
  const tokenRef = useRef<ethers.Contract>();

  useEffect(() => {
    if (!currentUrl) return;
    async function getEntries() {
      if (!contractRef.current) {
        const provider = new ethers.providers.JsonRpcProvider(config.rpc);
        contractRef.current = new ethers.Contract(
          config.contractAddress,
          ContractArtifact.abi,
          provider
        );
      }
      const entryCount = await contractRef.current.getEntryCount(currentUrl);
      setTotalPages(Math.ceil(entryCount/PAGE_LENGTH));
      const entries: Entry[] = [];
      for(let i = 0; i < PAGE_LENGTH; i ++) {
        const idx = page*PAGE_LENGTH + i;
        if (idx < entryCount) {
          const [bigHash, bigTime] = await contractRef.current.getEntry(currentUrl, idx);
          const arr = ethers.utils.arrayify(bigHash.toHexString());
          const buf = new ArrayBuffer(34);
          const arr2 = new Uint8Array(buf);
          arr2.set([18, 32], 0);
          arr2.set(arr, 2);
          entries.push({ 
            hash: base58(arr2),
            time: (new Date(bigTime.mul(1000).toNumber())).toUTCString()
          });
        }
      }
      setEntries(entries);
    }
    getEntries()
  }, [currentUrl]);

  async function connectWallet() {
    // @ts-ignore window.ethereum
    const ethereum = window.ethereum;
    if (ethereum) {
      await ethereum.enable();
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      tokenRef.current = new ethers.Contract(
        config.linkAddress,
        ERC677.compilerOutput.abi,
        signer
      );
      setWalletConnected(true);
    }
  }

  async function savePage() {
    if (walletConnected && tokenRef.current && currentUrl) {
      const bytes = (new TextEncoder()).encode(currentUrl);
      setTransacting(true);
      try{
        await tokenRef.current.transferAndCall(
          config.contractAddress, 
          LINK,
          bytes
        );
      } catch {}
      setTransacting(false);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        { 
          !currentUrl && !entries && <>
            <h1>DeArchive 📚</h1>
            <p>
              The Decentralized Internet Archive
            </p>
            <form onSubmit={e => {
              e.preventDefault();
              try {
                const normalized = normalizeUrl(url);
                setUrl(normalized);
                setCurrentUrl(normalized);
              } catch {
                setUrl('');
              }
            }}>
              <input
                className="App-input" type="text"
                placeholder="Enter a url..."
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
              <input className="App-input App-input-hover" type="submit" value="Go"/>
            </form>
          </>
        }
        {
          currentUrl && !entries && <div>
            Loading...
          </div>
        }
        {
          currentUrl && entries && <div>
            <Results
              currentUrl={currentUrl}
              entries={entries}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
            <hr />
            <Save
              connectWallet={connectWallet}
              savePage={savePage}
              walletConnected={walletConnected}
              transacting={transacting}
            />
          </div>
        }
      </header>
    </div>
  );
}

export default App;
