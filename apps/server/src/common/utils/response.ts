export class MakeResponse {
  static success<T>(data: T, message: string = 'success') {
    return {
      code: 0,
      message,
      data,
    };
  }

  static error(code: number, message: string) {
    return {
      code,
      message,
      data: null,
    };
  }
}
