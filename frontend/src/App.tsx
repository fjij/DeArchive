import React, { useState, useRef } from 'react';
import './App.css';
import normalizeUrl from 'normalize-url';
import { Results } from './Results.tsx';
import { Save } from './Save.tsx';
import { ethers } from 'ethers';

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
  /* https://rinkeby.infura.io/v3/undefined */
  const provider = useRef<ethers.providers.Web3Provider>();
  const signer = useRef<ethers.Signer>();

  async function connectWallet() {
    // @ts-ignore window.ethereum
    if (window.ethereum) {
      // @ts-ignore window.ethereum
      provider.current = new ethers.providers.Web3Provider(window.ethereum);
      signer.current = provider.current.getSigner();
      setWalletConnected(true);
    }
  }

  async function savePage() {
  }

  return (
    <div className="App">
      <header className="App-header">
        { 
          !currentUrl && !entries && <>
            <h1>DeArchive 📚</h1>
            <p>
              The Decentralized Website Archive
            </p>
            <form onSubmit={e => {
              e.preventDefault();
              try {
                const normalized = normalizeUrl(url);
                setUrl(normalized);
                setCurrentUrl(normalized);
                setEntries([
                  {
                    hash: 'QmTKVcRtbWjJqVMUVhN1Yda3x2oikSHTEjznNHwDVi9kzf',
                    time: '2021-01-22 8:45am'
                  },
                  {
                    hash: 'QmTKVcRtbWjJqVMUVhN1Yda3x2oikSHTEjznNHwDVi9kzf',
                    time: '2020-01-22 8:27am'
                  },
                ]);
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
            />
          </div>
        }
      </header>
    </div>
  );
}

export default App;
