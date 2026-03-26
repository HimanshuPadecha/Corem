type codes = "INVALID SCHEMA";

export class CoremError extends Error {
  code: codes;
  message: string;
  constructor({ code, message }: { code: codes; message: string }) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
