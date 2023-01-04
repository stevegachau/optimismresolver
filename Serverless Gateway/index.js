const MongoClient = require('mongodb').MongoClient;
const uri = "........."; //mongodb uri
let client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
const clientPromise = client.connect();


exports.helloWorld = async (req, res) => {

res.set('Access-Control-Allow-Origin', '*');

if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
} 
  
else {


var sender = req.query.sender;
var resolverdata = req.query.data;
const Web3 = require('web3');
const ethers = require('ethers');
const InputDataDecoder = require('ethereum-input-data-decoder');
var domainaddress;
var domaincontract;
var web3;
var mongoaddr;
web3 = new Web3(''); //Optimism RPC url


//ABI to decode the ETH Calldata
const decoderabi = [];
    
const decoder = new InputDataDecoder(decoderabi);


//ABI of the deployed offchainresolver contract on L1 (contract code: https://etherscan.io/address/0x9fb848300e736075ed568147259bf8a8eefe4fef#code)
const Resolver_abi = [];
    
const Resolver = new ethers.utils.Interface(Resolver_abi);


//ABI of the deployed Subdomain NFT on L2 (contract code: https://optimistic.etherscan.io/address/0x9fb848300e736075ed568147259bf8a8eefe4fef#code)
const domainabi = [];



var dataresult = await decoder.decodeData(resolverdata);
var hexname = dataresult.inputs[0];
var data = dataresult.inputs[1];
var utf8 = await web3.utils.hexToUtf8(hexname);
var sliced = utf8.slice(1);
var domain = sliced.replace(/[\x00\x01\x02\x03\x04\x05]/g," ");
var fulldomain = domain.trim().split(/\s+/);

var sub = fulldomain[0];
var tld = fulldomain[1];
var ext = fulldomain[2];

var name = sub+"."+tld+"."+ext;


const privateKey = ""; //privKey of signing address used during contract deploy of resolver contract on l2 
const signer = new ethers.utils.SigningKey(privateKey);

if (tld == "ecc"){ 
  
domainaddress = ""; //subdomain NFT on Optimism. 
web3 = new Web3(''); //optimism RPC url
const account = web3.eth.accounts.wallet.add(privateKey);
web3.eth.defaultAccount = account.address;
domaincontract = new web3.eth.Contract(domainabi, domainaddress, {
    from: '' //from address
    })
}



async function handler(args) {

 if (args.length == 1){ 
   var addr = await domaincontract.methods.resolve(sub).call();
   return { result: [addr] };
 }

 else if (args[1].toString() == 60 ) { 
   var addr = await domaincontract.methods.resolve(sub).call();
   return { result: [addr] };
 }
  
  
 //implement your own custom logic to return offchain ENS records depending on where offchain data is stored.
  
 else if (args[1].toString() == 0 ) { var addr = "0x0000000000000000000000000000000000000000"; return { result: [addr] }; }
 else if (args[1].toString() == 2 ) { var addr = "0x0000000000000000000000000000000000000000"; return { result: [addr] }; }
 else if (args[1].toString() == 3 ) { var addr = "0x0000000000000000000000000000000000000000"; return { result: [addr] }; }
 else if (args[1] == "url") { var addr = ""; return { result: [addr] }; }
 else if (args[1] == "email") { var addr = ""; return { result: [addr] }; }
 else if (args[1] == "avatar") { var addr = ""; return { result: [addr] }; }
 else if (args[1] == "description") { var addr = ""; return { result: [addr] }; }
 else if (args[1] == "notice") { var addr = ""; return { result: [addr] }; }
 else if (args[1] == "keywords") { var addr = ""; return { result: [addr] }; }
 else if (args[1] == "com.discord") { var addr = ""; return { result: [addr] }; }
 else if (args[1] == "com.twitter") { var addr = ""; return { result: [addr] }; }
 else if (args[1] == "com.github") { var addr = ""; return { result: [addr] }; }
 else if (args[1] == "com.reddit") { var addr = ""; return { result: [addr] }; }
 else if (args[1] == "org.telegram") { var addr = ""; return { result: [addr] }; }
 else if (args[1] == "eth.ens.delegate") { var addr = ""; return { result: [addr] }; }
 else {
   console.log(args);
   res.status(200).send();}
};


async function query(name, data){

  const { signature, args } = Resolver.parseTransaction({ data });
  const { result } = await handler(args);

  return {
    result: Resolver.encodeFunctionResult(signature, result),
    validUntil: Math.floor(Date.now() / 1000 ),
  };

}


const { result, validUntil } = await query(name, data);

let messageHash = ethers.utils.solidityKeccak256(
          ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
          [
            '0x1900',
            sender,
            validUntil,
            ethers.utils.keccak256(resolverdata || '0x'),
            ethers.utils.keccak256(result),
          ]
        );


const sig = signer.signDigest(messageHash);
const sigData = ethers.utils.hexConcat([sig.r, sig._vs]);
const returndata = web3.eth.abi.encodeParameters(['bytes','uint64','bytes'], [result, validUntil, sigData]);


res.status(200).send({"data":returndata});
}
}
