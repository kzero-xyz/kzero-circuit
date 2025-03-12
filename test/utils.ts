import * as fs from 'fs';
import * as snarkjs from 'snarkjs';
const { wtns, groth16 } = snarkjs;

// Helper function to redirect stderr temporarily
const withoutStderr = async (fn: () => Promise<any>) => {
  const stderr = process.stderr.write;
  process.stderr.write = () => true;
  try {
    return await fn();
  } finally {
    process.stderr.write = stderr;
  }
};

export async function generateProof(input: any = null) {
  try {
    const inputJson = input;

    // 1. Generate witness
    console.log("Generating witness...");
    // Redirect stderr temporarily to avoid console.log output the error when generate witness
    try {
      await withoutStderr(async () => {
        await wtns.calculate(inputJson, "zkLogin_js/zkLogin.wasm", "witness.wtns");
      });
      console.log("Witness generated successfully!");
    } catch (witnessError) {
      console.log("Witness generation failed!", witnessError.message);
      return { 
        success: false, 
        error: witnessError.message
      };
    }

    // 2. Generate proof
    console.log("Generating proof...");
    const zkey = fs.readFileSync("zkLogin-test.zkey");
    const witness = fs.readFileSync("witness.wtns");

    const { proof, publicSignals } = await groth16.prove(zkey, witness);
    console.log("Generating proof Successfully!");
    
    // 3. Return the proof and public signals
    return { success: true, proof, publicSignals };
  } catch (error) {
    return { 
      success: false, 
      error: error.message.split('\n')[0]
    };
  }
}

export async function verifyProof(proof: any = null, publicSignals: any = null) {
  try {
    const proofJson = proof;
    const publicJson = publicSignals;

    // Verify the proof
    console.log("Verifying proof...");
    const vkey = JSON.parse(fs.readFileSync("zkLogin-test.vkey", "utf8"));
    const isValid = await groth16.verify(vkey, publicJson, proofJson);
    
    if (isValid) {
      console.log("Verification OK");
    } else {
      console.log("Verification failed! Invalid proof");
    }

    return isValid;
  } catch (error) {
    console.log("Verification failed:", error.message);
    return false;
  }
}
