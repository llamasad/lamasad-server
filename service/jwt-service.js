import jwt from 'jsonwebtoken';
function decodeToken(token) {
    try {
        const decoded = jwt.decode(token);
        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error.message);
    }
}
export default decodeToken;
