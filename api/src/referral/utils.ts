import * as crypto from 'crypto';

export function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


function ensureKeyLength(secretKey: string): Buffer {
    const keyLength = 32;
    if (secretKey.length < keyLength) {
        return Buffer.concat([Buffer.from(secretKey), Buffer.alloc(keyLength - secretKey.length)]);
    } else if (secretKey.length > keyLength) {
        return Buffer.from(secretKey.slice(0, keyLength));
    }
    return Buffer.from(secretKey);
}

// Function to encrypt user ID with a secret key
export function maskUserId(userId: string, secretKey: string = process.env.JWT_SECRET): string {
    const iv = crypto.randomBytes(16); // Generate a random IV (Initialization Vector)
    const key = ensureKeyLength(secretKey);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(userId, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + encrypted;
}

export function unmaskUserId(maskedUserId: string, secretKey: string = process.env.JWT_SECRET): string | null {
    const iv = Buffer.from(maskedUserId.slice(0, 32), 'hex');
    const encryptedText = maskedUserId.slice(32);
    const key = ensureKeyLength(secretKey);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export function generateReferralCode(userId: string, expirationSeconds: number = 180) {
    const secretKey = process.env.JWT_SECRET;
    const maskedUserId = maskUserId(userId, secretKey);
    const expiration = Date.now() + (expirationSeconds * 1000); // Convert seconds to milliseconds
    const expirationString = expiration.toString(36);
    return { 'refcode': `${maskedUserId}${expirationString}` };
}

export function verifyExpiration(referralCode: string): boolean {
    if (referralCode == null) return false
    try {
        const currentTime = Date.now();
        const expirationString = referralCode.substring(referralCode.length - 8);
        const expirationTime = parseInt(expirationString, 36);
        return expirationTime > currentTime;
    } catch (err) {
        console.log(err)
        return false
    }
}

export function getUserIdFromReferralCode(referralCode: string, secretKey: string = process.env.JWT_SECRET): string | null {
    const maskedUserId = referralCode.substring(0, referralCode.length - 8);
    const originalUserId = unmaskUserId(maskedUserId, secretKey);
    return originalUserId;
}
