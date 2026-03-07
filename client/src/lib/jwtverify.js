import { env } from "$env/dynamic/private";
import jwt from "jsonwebtoken";

const JWT_SECRET = env.JWT_SECRET

export function verifyToken(request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader) {
            return { success: false, message: "Token missing" };
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET);

        return {
            success: true,
            user: decoded
        };

    } catch (error) {
        return {
            success: false,
            message: "Invalid or expired token"
        };
    }
}