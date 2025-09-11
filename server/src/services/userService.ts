import { UserRepository } from "../repositories/userRepository";
import { UserResponse, UpdateUserDTO } from "../types/index";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(): Promise<UserResponse[]> {
    try {
      const users = await this.userRepository.findAllUsers();

      // Transform data to match frontend expectations
      const transformedUsers: UserResponse[] = users.map((user: any) => ({
        user_id: user.user_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        kelas: user.kelas ? this.convertKelasToString(user.kelas) : null,
        created_at: user.created_at,
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
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return null;
      }

      return {
        user_id: user.user_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        kelas: user.kelas ? this.convertKelasToString(user.kelas) : null,
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
      const updatedUser = await this.userRepository.updateUser(userId, data);

      return {
        user_id: updatedUser.user_id,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        email: updatedUser.email,
        role: updatedUser.role,
        kelas: updatedUser.kelas
          ? this.convertKelasToString(updatedUser.kelas)
          : null,
      };
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw new Error("Failed to update user");
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.userRepository.deleteUser(userId);
    } catch (error) {
      console.error("Error in deleteUser:", error);
      throw new Error("Failed to delete user");
    }
  }

  private convertKelasToString(kelas: number): string {
    // Convert numeric kelas to readable format
    // Simple mapping: 10 = X, 11 = XI, 12 = XII
    const kelasMap: { [key: number]: string } = {
      10: "X",
      11: "XI",
      12: "XII",
    };

    return kelasMap[kelas] || `Kelas ${kelas}`;
  }
}
