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
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
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