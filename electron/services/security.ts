import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { app } from 'electron';

export class SecurityService {
  private static instance: SecurityService;
  private keyDir: string;
  private privateKeyPath: string;
  private publicKeyPath: string;

  private constructor() {
    // We assume app is ready or userData is available
    this.keyDir = path.join(app.getPath('userData'), 'security');
    this.privateKeyPath = path.join(this.keyDir, 'private.pem');
    this.publicKeyPath = path.join(this.keyDir, 'public.pem');
    this.ensureKeysExist();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  private ensureKeysExist() {
    if (!fs.existsSync(this.keyDir)) {
      fs.mkdirSync(this.keyDir, { recursive: true });
    }

    if (!fs.existsSync(this.privateKeyPath) || !fs.existsSync(this.publicKeyPath)) {
      this.generateKeys();
    }
  }

  public generateKeys() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Ensure dir exists
    if (!fs.existsSync(this.keyDir)) {
      fs.mkdirSync(this.keyDir, { recursive: true });
    }

    fs.writeFileSync(this.privateKeyPath, privateKey);
    fs.writeFileSync(this.publicKeyPath, publicKey);
  }

  public getPublicKey(): string {
    if (fs.existsSync(this.publicKeyPath)) {
      return fs.readFileSync(this.publicKeyPath, 'utf-8');
    }
    return '';
  }

  public getPrivateKey(): string {
    // Ideally we don't expose this, but for rotation logic we might need internal access
    if (fs.existsSync(this.privateKeyPath)) {
      return fs.readFileSync(this.privateKeyPath, 'utf-8');
    }
    return '';
  }

  public encrypt(text: string): string {
    if (!text) return '';
    // If already encrypted, return as is
    if (text.startsWith('ENC:')) return text;

    try {
      const publicKey = this.getPublicKey();
      if (!publicKey) throw new Error('No public key');

      const buffer = Buffer.from(text, 'utf-8');
      const encrypted = crypto.publicEncrypt(publicKey, buffer);
      return 'ENC:' + encrypted.toString('base64');
    } catch (e) {
      console.error('Encryption failed', e);
      return text; // Fallback to plaintext if encryption fails to avoid data loss, but log it
    }
  }

  public decrypt(text: string): string {
    if (!text || !text.startsWith('ENC:')) return text;
    try {
      const privateKey = this.getPrivateKey();
      if (!privateKey) throw new Error('No private key');

      const buffer = Buffer.from(text.substring(4), 'base64');
      const decrypted = crypto.privateDecrypt(privateKey, buffer);
      return decrypted.toString('utf-8');
    } catch (e) {
      console.error('Decryption failed', e);
      return text; // Return text (likely cyphertext) if fail
      // The UI will likely show garbage, alerting user to issue.
    }
  }
}
