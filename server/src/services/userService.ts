import { userRepository } from "../repositories/userRepository";

interface UserResponse {
  id: string;
  nama: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  kelas: string | null;
  createdAt: string;
}

export class UserService {
  async getAllUsers(): Promise<UserResponse[]> {
    try {
      const users = await userRepository.findAllUsers();

      // Transform data to match frontend expectations
      const transformedUsers: UserResponse[] = users.map((user: any) => ({
        id: user.user_id,
        nama: `${user.firstname} ${user.lastname}`.trim(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        kelas: user.kelas ? this.convertKelasToString(user.kelas) : null,
        createdAt: user.created_at.toISOString(),
      }));

      // Filter only students for the admin dashboard
      return transformedUsers.filter((user) => user.role === "STUDENT");
    } catch (error) {
      console.error("Error in getUsersService:", error);
      throw new Error("Failed to fetch users");
    }
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        return null;
      }

      return {
        id: user.user_id,
        nama: `${user.firstname} ${user.lastname}`.trim(),
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        kelas: user.kelas ? this.convertKelasToString(user.kelas) : null,
        createdAt: user.created_at.toISOString(),
      };
    } catch (error) {
      console.error("Error in getUserById:", error);
      throw new Error("Failed to fetch user");
    }
  }

  async updateUser(
    userId: string,
    data: {
      firstname?: string;
      lastname?: string;
      email?: string;
      kelas?: number;
    }
  ): Promise<UserResponse> {
    try {
      const updatedUser = await userRepository.updateUser(userId, data);

      return {
        id: updatedUser.user_id,
        nama: `${updatedUser.firstname} ${updatedUser.lastname}`.trim(),
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        role: updatedUser.role,
        kelas: updatedUser.kelas
          ? this.convertKelasToString(updatedUser.kelas)
          : null,
        createdAt: updatedUser.created_at.toISOString(),
      };
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw new Error("Failed to update user");
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await userRepository.deleteUser(userId);
    } catch (error) {
      console.error("Error in deleteUser:", error);
      throw new Error("Failed to delete user");
    }
  }

  private convertKelasToString(kelas: number): string {
    // Convert numeric kelas to readable format
    // Assuming kelas numbering system:
    // 10 = X, 11 = XI, 12 = XII
    // And additional numbers for different classes (IPA/IPS)
    const kelasMap: { [key: number]: string } = {
      // Kelas X
      101: "X IPA 1",
      102: "X IPA 2",
      103: "X IPS 1",
      104: "X IPS 2",
      // Kelas XI
      111: "XI IPA 1",
      112: "XI IPA 2",
      113: "XI IPS 1",
      114: "XI IPS 2",
      // Kelas XII
      121: "XII IPA 1",
      122: "XII IPA 2",
      123: "XII IPS 1",
      124: "XII IPS 2",
    };

    return kelasMap[kelas] || `Kelas ${kelas}`;
  }
}

export const userService = new UserService();
