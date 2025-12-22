#!/usr/bin/env npx tsx
/**
 * Password Reset Script for Content Cat
 * Run with: pnpm reset-password
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import readline from "readline";

const prisma = new PrismaClient();
const PBKDF2_ITERATIONS = 310000;

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("\n🔐 Content Cat Password Reset\n");

  // List all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });

  if (users.length === 0) {
    console.log("No users found. Run the app and create an account first.\n");
    process.exit(0);
  }

  console.log("Existing users:");
  users.forEach((user, index) => {
    console.log(
      `  ${index + 1}. ${user.email} ${user.name ? `(${user.name})` : ""} [${user.role}]`
    );
  });
  console.log();

  // Get email
  const emailInput = await prompt("Enter email to reset (or number from list): ");

  let email: string;
  const num = parseInt(emailInput);
  if (!isNaN(num) && num >= 1 && num <= users.length) {
    email = users[num - 1].email;
  } else {
    email = emailInput;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`\n❌ User not found: ${email}\n`);
    process.exit(1);
  }

  // Get new password
  const newPassword = await prompt("Enter new password: ");

  if (newPassword.length < 8) {
    console.log("\n❌ Password must be at least 8 characters\n");
    process.exit(1);
  }

  // Hash and update
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { email },
    data: { passwordHash },
  });

  // Invalidate all sessions for this user
  await prisma.session.deleteMany({
    where: { userId: user.id },
  });

  console.log(`\n✅ Password reset for ${email}`);
  console.log("   All existing sessions have been invalidated.\n");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
