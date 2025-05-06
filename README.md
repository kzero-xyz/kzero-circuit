# Kzero-Circuit
## Background
This is a zero-knowledge circuit implementation for Kzero that checks zkLogin related restrictions. The circuit validates JWT signatures and claims while preserving privacy. Specifically, it:

1. Verifies RSA signatures of JWTs;
2. Validates JWT structure and claims;
3. Computes a deterministic address seed from the key claim, while keeping sensitive JWT contents private;
4. Some other checks...

The circuit reveals minimal information to verifiers - only a hash of essential public inputs which is then be verified by the verifier on-chain.


## Setup 
To run in command line, you need to install the following dependencies in this section.
### Install dependencies
You need several dependencies in your system to run circom and its associated tools.

The core tool is the circom compiler which is written in Rust. To have Rust available in your system, you can install rustup. If you're using Linux or macOS, open a terminal and enter the following command:
```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```
### Install circom & snarkjs
```bash
git clone https://github.com/iden3/circom.git
cargo build --release
cargo install --path circom
npm install -g snarkjs
```

### Download the zkey
To generate a zero-knowledge proof, you need a zkey file. We provide a test-zkey file as `zkLogin-test.zkey`. You should download it and put it in the root directory of this project(same directory as `zkLogin-test.vkey`).
> Google Drive: https://drive.google.com/file/d/1Pxr8HK7oRhfO1HLtN7rmO6q5NU7pHcUg/view?usp=sharing

## Demo Usage(Command Line)
### Yarn 
Yarn first, to install all needed dependencies.
```bash
yarn 
```

### Compile the circuit
```bash
circom circuits/zkLogin.circom --r1cs --wasm --sym --c
```
If everything goes well, you should see the following files generated:
```bash
Written successfully: ./zkLogin.r1cs
Written successfully: ./zkLogin.sym
Written successfully: ./zkLogin_cpp/zkLogin.cpp and ./zkLogin_cpp/zkLogin.dat
Written successfully: ./zkLogin_cpp/main.cpp, circom.hpp, calcwit.hpp, calcwit.cpp, fr.hpp, fr.cpp, fr.asm and Makefile
Written successfully: ./zkLogin_js/zkLogin.wasm
Everything went okay
```

### Generate the witness
Now you should add your zkLogin input in `input.json` and run the following command to generate the witness:
> We provide a sample input in `input.json`, you can use it as test directly.
```bash
node zkLogin_js/generate_witness.js zkLogin_js/zkLogin.wasm circuits/input.json witness.wtns
```
If everything goes well, you should see the 'witness.wtns' file generated.

### Generate the proof
Now, we should use a zkey file to generate the proof. We provide a test-zkey file in `zkLogin-test.zkey`.
Run the following command to generate the proof(`proof.json`) and public(`public.json`):
```bash
snarkjs groth16 prove zkLogin-test.zkey witness.wtns proof.json public.json
```
If everything goes well, you should see the 'proof.json' and 'public.json' files generated.

### Verify the proof
Now, we should verify the proof. We provide a test-verifier.
Run the following command to verify the proof:
```bash
snarkjs groth16 verify zkLogin-test.vkey public.json proof.json
```
If everything goes well, you should see the following output:
```bash
[INFO]  snarkJS: OK!
```
## Test
For testing, we provide a ts script that can be used to test the circuit which provides some common test cases:
1. Test a valid input;
   - 1.1 Valid input;
   - 1.2 Wrong public signals should verify failed;
2. Test a input with wrong JWT Nonce;
   - 2.1 Wrong eph_public_key in JWT Nonce;
    - 2.2 Wrong max_epoch in JWT Nonce;
    - 2.3 Wrong jwt_randomness in JWT Nonce;
    - 2.4 Miss nonce field
3. Test a input with wrong JWT Signature;

Before run the test, please make sure you have already compiled the circuit via `circom circuits/zkLogin.circom --r1cs --wasm --sym --c`
```bash
npm test
```


