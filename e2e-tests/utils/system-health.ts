import axios from "axios";

export class SystemHealthChecker {
  private readonly services = [
    { name: "Frontend", url: "http://localhost:3000", timeout: 5000 },
    { name: "Backend", url: "http://localhost:3001/health", timeout: 5000 },
    { name: "AI Agents", url: "http://localhost:8001/health", timeout: 10000 },
    {
      name: "Storage Service",
      url: "http://localhost:8002/health",
      timeout: 5000,
    },
    { name: "IPFS", url: "http://localhost:5001/api/v0/id", timeout: 5000 },
  ];

  async checkAllServices(): Promise<boolean> {
    console.log("🔍 Checking system health...");

    const results = await Promise.allSettled(
      this.services.map((service) => this.checkService(service))
    );

    let allHealthy = true;
    results.forEach((result, index) => {
      const service = this.services[index];
      if (result.status === "fulfilled" && result.value) {
        console.log(`✅ ${service.name}: Healthy`);
      } else {
        console.log(`❌ ${service.name}: Unhealthy`);
        if (result.status === "rejected") {
          console.log(`   Error: ${result.reason.message}`);
        }
        allHealthy = false;
      }
    });

    return allHealthy;
  }

  private async checkService(service: {
    name: string;
    url: string;
    timeout: number;
  }): Promise<boolean> {
    try {
      const response = await axios.get(service.url, {
        timeout: service.timeout,
        validateStatus: (status) => status < 500, // Accept 4xx as "healthy" but not 5xx
      });

      // Special handling for different services
      if (service.name === "Frontend") {
        // For frontend, just check if we get any response
        return response.status < 500;
      } else if (service.name === "IPFS") {
        // For IPFS, check if we get a valid ID response
        return response.status === 200 && response.data && response.data.ID;
      } else {
        // For backend services, expect 200 status
        return response.status === 200;
      }
    } catch (error) {
      return false;
    }
  }

  async waitForService(
    serviceName: string,
    maxWaitTime: number = 60000
  ): Promise<boolean> {
    const service = this.services.find((s) => s.name === serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitTime) {
      if (await this.checkService(service)) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    return false;
  }

  async getSystemStatus(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};

    for (const service of this.services) {
      status[service.name] = await this.checkService(service);
    }

    return status;
  }
}
