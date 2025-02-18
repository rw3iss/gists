import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export function isValidPassword(str) {
    return str ? /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/.test(str) : false;
}

export const tokenFromAuthHeader = (authHeader) => {
    if (authHeader) {
        let token = authHeader.split(" ");
        if (token.length == 2) {
            return token[1];
        }
    }
    return null;
};

// Returns true if valid, false if invalid.
// If returnDecodedObject == true, it will return the decoded object instead of true.
export const decodeToken = (token, returnDecodedPayload = false) => {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    return !!decoded ?
        (returnDecodedPayload ? decoded : true) :
        false;
}

export const makeToken = (payload, expiresIn = '1h') => {
    //console.log(`signing token for`, expiresIn);
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

export const hashPassword = async (password): Promise<string> => {
    return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashedPassword): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

export const getAuthToken = (req) => {

};