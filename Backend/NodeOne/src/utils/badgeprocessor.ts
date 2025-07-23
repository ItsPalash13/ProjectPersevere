import { UserLevelSession } from '../models/UserLevelSession';
import { UserProfile, UserProfileDocument } from '../models/UserProfile';
import Badge from '../models/Badge';
import mongoose from 'mongoose';

interface UserProfileWithStreak extends UserProfileDocument {
  lastAttemptDate: Date | null;
  dailyAttemptsStreak: number;
}

/**
 * Process the Daily Streak badge for a user after quiz completion.
 * @param userProfile UserProfileDocument (already fetched and up-to-date)
 * @param badge Daily Streak badge document (with badgelevel milestones)
 * @param quizDate Date when the quiz was completed (should be today)
 * @param userLevelSessionId Session ID to tag the badge award
 * @returns Promise<boolean> true if badge was awarded/updated, false otherwise
 */
export async function processDailyStreakBadge(userProfile: UserProfileDocument, badge: any, quizDate: Date, userLevelSessionId: string): Promise<boolean> {
  const profile = userProfile as UserProfileWithStreak;
  let updated = false;
  const lastDate = profile.lastAttemptDate ? new Date(profile.lastAttemptDate) : null;
  const today = new Date(quizDate);
  today.setHours(0,0,0,0);

  console.log('[BadgeProcessor] --- Daily Streak Badge Processing ---');
  console.log('[BadgeProcessor] User:', profile.userId);
  console.log('[BadgeProcessor] Previous lastAttemptDate:', profile.lastAttemptDate);
  console.log('[BadgeProcessor] Today:', today);
  console.log('[BadgeProcessor] Previous dailyAttemptsStreak:', profile.dailyAttemptsStreak);

  // If last attempt is yesterday, increment streak; if today, do nothing; else reset to 1
  if (lastDate) {
    // For testing: use only the day difference, ignoring time and month/year
    const diffDays = today.getDate() - lastDate.getDate();
    console.log('[BadgeProcessor] diffDays (testing, date only):', diffDays);
    if (diffDays === 1) {
      profile.dailyAttemptsStreak += 1;
      console.log('[BadgeProcessor] Streak incremented to:', profile.dailyAttemptsStreak);
    } else if (diffDays === 0) {
      // Already played today, do nothing
      console.log('[BadgeProcessor] Daily Streak: Already played today, no update.');
      return false;
    } else {
      profile.dailyAttemptsStreak = 1;
      console.log('[BadgeProcessor] Streak reset to 1');
    }
  } else {
    profile.dailyAttemptsStreak = 1;
    console.log('[BadgeProcessor] First attempt, streak set to 1');
  }
  profile.lastAttemptDate = today;

  // Check for milestone
  const streak = profile.dailyAttemptsStreak;
  const badgeLevels = badge.badgelevel || [];
  let achievedLevel = -1;
  console.log('[BadgeProcessor] badgeLevels:', JSON.stringify(badgeLevels));
  console.log('[BadgeProcessor] streak:', streak);
  for (let i = badgeLevels.length - 1; i >= 0; i--) {
    console.log(`[BadgeProcessor] Checking milestone: ${badgeLevels[i].milestone} (level ${i})`);
    if (streak >= badgeLevels[i].milestone) {
      achievedLevel = i;
      console.log(`[BadgeProcessor] Milestone achieved: level ${i} (milestone ${badgeLevels[i].milestone})`);
      break;
    }
  }
  console.log('[BadgeProcessor] achievedLevel:', achievedLevel);
  if (achievedLevel >= 0) {
    // Check if this level for this badge and session has already been awarded
    const alreadyAwarded = profile.badges.some(
      b => b.badgeId.toString() === badge._id.toString() && b.level === achievedLevel && b.userLevelSessionId === userLevelSessionId
    );
    if (!alreadyAwarded) {
      profile.badges.push({ badgeId: badge._id, level: achievedLevel, userLevelSessionId, createdAt: new Date() });
      updated = true;
      console.log(`[BadgeProcessor] Appended new Daily Streak badge for user ${profile.userId} at level ${achievedLevel}`);
    } else {
      console.log(`[BadgeProcessor] User ${profile.userId} already has Daily Streak badge at level ${achievedLevel} for this session`);
    }
  } else {
    console.log(`[BadgeProcessor] User ${profile.userId} streak (${streak}) did not reach any milestone.`);
  }
  if (updated) {
    console.log('[BadgeProcessor] UserProfile badges before save:', JSON.stringify(profile.badges, null, 2));
    await profile.save();
    console.log('[BadgeProcessor] UserProfile badges after save:', JSON.stringify(profile.badges, null, 2));
  }
  console.log('[BadgeProcessor] --- End Daily Streak Badge Processing ---');
  return updated;
}

/**
 * Main badge processing function to be called after quiz ends.
 * @param userLevelSessionId string
 */
export async function processBadgesAfterQuiz(userLevelSessionId: string) {
  console.log('[BadgeProcessor] --- processBadgesAfterQuiz ---');
  // Fetch session
  const session = await UserLevelSession.findById(userLevelSessionId);
  if (!session) { console.log('[BadgeProcessor] No session found for', userLevelSessionId); return; }

  // Fetch user profile
  const userProfile = await UserProfile.findOne({ userId: session.userId });
  if (!userProfile) { console.log('[BadgeProcessor] No user profile found for', session.userId); return; }

  // Fetch all badges
  const allBadges = await Badge.find({});

  // Process Daily Streak badge (slug: 'ds_d')
  const dailyStreakBadge = allBadges.find(b => b.badgeslug === 'ds_d');
  if (dailyStreakBadge) {
    console.log(`[BadgeProcessor] Processing Daily Streak badge for user ${userProfile.userId}`);
    await processDailyStreakBadge(userProfile, dailyStreakBadge, new Date(), userLevelSessionId);
  }

  // TODO: Add logic for other badges (Topics Collector, Questions Solved)
  console.log('[BadgeProcessor] --- End processBadgesAfterQuiz ---');
}
