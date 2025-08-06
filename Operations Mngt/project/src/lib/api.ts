import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config/constants';
import { keycloak } from './keycloak';
import type { ErrorResponse } from '@/types/common';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleRequest = async (config: InternalAxiosRequestConfig) => {
  if (keycloak.token) {
    const hasTokenExpired = keycloak.isTokenExpired();
    if (hasTokenExpired) {
      try {
        await keycloak.updateToken(5);
      } catch (error) {
        await keycloak.login();
      }
    }
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  }
  return config;
};

api.interceptors.request.use(handleRequest);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const errorResponse: ErrorResponse = {
      message: 'An unexpected error occurred',
      status: 500,
    };

    if (error.response) {
      errorResponse.message = error.response.data.message || error.message;
      errorResponse.status = error.response.status;
      errorResponse.errors = error.response.data.errors;

      if (error.response.status === 401) {
        await keycloak.login();
      }
    }

    return Promise.reject(errorResponse);
  }
);