import { notFound } from "../middleware/notFound";

describe("notFound middleware", () => {
  it("returns 404", () => {
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

    notFound(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body).toBeTruthy();
  });
});
