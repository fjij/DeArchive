import React from 'react';

interface Entry {
  hash: string;
  time: string;
}

interface ResultsProps {
  currentUrl: string;
  entries: Entry[];
  page: number;
  setPage: (a: (page: number) => number) => void;
  totalPages: number;
}

export function Results({ currentUrl, entries, page, totalPages, setPage}: ResultsProps) {
  return (
    <div>
      <h3><a href={currentUrl} className="App-link">{currentUrl}</a></h3>
      {
        entries.map(entry => <div className="App-entry" key={entry.time}>
          {entry.time}
          <div className="App-entry-body">
            {'ipfs://'+entry.hash}
            <br />
            <a className="App-link" href={'https://cloudflare-ipfs.com/ipfs/'+entry.hash}>
              Cloudflare
            </a>
          </div>
        </div>)
      }
      {
        entries.length === 0 && <small>
          {'This page hasn\'t been archived yet.'}
        </small>
      }
      { 
        entries.length > 0 && <>
          <p>
            Page {page + 1}/{totalPages}
          </p>
          <p>
            <button className="App-input" disabled={page <= 0}
            onClick={() => {
              setPage(page => page - 1);
            }}>⬅</button>

            <button className="App-input" disabled={page >= totalPages - 1}
            onClick={() => {
              setPage(page => page + 1);
            }}>➡</button>
          </p>
        </>
      }
    </div>
  );
}
