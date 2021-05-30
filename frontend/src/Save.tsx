import React from 'react';

interface SaveProps {
  connectWallet: () => void;
  savePage: () => void;
  walletConnected: boolean;
  transacting: boolean;
}

export function Save({ connectWallet, walletConnected, savePage, transacting }: SaveProps) {
  return (
    <div>
      <h3>Add to Archive</h3>
      <p>
        { walletConnected ?
            (
              transacting ?
              'Transaction processing...'
              :
              <button className="App-input" onClick={savePage}>Pay 1 LINK</button>
            )
            :
          <button className="App-input" onClick={connectWallet}>
            Connect Wallet
          </button>
        }
      </p>
    </div>
  );
}
