import { httpService } from "@/shared/api";
import { ApiError } from "@/shared/api/errors";
import { authStorage } from "@/shared/lib/auth-storage";

import {
  tokenResponseSchema,
  type ClientRegisterRequest,
  type LoginRequest,
  type TokenResponse,
} from "../model/schemas";

export class AuthService {
  loginEmployee(body: LoginRequest): Promise<TokenResponse> {
    return httpService.post(
      "/auth/employees/login",
      body,
      tokenResponseSchema,
      { skipAuth: true },
    );
  }

  loginClient(body: LoginRequest): Promise<TokenResponse> {
    return httpService.post(
      "/auth/clients/login",
      body,
      tokenResponseSchema,
      { skipAuth: true },
    );
  }

  registerClient(body: ClientRegisterRequest): Promise<TokenResponse> {
    return httpService.post(
      "/auth/clients/register",
      body,
      tokenResponseSchema,
      { skipAuth: true },
    );
  }

  refreshEmployee(): Promise<TokenResponse> {
    const refreshToken = authStorage.getRefreshToken("employee");
    if (!refreshToken) {
      throw new ApiError(401, "Сессия истекла");
    }
    return httpService.post(
      "/auth/employees/refresh",
      undefined,
      tokenResponseSchema,
      {
        skipAuth: true,
        headers: { Authorization: `Bearer ${refreshToken}` },
      },
    );
  }

  refreshClient(): Promise<TokenResponse> {
    const refreshToken = authStorage.getRefreshToken("client");
    if (!refreshToken) {
      throw new ApiError(401, "Сессия истекла");
    }
    return httpService.post(
      "/auth/clients/refresh",
      undefined,
      tokenResponseSchema,
      {
        skipAuth: true,
        headers: { Authorization: `Bearer ${refreshToken}` },
      },
    );
  }
}

export const authService = new AuthService();
