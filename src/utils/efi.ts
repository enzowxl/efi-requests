import type { EfiOauthResponse } from "@/types/efi";
import { AxiosError } from 'axios'
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Agent } from "node:https";
import { env } from "@/env";
import axios from "axios";

const EFI_CERTIFICATE_PATH = resolve(__dirname, "../../certificate.p12");
const EFI_CERTIFICATE = readFileSync(EFI_CERTIFICATE_PATH);

const EFI_CREDENTIALS = {
  clientId: env.EFI_CLIENT_ID,
  clientSecret: env.EFI_CLIENT_SECRET,
};

const EFI_HTTPS_AGENT = new Agent({
  pfx: EFI_CERTIFICATE,
  passphrase: "",
});

const EFI_API = axios.create({
  baseURL: env.EFI_API_URL,
});

class EfiService {
  private readonly credentials = EFI_CREDENTIALS;
  private readonly httpsAgent = EFI_HTTPS_AGENT;
  private readonly api = EFI_API;

  async getAccessToken(): Promise<EfiOauthResponse | undefined> {
    try {
      const credentials = this.formatCredentials();
      const auth = this.generateBasicAuth(credentials);

      const response = await this.api.post(
        "/oauth/token",
        { grant_type: "client_credentials" },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          httpsAgent: this.httpsAgent,
        }
      );

      return response.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new Error(err.response?.data.error_description);
      }
    }
  }

  async createPixCharge(accessToken: string) {
    try {
      const response = await this.api.post(
        "/v2/cob",
        {
          calendario: {
            expiracao: 3600,
          },
          valor: {
            original: "1.00",
          },
          chave: "contact.enzoalmeida@gmail.com",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          httpsAgent: this.httpsAgent,
        }
      );

      return response.data;
    } catch (err) {
      if (err instanceof AxiosError) {
        throw new Error(err.response?.data.mensagem);
      }
    }
  }

  private formatCredentials(): string {
    return `${this.credentials.clientId}:${this.credentials.clientSecret}`;
  }

  private generateBasicAuth(credentials: string): string {
    return Buffer.from(credentials).toString("base64");
  }
}

export const efiService = new EfiService();
