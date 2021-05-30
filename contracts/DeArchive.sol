pragma solidity 0.4.24;

import "@chainlink/contracts/src/v0.4/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.4/vendor/Ownable.sol";
import "./interfaces/ERC20Basic.sol";

contract DeArchive is ChainlinkClient, Ownable {
  uint256 constant private ORACLE_PAYMENT = 1 * LINK;

  event RequestDearchiveFulfilled(
    bytes32 indexed requestId,
    uint256 indexed hash
  );

  address oracle;
  string jobId;

  struct Entry {
    uint256 hash;
    uint time;
  }

  mapping(bytes32 => string) requests;
  mapping(string => Entry[]) entries;

  constructor(address _oracle, string _jobId) public Ownable() {
    setPublicChainlinkToken();
    oracle = _oracle;
    jobId = _jobId;
  }

  function getEntryCount(string _url) public view returns (uint256) {
    return entries[_url].length;
  }

  function getEntry(string _url, uint256 _idx) public view returns (uint256, uint) {
    return (entries[_url][_idx].hash, entries[_url][_idx].time);
  }

  function onTokenTransfer(address, uint256, bytes _data)
    external
  {
    ERC20Basic token = ERC20Basic(chainlinkTokenAddress());
    require(token.balanceOf(this) >= 1*LINK);
    string memory _url = string(_data);
    requestDearchive(_url);
  }

  function requestDearchive(string _url)
    internal
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(jobId), this, this.fulfillDearchive.selector);
    req.add("url", _url);
    bytes32 _requestId = sendChainlinkRequestTo(oracle, req, ORACLE_PAYMENT);
    requests[_requestId] = _url;
  }
  
  function fulfillDearchive(bytes32 _requestId, uint256 _hash)
    public
    recordChainlinkFulfillment(_requestId)
  {
    emit RequestDearchiveFulfilled(_requestId, _hash);
    Entry memory _entry;
    _entry.hash = _hash;
    _entry.time = now;
    entries[requests[_requestId]].push(_entry);
  }

  function stringToBytes32(string memory source) private pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly { // solhint-disable-line no-inline-assembly
      result := mload(add(source, 32))
    }
  }
}
