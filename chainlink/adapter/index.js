const { Requester, Validator } = require('@chainlink/external-adapter');
const IPFS = require('ipfs-core');
const axios = require('axios');

let ipfs;
IPFS.create()
  .then(res => ipfs = res)
  .catch(() => process.exit(1));

const customParams = { url: ['url'] };

const createRequest = async (input, callback) => {
  // validate chainlink request data
  const validator = new Validator(callback, input, customParams);
  const jobRunID = validator.validated.id;
  const url = validator.validated.data.url;
  const config = { url, responseType: 'text' };

  // performs api calls
  Requester.request(config)
    .then(async res => {
      while(!ipfs) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      try {
        const { cid } = await ipfs.add(res.data);
        console.log(cid.bytes.slice(2));
        let str = '0x';
        cid.bytes.slice(2).forEach(b => str += b.toString(16).padStart(2, '0'));
        res.data = {
          result: str
        };
        callback(res.status, Requester.success(jobRunID, res));
      } catch (error) {
        callback(500, Requester.errored(jobRunID, error));
      }
    })
    .catch(error => callback(500, Requester.errored(jobRunID, error)));
}

// GCP
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// AWS Lambda
exports.handler = (event, _context, callback) => {
  createRequest(event, (_statusCode, data) => {
    callback(null, data)
  })
}

// newer AWS Lambda
exports.handlerv2 = (event, _context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// for testing
module.exports.createRequest = createRequest
