export class ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;

  constructor(data: T, message?: string) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.timestamp = Date.now();
  }

  static error(message: string): ApiResponse<null> {
    const response = new ApiResponse<null>(null, message);
    response.success = false;
    return response;
  }
}
