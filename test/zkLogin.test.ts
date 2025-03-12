import 'mocha';
import { expect } from 'chai';
import { generateProof, verifyProof } from './utils';
import { sampleInput1, sampleInput2_1, sampleInput2_2, sampleInput2_3, sampleInput2_4, sampleInput3 } from './fixtures/sample'; 

describe('zkLogin Circuit Tests', () => {
  describe('1. Valid Input Tests', () => {
    let result;
    
    before(async () => {
      result = await generateProof(sampleInput1);
      expect(result.success).to.be.true;
    });
      
    it('1.1 should generate and verify proof with valid input', async () => {
      expect(result.proof).to.exist;
      expect(result.publicSignals).to.exist;

      const isValid = await verifyProof(result.proof, result.publicSignals);
      expect(isValid).to.be.true;
    });
    it('1.2 should generate and verify success, but verify failed with wrong public signals', async () => {
      expect(result.proof).to.exist;
      expect(result.publicSignals).to.exist;

      let invalidPublicSignals  = ['123456']
      const isValid = await verifyProof(result.proof, invalidPublicSignals);
      expect(isValid).to.be.false;
    });
  });

  describe('2. JWT Nonce Tests', () => {
    it('2.1 should fail with wrong ephemeral public key', async () => {
      const result = await generateProof(sampleInput2_1);
      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });

    it('2.2 should fail with wrong max epoch', async () => {
      const result = await generateProof(sampleInput2_2);
      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });

    it('2.3 should fail with wrong jwt randomness', async () => {
      const result = await generateProof(sampleInput2_3);
      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });

    it('2.4 should fail when nonce field is missing', async () => {
      const result = await generateProof(sampleInput2_4);
      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });
  });

  describe('3. JWT Signature Tests', () => {
    it('should fail with wrong JWT signature', async () => {
      const result = await generateProof(sampleInput3);
      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });
  });
}); 