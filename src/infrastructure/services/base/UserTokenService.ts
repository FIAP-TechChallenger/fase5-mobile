import AsyncStorage from "@react-native-async-storage/async-storage";

export class UserTokenService {
  private static instance: UserTokenService;

  static getInstance() {
    if (!UserTokenService.instance) {
      UserTokenService.instance = new UserTokenService();
    }
    return UserTokenService.instance;
  }

  async set(token: string) {
    await AsyncStorage.setItem("userToken", token);
  }

  async get(): Promise<string | null> {
    return await AsyncStorage.getItem("userToken");
  }

  async clear() {
    await AsyncStorage.removeItem("userToken");
  }
}
