import { errorHandler } from "../middleware/errorHandler";

describe("errorHandler middleware", () => {
  it("formats errors", () => {
    const err = new Error("Boom");
    const req: any = {};
    const res: any = {
      statusCode: 0,
      body: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: any) {
        this.body = payload;
        return this;
      },
    };
    const next = jest.fn();

    errorHandler(err as any, req, res, next);

    expect([400, 500]).toContain(res.statusCode); // depends on your handler logic
    expect(res.body).toBeTruthy();
  });
});
