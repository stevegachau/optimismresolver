const MongoClient = require('mongodb').MongoClient;
const uri = "........."; //mongodb uri

let client;
try {
  client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
} catch (error) {
  console.error(error);
}

let clientPromise;
try {
  clientPromise = client.connect();
} catch (error) {
  console.error(error);
}

exports.helloWorld = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  } 

  const Web3 = require('web3');
  const ethers = require('ethers');
  const InputDataDecoder = require('ethereum-input-data-decoder');

  let domainaddress;
  let domaincontract;
  let web3;
  let mongoaddr;
  try {
    web3 = new Web3(''); //Optimism RPC url
  } catch (error) {
    console.error(error);
  }

  // ABI to decode the ETH Calldata
  const decoderabi = [];

  let decoder;
  try {
    decoder = new InputDataDecoder(decoderabi);
  } catch (error) {
    console.error(error);
  }

  // ABI of the deployed offchainresolver contract on L1 (contract code: https://etherscan.io/address/0x9fb848300e736075ed568147259bf8a8eefe4fef#code)
  const Resolver_abi = [];

  let Resolver;
  try {
    Resolver = new ethers.utils.Interface(Resolver_abi);
  } catch (error) {
    console.error(error);
  }

  // ABI of the deployed Subdomain NFT on L2 (contract code: https://optimistic.etherscan.io/address/0x9fb848300e736075ed568147259bf8a8eefe4fef#code)
  const domainabi = [];

  const sender = req.query.sender;
  const resolverdata = req.query.data;

  let dataresult;
  try {
    dataresult = await decoder.decodeData(resolverdata);
  } catch (error) {
    console.error(error);
  }

  const hexname = dataresult.inputs[0];
  const data = dataresult.inputs[1];

  let utf8;
  try {
    utf8 = await web3.utils.hexToUtf8(hexname);
  } catch (error) {
    console.error(error);
      
    const sliced = utf8.slice(1);
  const domain = sliced.replace(/[\x00\x01\x02\x03\x04\x05]/g," ");
  const fulldomain = domain.trim().split(/\s+/);

  const sub = fulldomain[0];
  const tld = fulldomain[1];
  const ext = fulldomain[2];

  const name = sub+"."+tld+"."+ext;

  const privateKey = ""; // privKey of signing address used during contract deploy of resolver contract
  let signer;
  try {
    signer = new ethers.utils.SigningKey(privateKey);
  } catch (error) {
    console.error(error);
  }

  if (tld == "ecc") { 
    try {
      domainaddress = ""; //subdomain NFT on Optimism. 
      web3 = new Web3(''); //optimism RPC url
      const account = web3.eth.accounts.wallet.add(privateKey);
      web3.eth.defaultAccount = account.address;
      domaincontract = new web3.eth.Contract(domainabi, domainaddress, {
        from: '' //from address
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function handler(args) {
    if (args.length == 1) { 
      let addr;
      try {
        addr = await domaincontract.methods.resolve(sub).call();
      } catch (error) {
        console.error(error);
      }
      return { result: [addr] };
    } else if (args[1].toString() == 60 ) { 
      let addr;
      try {
        addr = await domaincontract.methods.resolve(sub).call();
      } catch (error) {
        console.error(error);
      }
      return { result: [addr] };
    }
  
    // Implement your own custom logic to return offchain ENS records depending on where offchain data is stored.
    else if (args[1].toString() == 0 ) {
      const addr = "0x0000000000000000000000000000000000000000";
      return { result: [addr] };
    } else if (args[1].toString() == 2 ) {
      const addr = "0x0000000000000000000000000000000000000000";
      return { result: [addr] };
    }
    // Add more cases here as needed
    else {
      return { result: [] };
    }
  }

  try {
    const result = await handler(data);
    res.send(result);
  } catch (error) {
    console.error(error);
  }
};

 
