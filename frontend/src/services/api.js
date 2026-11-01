import { API_BASE_URL, MOCK_MODE } from "../utils/constants";
import mockApi from "./mockApi";

const isMockMode = MOCK_MODE;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.mock = mockApi;
  }

  async request(endpoint, options = {}) {
    if (isMockMode) {
      return this.mock.request(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    let response;
    try {
      response = await fetch(url, config);
    } catch (error) {
      throw new Error(`Unable to reach auction API at ${url}: ${error.message}`);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(
        response.ok
          ? "Auction API returned an invalid JSON response."
          : `Request failed with status ${response.status}`,
      );
    }

    if (!response.ok) {
      throw new Error(data?.error || `Request failed with status ${response.status}`);
    }

    if (!data || typeof data !== "object" || typeof data.success !== "boolean") {
      throw new Error("Auction API returned an invalid response envelope.");
    }

    return data;
  }

  getAuction() {
    return this.request("/auction");
  }

  createAuction(data) {
    return this.request("/auction", {
      method: "POST",
      body: data,
    });
  }

  placeBid(data) {
    return this.request("/bids", {
      method: "POST",
      body: data,
    });
  }

  getBids() {
    return this.request("/bids");
  }

  closeAuction() {
    return this.request("/auction/close", {
      method: "POST",
    });
  }

  runPriceStrategy() {
    return this.request("/strategy/price", {
      method: "POST",
    });
  }

  runUtilityStrategy() {
    return this.request("/strategy/utility", {
      method: "POST",
    });
  }

  compareStrategies() {
    return this.request("/strategy/compare", {
      method: "POST",
    });
  }

  getResults() {
    return this.request("/results");
  }
}

export const api = new ApiService();
export { isMockMode };
export default api;