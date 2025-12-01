import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { hashPassword, comparePassword } from '../utils/password';

// ✅ Update Profile
// src/controllers/user.controller.ts

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    // ✅ Destructure new fields
    const { name, bio, theme, notifications } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        bio: bio !== undefined ? bio : undefined,
        theme: theme || undefined,
        notifications: notifications || undefined, // Prisma handles JSON automatically
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        theme: true,           // ✅ Return these
        notifications: true    // ✅ Return these
      }
    });

    res.json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
}


// ✅ Change Password
export async function changePassword(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 1. Get current user hash
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Verify current password
    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // 3. Hash new password and update
    const newHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash }
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
}
