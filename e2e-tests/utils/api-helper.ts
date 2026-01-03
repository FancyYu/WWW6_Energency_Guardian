import axios, { AxiosInstance, AxiosResponse } from "axios";

export class APITestHelper {
  private backend: AxiosInstance;
  private aiAgents: AxiosInstance;
  private storageService: AxiosInstance;

  constructor() {
    this.backend = axios.create({
      baseURL: "http://localhost:3001",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.aiAgents = axios.create({
      baseURL: "http://localhost:8001",
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.storageService = axios.create({
      baseURL: "http://localhost:8002",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Backend API methods
  async createUser(userData: any): Promise<AxiosResponse> {
    return await this.backend.post("/api/users", userData);
  }

  async getUser(userId: string): Promise<AxiosResponse> {
    return await this.backend.get(`/api/users/${userId}`);
  }

  async createEmergency(emergencyData: any): Promise<AxiosResponse> {
    return await this.backend.post("/api/emergencies", emergencyData);
  }

  async getEmergency(emergencyId: string): Promise<AxiosResponse> {
    return await this.backend.get(`/api/emergencies/${emergencyId}`);
  }

  async addGuardian(userId: string, guardianData: any): Promise<AxiosResponse> {
    return await this.backend.post(
      `/api/users/${userId}/guardians`,
      guardianData
    );
  }

  async getGuardians(userId: string): Promise<AxiosResponse> {
    return await this.backend.get(`/api/users/${userId}/guardians`);
  }

  // AI Agents API methods
  async analyzeEmergency(emergencyData: any): Promise<AxiosResponse> {
    return await this.aiAgents.post("/analyze-emergency", emergencyData);
  }

  async getEmergencyRecommendations(
    emergencyId: string
  ): Promise<AxiosResponse> {
    return await this.aiAgents.get(`/recommendations/${emergencyId}`);
  }

  async triggerNotifications(notificationData: any): Promise<AxiosResponse> {
    return await this.aiAgents.post("/notifications/trigger", notificationData);
  }

  async getNotificationStatus(notificationId: string): Promise<AxiosResponse> {
    return await this.aiAgents.get(`/notifications/${notificationId}/status`);
  }

  // Storage Service API methods
  async uploadFile(fileData: any): Promise<AxiosResponse> {
    return await this.storageService.post("/upload", fileData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async getFile(fileHash: string): Promise<AxiosResponse> {
    return await this.storageService.get(`/files/${fileHash}`);
  }

  async storeEncryptedData(data: any): Promise<AxiosResponse> {
    return await this.storageService.post("/encrypted", data);
  }

  async retrieveEncryptedData(dataId: string): Promise<AxiosResponse> {
    return await this.storageService.get(`/encrypted/${dataId}`);
  }

  // Health check methods
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await this.backend.get("/health");
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async checkAIAgentsHealth(): Promise<boolean> {
    try {
      const response = await this.aiAgents.get("/health");
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async checkStorageServiceHealth(): Promise<boolean> {
    try {
      const response = await this.storageService.get("/health");
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Utility methods
  async waitForAPI(
    service: "backend" | "ai-agents" | "storage",
    maxWaitTime: number = 30000
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      let isHealthy = false;

      switch (service) {
        case "backend":
          isHealthy = await this.checkBackendHealth();
          break;
        case "ai-agents":
          isHealthy = await this.checkAIAgentsHealth();
          break;
        case "storage":
          isHealthy = await this.checkStorageServiceHealth();
          break;
      }

      if (isHealthy) {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return false;
  }

  // Authentication helper (if needed)
  setAuthToken(token: string): void {
    this.backend.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    this.aiAgents.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    this.storageService.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.backend.defaults.headers.common["Authorization"];
    delete this.aiAgents.defaults.headers.common["Authorization"];
    delete this.storageService.defaults.headers.common["Authorization"];
  }
}
