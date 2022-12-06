# ENS Optimism Resolver
![CI](https://github.com/ensdomains/offchain-resolver/actions/workflows/main.yml/badge.svg)


This repository contains smart contracts and a node.js serverless gateway that together allow hosting ENS names offchain using [EIP 3668](https://eips.ethereum.org/EIPS/eip-3668) and [ENSIP 10](https://docs.ens.domains/ens-improvement-proposals/ensip-10-wildcard-resolution).

## Overview

ENS resolution requests to the resolver implemented in this repository are responded to with a directive to query a gateway server for the answer. The gateway server generates and signs a response, which is sent back to the original resolver for decoding and verification. Full details of this request flow can be found in EIP 3668.

All of this happens transparently in supported clients (such as ethers.js with the ethers-ccip-read-provider plugin, or future versions of ethers.js which will have this functionality built-in).

## [Serverless Gateway](https://github.com/stevegachau/optimismresover/tree/main/Serverless%20Gateway)

The severless gateway server implements CCIP Read (EIP 3668), and answers requests by looking up the names in a backing store. By default this is a JSON file, but the backend is pluggable and alternate backends can be provided by implementing a simple interface. Once a record is retrieved, it is signed using a user-provided key to assert its validity, and both record and signature are returned to the caller so they can be provided to the contract that initiated the request.

## [Contracts](packages/contracts)

The smart contract provides a resolver stub that implement CCIP Read (EIP 3668) and ENS wildcard resolution (ENSIP 10). When queried for a name, it directs the client to query the gateway server. When called back with the gateway server response, the resolver verifies the signature was produced by an authorised signer, and returns the response to the client.


## Real-world usage

There are 5 main steps to using this in production:

 1. Optionally, write a new backend for the gateway that queries your own data store.
 2. Generate one or more signing keys. Secure these appropriately; posession of the signing keys makes it possible to forge name resolution responses!
 3. Start up a gateway server using your name database and a signing key. Publish it on a publicly-accessible URL.
 4. Deploy `OffchainResolver` to Ethereum, providing it with the gateway URL and list of signing key addresses.
 5. Set the newly deployed resolver as the resolver for one or more ENS names.
