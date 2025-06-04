import { UserLevelSession } from '../../../models/UserLevelSession';
import { UserInventory } from '../../../models/UserInventory';
import { Powerups } from '../../../models/Powerups';
import mongoose from 'mongoose';
import { logger } from '../../../utils/logger';

export interface PowerupEffect {
  value: number;
  duration?: number;
  optionsToRemove?: number;
}

interface PowerupHandler {
  (userLevelSessionId: string, powerupId: string): Promise<{
    success: boolean;
    message: string;
    effect?: PowerupEffect;
  }>;
}

// Handler for 2x Score Multiplier
const handleScoreMultiplier: PowerupHandler = async (userLevelSessionId: string, powerupId: string) => {
  try {
    const session = await UserLevelSession.findById(userLevelSessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const userInventory = await UserInventory.findOne({ userId: session.userId });
    if (!userInventory) {
      throw new Error('User inventory not found');
    }

    const powerup = await Powerups.findById(powerupId);
    if (!powerup || powerup.type !== 'scoreMultiplier') {
      throw new Error('Invalid powerup');
    }

    // Find the powerup in user's inventory
    const userPowerup = userInventory.powerups.find(p => p.powerupId.toString() === powerupId);
    if (!userPowerup || userPowerup.quantity <= 0) {
      throw new Error('No powerup available');
    }

    // Apply the multiplier
    session.multiplierXp = powerup.effect.value;
    await session.save();

    // Set timeout to revert multiplier after duration
    if (powerup.effect.duration) {
      setTimeout(async () => {
        const currentSession = await UserLevelSession.findById(userLevelSessionId);
        if (currentSession) {
          currentSession.multiplierXp = 1;
          await currentSession.save();
        }
      }, powerup.effect.duration * 1000);
    }

    // Decrease powerup quantity
    //userPowerup.quantity -= 1;
    await userInventory.save();

    return {
      success: true,
      message: 'Score multiplier activated',
      effect: powerup.effect
    };
  } catch (error) {
    logger.error('Error applying score multiplier:', error);
    return {
      success: false,
      message: error.message || 'Failed to apply score multiplier'
    };
  }
};

// Handler for Time Boost
const handleTimeBoost: PowerupHandler = async (userLevelSessionId: string, powerupId: string) => {
  try {
    const session = await UserLevelSession.findById(userLevelSessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const userInventory = await UserInventory.findOne({ userId: session.userId });
    if (!userInventory) {
      throw new Error('User inventory not found');
    }

    const powerup = await Powerups.findById(powerupId);
    if (!powerup || powerup.type !== 'timeBoost') {
      throw new Error('Invalid powerup');
    }

    // Find the powerup in user's inventory
    const userPowerup = userInventory.powerups.find(p => p.powerupId.toString() === powerupId);
    if (!userPowerup) {
      throw new Error('No powerup available');
    
    }
    if (userPowerup.quantity === 0) {
      userInventory.powerups = userInventory.powerups.filter(p => p.powerupId.toString() !== powerupId);
    }

    // Add time to the session
    session.currentTime += powerup.effect.value;
    session.expiresAt = new Date(Date.now() + (session.totalTime - session.currentTime) * 1000);
    await session.save();

    // Decrease powerup quantity
    //userPowerup.quantity -= 1;
    await userInventory.save();

    return {
      success: true,
      message: 'Time boost activated',
      effect: powerup.effect
    };
  } catch (error) {
    logger.error('Error applying time boost:', error);
    return {
      success: false,
      message: error.message || 'Failed to apply time boost'
    };
  }
};

// Powerup type to handler mapping
const powerupHandlers: { [key: string]: PowerupHandler } = {
  'scoreMultiplier': handleScoreMultiplier,
  'timeBoost': handleTimeBoost
};

// Main function to handle powerup usage
export const usePowerup = async (userLevelSessionId: string, powerupId: string) => {
  try {
    const powerup = await Powerups.findById(powerupId);
    if (!powerup) {
      throw new Error('Powerup not found');
    }

    const handler = powerupHandlers[powerup.type];
    if (!handler) {
      throw new Error('Unsupported powerup type');
    }

    return await handler(userLevelSessionId, powerupId);
  } catch (error) {
    logger.error('Error using powerup:', error);
    return {
      success: false,
      message: error.message || 'Failed to use powerup'
    };
  }
};
