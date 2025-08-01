import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from 'mongoose';
import { UserProfile } from "../models/UserProfile";
import { createAuthMiddleware } from "better-auth/api";
import { Userts } from "../models/UserTs";
import { customSession } from "better-auth/plugins";
let auth: ReturnType<typeof betterAuth> | null = null;

export const getAuth = async () => {
    if (!auth) {
        if (!mongoose.connection.db) {
            throw new Error('Database connection not established');
        }
        auth = betterAuth({
            database: mongodbAdapter(mongoose.connection.db),
            emailAndPassword: {    
                enabled: true
            },
            plugins: [
                customSession(async ({ user, session }) => {
                    if (user?.id) {
                      const userProfile = await UserProfile.findOne({ userId: user.id });
                      if (userProfile) {
                        return {
                          user: {
                            ...user,
                            health: userProfile.health,
                            totalCoins: userProfile.totalCoins,
                            dailyAttemptsStreak: userProfile.dailyAttemptsStreak,
                            avatar: userProfile.avatar,
                            avatarBgColor: userProfile?.avatarBgColor || 'blue',
                            onboardingCompleted: userProfile.onboardingCompleted,
                          },
                          session
                        };
                      }
                    }
                    return { user, session };
                }),
            ],
            trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],
            hooks: {
                after: createAuthMiddleware(async (ctx) => {
                    if (ctx.path.startsWith("/sign-up")) {
                        const newSession = ctx.context.newSession;
                        if (newSession) {
                            const { id, name, email } = newSession.user;
                            await UserProfile.create({
                                userId: id,
                                username: name,
                                fullName: name,
                                email: email,
                                dob: new Date(),
                                bio: "",
                            });
                            await Userts.create({
                                userId: id,
                                skill: { mu: 700, sigma: 200 }
                            });
                        }
                    }
                })
            }
        });
    }
    return auth;
};

// Export a function to get the auth instance
export const getAuthInstance = () => {
    if (!auth) {
        throw new Error('Auth not initialized. Call getAuth() first.');
    }
    return auth;
}; 