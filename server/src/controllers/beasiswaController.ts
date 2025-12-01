import { Request, Response } from "express";
import prisma from "../configs/prisma";

// Get all beasiswa
export const getAllBeasiswa = async (req: Request, res: Response) => {
  try {
    const beasiswa = await prisma.beasiswa.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: beasiswa,
    });
  } catch (error: any) {
    console.error("Error fetching beasiswa:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch beasiswa data",
      error: error.message,
    });
  }
};

// Get beasiswa by ID
export const getBeasiswaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const beasiswa = await prisma.beasiswa.findUnique({
      where: {
        beasiswa_id: id,
      },
    });

    if (!beasiswa) {
      return res.status(404).json({
        success: false,
        message: "Beasiswa not found",
      });
    }

    res.status(200).json({
      success: true,
      data: beasiswa,
    });
  } catch (error: any) {
    console.error("Error fetching beasiswa:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch beasiswa",
      error: error.message,
    });
  }
};

// Create new beasiswa
export const createBeasiswa = async (req: Request, res: Response) => {
  try {
    const { title, image_url, link } = req.body;

    if (!title || !image_url || !link) {
      return res.status(400).json({
        success: false,
        message: "Title, image URL, and link are required",
      });
    }

    const newBeasiswa = await prisma.beasiswa.create({
      data: {
        title,
        image_url,
        link,
      },
    });

    // Send notification to all students
    try {
      const students = await prisma.user.findMany({
        where: {
          role: "STUDENT",
        },
        select: {
          user_id: true,
        },
      });

      // Create notifications for all students
      const notifications = students.map((student) => ({
        user_id: student.user_id,
        type: "BEASISWA_NEW",
        title: "Beasiswa Baru Tersedia!",
        message: `Beasiswa baru "${title}" telah ditambahkan. Cek sekarang!`,
        related_id: newBeasiswa.beasiswa_id,
        link: `/user/beasiswa`,
      }));

      await prisma.notification.createMany({
        data: notifications,
      });

      console.log(`Sent beasiswa notification to ${students.length} students`);
    } catch (notifError: any) {
      console.error("Error sending beasiswa notifications:", notifError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: "Beasiswa created successfully",
      data: newBeasiswa,
    });
  } catch (error: any) {
    console.error("Error creating beasiswa:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create beasiswa",
      error: error.message,
    });
  }
};

// Update beasiswa
export const updateBeasiswa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, image_url, link } = req.body;

    const beasiswa = await prisma.beasiswa.update({
      where: {
        beasiswa_id: id,
      },
      data: {
        ...(title && { title }),
        ...(image_url && { image_url }),
        ...(link && { link }),
      },
    });

    if (!beasiswa) {
      return res.status(404).json({
        success: false,
        message: "Beasiswa not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beasiswa updated successfully",
      data: beasiswa,
    });
  } catch (error: any) {
    console.error("Error updating beasiswa:", error);

    if (error.message === "Beasiswa not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update beasiswa",
      error: error.message,
    });
  }
};

// Delete beasiswa
export const deleteBeasiswa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const beasiswa = await prisma.beasiswa.delete({
      where: {
        beasiswa_id: id,
      },
    });

    if (!beasiswa) {
      return res.status(404).json({
        success: false,
        message: "Beasiswa not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Beasiswa deleted successfully",
      data: beasiswa,
    });
  } catch (error: any) {
    console.error("Error deleting beasiswa:", error);

    if (error.message === "Beasiswa not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete beasiswa",
      error: error.message,
    });
  }
};
