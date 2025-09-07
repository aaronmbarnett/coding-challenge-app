/**
 * Database seeding script to populate with test data
 * Run with: npm run db:seed
 */

import { db } from './index.js';
import * as table from './schema.js';
import { createId } from '@paralleldrive/cuid2';
import { hashToken } from '../auth/magic-link.js';

export async function seedDatabase() {
  // Only allow seeding in development
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeding is not allowed in production environment');
  }

  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data in reverse dependency order
    await db.delete(table.submissions);
    await db.delete(table.attempts);
    await db.delete(table.challengeTests);
    await db.delete(table.sessions);
    await db.delete(table.challenges);
    await db.delete(table.invitation);
    await db.delete(table.session);
    await db.delete(table.user);

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const [admin] = await db
      .insert(table.user)
      .values({
        email: 'admin@example.com',
        role: 'admin'
      })
      .returning();

    // Create candidate users
    const candidates = await db
      .insert(table.user)
      .values([
        {
          email: 'alice.johnson@example.com',
          role: 'candidate'
        },
        {
          email: 'bob.smith@example.com',
          role: 'candidate'
        },
        {
          email: 'carol.white@example.com',
          role: 'candidate'
        },
        {
          email: 'david.brown@example.com',
          role: 'candidate'
        }
      ])
      .returning();

    console.log(
      `👥 Created ${candidates.length + 1} users (1 admin, ${candidates.length} candidates)`
    );

    // Create sample invitations showing different states
    const sampleToken1 = 'pending-token-64chars-long-enough-for-security-requirements-abc123';
    const sampleToken2 = 'consumed-token-64chars-long-enough-for-security-requirements-def456';
    const sampleToken3 = 'expired-token-64chars-long-enough-for-security-requirements-ghi789';

    const invitations = await db
      .insert(table.invitation)
      .values([
        {
          email: 'pending.invite@example.com',
          tokenHash: hashToken(sampleToken1),
          expiresAt: new Date(Date.now() + 1800000), // Expires in 30 minutes
          consumedAt: null,
          createdBy: admin.id
        },
        {
          email: candidates[0].email, // Alice's email
          tokenHash: hashToken(sampleToken2),
          expiresAt: new Date(Date.now() + 1800000),
          consumedAt: new Date(Date.now() - 3600000 * 24), // Consumed yesterday
          createdBy: admin.id
        },
        {
          email: 'expired.invite@example.com',
          tokenHash: hashToken(sampleToken3),
          expiresAt: new Date(Date.now() - 3600000), // Expired 1 hour ago
          consumedAt: null,
          createdBy: admin.id
        },
        {
          email: 'recent.invite@example.com',
          tokenHash: hashToken('recent-token-64chars-long-enough-for-security-requirements-jkl012'),
          expiresAt: new Date(Date.now() + 3600000 * 2), // Expires in 2 hours
          consumedAt: null,
          createdBy: admin.id
        }
      ])
      .returning();

    console.log(`📧 Created ${invitations.length} sample invitations (pending, consumed, expired)`);

    // Create challenges
    const challenges = await db
      .insert(table.challenges)
      .values([
        {
          title: 'Two Sum',
          descriptionMd: `# Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

## Example
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\``,
          languagesCsv: 'javascript,python,java',
          starterCode: `function twoSum(nums, target) {
    // Your solution here
}`,
          timeLimitSec: 1800 // 30 minutes
        },
        {
          title: 'Reverse String',
          descriptionMd: `# Reverse String

Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with O(1) extra memory.

## Example
\`\`\`
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
\`\`\``,
          languagesCsv: 'javascript,python,java,go',
          starterCode: `function reverseString(s) {
    // Your solution here
}`,
          timeLimitSec: 900 // 15 minutes
        },
        {
          title: 'Valid Palindrome',
          descriptionMd: `# Valid Palindrome

A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.

## Example
\`\`\`
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
\`\`\``,
          languagesCsv: 'javascript,python',
          starterCode: `function isPalindrome(s) {
    // Your solution here
}`,
          timeLimitSec: 1200 // 20 minutes
        },
        {
          title: 'Binary Tree Traversal',
          descriptionMd: `# Binary Tree Inorder Traversal

Given the \`root\` of a binary tree, return the inorder traversal of its nodes' values.

## Example
\`\`\`
Input: root = [1,null,2,3]
Output: [1,3,2]
\`\`\``,
          languagesCsv: 'javascript,python,java',
          starterCode: null,
          timeLimitSec: 2700 // 45 minutes
        }
      ])
      .returning();

    console.log(`🧩 Created ${challenges.length} challenges`);

    // Create test cases for challenges
    const testCasesData = [
      // Two Sum test cases
      {
        challengeId: challenges[0].id,
        kind: 'io' as const,
        input: '[2,7,11,15], 9',
        expectedOutput: '[0,1]',
        weight: 1,
        hidden: 0
      },
      {
        challengeId: challenges[0].id,
        kind: 'io' as const,
        input: '[3,2,4], 6',
        expectedOutput: '[1,2]',
        weight: 1,
        hidden: 1
      },
      {
        challengeId: challenges[0].id,
        kind: 'io' as const,
        input: '[3,3], 6',
        expectedOutput: '[0,1]',
        weight: 1,
        hidden: 1
      },

      // Reverse String test cases
      {
        challengeId: challenges[1].id,
        kind: 'io' as const,
        input: '["h","e","l","l","o"]',
        expectedOutput: '["o","l","l","e","h"]',
        weight: 1,
        hidden: 0
      },
      {
        challengeId: challenges[1].id,
        kind: 'io' as const,
        input: '["H","a","n","n","a","h"]',
        expectedOutput: '["h","a","n","n","a","H"]',
        weight: 1,
        hidden: 1
      },

      // Valid Palindrome test cases
      {
        challengeId: challenges[2].id,
        kind: 'io' as const,
        input: '"A man, a plan, a canal: Panama"',
        expectedOutput: 'true',
        weight: 2,
        hidden: 0
      },
      {
        challengeId: challenges[2].id,
        kind: 'io' as const,
        input: '"race a car"',
        expectedOutput: 'false',
        weight: 1,
        hidden: 1
      }
    ];

    await db.insert(table.challengeTests).values(testCasesData);
    console.log(`🧪 Created ${testCasesData.length} test cases`);

    // Create exam sessions
    const sessionsData = [
      {
        candidateId: candidates[0].id,
        totalDurationSec: 7200, // 2 hours
        status: 'submitted' as const,
        startedAt: new Date(Date.now() - 3600000 * 25), // Started 25 hours ago
        endsAt: new Date(Date.now() - 3600000 * 23) // Ended 23 hours ago
      },
      {
        candidateId: candidates[1].id,
        totalDurationSec: 5400, // 1.5 hours
        status: 'active' as const,
        startedAt: new Date(Date.now() - 1800000), // Started 30 minutes ago
        endsAt: new Date(Date.now() + 3000000) // Ends in 50 minutes
      },
      {
        candidateId: candidates[2].id,
        totalDurationSec: 3600, // 1 hour
        status: 'pending' as const
      },
      {
        candidateId: candidates[3].id,
        totalDurationSec: 7200, // 2 hours
        status: 'expired' as const,
        startedAt: new Date(Date.now() - 3600000 * 10), // Started 10 hours ago
        endsAt: new Date(Date.now() - 3600000 * 8) // Should have ended 8 hours ago
      }
    ];

    const sessions = await db.insert(table.sessions).values(sessionsData).returning();
    console.log(`📝 Created ${sessions.length} exam sessions`);

    // Create attempts for sessions
    const attemptsData = [
      // Alice's completed session attempts
      {
        sessionId: sessions[0].id,
        challengeId: challenges[0].id, // Two Sum
        status: 'submitted' as const,
        startedAt: new Date(Date.now() - 3600000 * 25),
        submittedAt: new Date(Date.now() - 3600000 * 24.5),
        testRunCount: 3,
        lastTestRunAt: new Date(Date.now() - 3600000 * 24.5)
      },
      {
        sessionId: sessions[0].id,
        challengeId: challenges[1].id, // Reverse String
        status: 'submitted' as const,
        startedAt: new Date(Date.now() - 3600000 * 24.3),
        submittedAt: new Date(Date.now() - 3600000 * 24),
        testRunCount: 2,
        lastTestRunAt: new Date(Date.now() - 3600000 * 24)
      },

      // Bob's active session attempts
      {
        sessionId: sessions[1].id,
        challengeId: challenges[0].id, // Two Sum
        status: 'in_progress' as const,
        startedAt: new Date(Date.now() - 1800000), // Started 30 min ago
        testRunCount: 5,
        lastTestRunAt: new Date(Date.now() - 300000) // Last run 5 min ago
      },
      {
        sessionId: sessions[1].id,
        challengeId: challenges[2].id, // Valid Palindrome
        status: 'locked' as const,
        testRunCount: 0
      },

      // David's expired session attempts
      {
        sessionId: sessions[3].id,
        challengeId: challenges[0].id, // Two Sum
        status: 'submitted' as const,
        startedAt: new Date(Date.now() - 3600000 * 10),
        submittedAt: new Date(Date.now() - 3600000 * 9.5),
        testRunCount: 8,
        lastTestRunAt: new Date(Date.now() - 3600000 * 9.5)
      }
    ];

    const attempts = await db.insert(table.attempts).values(attemptsData).returning();
    console.log(`⚡ Created ${attempts.length} challenge attempts`);

    // Create some sample submissions
    const submissionsData = [
      {
        attemptId: attempts[0].id,
        code: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
        language: 'javascript',
        judge0Id: 'mock-judge0-' + createId(),
        passed: 3,
        total: 3,
        stdout: 'All tests passed!',
        timeMs: 145
      },
      {
        attemptId: attempts[1].id,
        code: `function reverseString(s) {
    let left = 0;
    let right = s.length - 1;
    while (left < right) {
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
}`,
        language: 'javascript',
        judge0Id: 'mock-judge0-' + createId(),
        passed: 2,
        total: 2,
        stdout: 'All tests passed!',
        timeMs: 89
      },
      {
        attemptId: attempts[4].id,
        code: `function twoSum(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}`,
        language: 'javascript',
        judge0Id: 'mock-judge0-' + createId(),
        passed: 3,
        total: 3,
        stdout: 'All tests passed!',
        timeMs: 234
      }
    ];

    await db.insert(table.submissions).values(submissionsData);
    console.log(`💾 Created ${submissionsData.length} code submissions`);

    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Users: ${candidates.length + 1} (1 admin, ${candidates.length} candidates)`);
    console.log(`   Invitations: ${invitations.length} (pending, consumed, expired)`);
    console.log(`   Challenges: ${challenges.length}`);
    console.log(`   Test Cases: ${testCasesData.length}`);
    console.log(`   Sessions: ${sessions.length}`);
    console.log(`   Attempts: ${attempts.length}`);
    console.log(`   Submissions: ${submissionsData.length}`);
    console.log('');
    console.log('🚀 You can now explore the app with realistic test data!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await seedDatabase();
  process.exit(0);
}
