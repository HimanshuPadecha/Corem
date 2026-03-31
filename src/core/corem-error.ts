type codes = "INVALID_SCHEMA" | "NOT_PRIMARY_KEY" | "NOT_FOUND" | "INVALID_REQUEST" ;

export class CoremError extends Error {
  code: codes;
  message: string;
  constructor({ code, message }: { code: codes; message: string }) {
    super(message);
    this.code = code;
    this.message = message;
  }
}
