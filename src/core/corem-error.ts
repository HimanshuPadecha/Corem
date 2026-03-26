type codes = "INVALID SCHEMA" | "NOT PRIMARY KEY";

export class CoremError extends Error {
  code: codes;
  message: string;
  constructor({ code, message }: { code: codes; message: string }) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
