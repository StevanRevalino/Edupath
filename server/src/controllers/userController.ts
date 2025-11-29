import { Request, Response } from "express";
import prisma from "../configs/prisma";

export class UserController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getAllAdmins = this.getAllAdmins.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  // Get all users
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        orderBy: {
          created_at: "desc",
        },
      });

      const transformedUsers = users
        .filter((user) => user.role === "STUDENT")
        .map((user) => ({
          user_id: user.user_id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: user.role,
          kelas: user.kelas,
          created_at: user.created_at,
        }));

      res.status(200).json({
        success: true,
        data: transformedUsers,
        message: "Users retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all admin users
  async getAllAdmins(req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        orderBy: {
          created_at: "desc",
        },
      });

      const admins = users
        .filter((user) => user.role === "ADMIN")
        .map((user) => ({
          user_id: user.user_id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
          created_at: user.created_at,
        }));

      res.status(200).json({
        success: true,
        data: admins,
        message: "Admin users retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const foundUser = await prisma.user.findUnique({
        where: { user_id: id },
      });

      if (!foundUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const user = {
        user_id: foundUser.user_id,
        firstname: foundUser.firstname,
        lastname: foundUser.lastname,
        email: foundUser.email,
        role: foundUser.role,
        kelas: foundUser.kelas,
      };

      res.status(200).json({
        success: true,
        data: user,
        message: "User retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update user
  // Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { user_id: id },
      });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const updated = await prisma.user.update({
        where: { user_id: id },
        data: updateData,
      });

      const updatedUser = {
        user_id: updated.user_id,
        firstname: updated.firstname,
        lastname: updated.lastname,
        email: updated.email,
        role: updated.role,
        kelas: updated.kelas,
      };

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: "User updated successfully",
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const existingUser = await prisma.user.findUnique({
        where: { user_id: id },
      });

      if (!existingUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      await prisma.user.delete({
        where: { user_id: id },
      });

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
