import { describe, expect, it } from "bun:test";
import { createTestClient } from "../../testing/src/index";
import { BadRequestError, NotFoundError, t, Volt } from "../src/index";

describe("@voltts/core", () => {
  it("handles basic GET and returns JSON", async () => {
    const app = new Volt();

    app.get("/ping", () => {
      return { message: "pong" };
    });

    const client = createTestClient(app);
    const res = await client.get("/ping");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: "pong" });
  });

  it("uses the configured port when listen receives a callback", () => {
    let callbackServer:
      | { port: number; stop: (force?: boolean) => void }
      | undefined;
    const app = new Volt({ port: 0 });

    const server = app.listen((startedServer) => {
      callbackServer = startedServer;
    });

    expect(server.port).toBeGreaterThan(0);
    expect(callbackServer).toBe(server);
    server.stop(true);
  });

  it("extracts typed route parameters and query strings", async () => {
    const app = new Volt();

    app.get("/users/:id", (c) => {
      return {
        id: c.params.id,
        format: c.query.format,
      };
    });

    const client = createTestClient(app);
    const res = await client.get("/users/99", {
      query: { format: "detailed" },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("99");
    expect(data.format).toBe("detailed");
  });

  it("validates request body and automatically returns 400 on error", async () => {
    const app = new Volt();

    app.post(
      "/users",
      async (c) => {
        return c.json({ created: true, user: c.body }, 201);
      },
      {
        body: t.Object({
          username: t.String({ minLength: 3 }),
          email: t.String({ format: "email" }),
        }),
      }
    );

    const client = createTestClient(app);

    // 1. Valid body
    const validRes = await client.post("/users", {
      body: { username: "alice", email: "alice@example.com" },
    });
    expect(validRes.status).toBe(201);
    const validData = await validRes.json();
    expect(validData.created).toBe(true);

    // 2. Invalid body
    const invalidRes = await client.post("/users", {
      body: { username: "al", email: "not-an-email" },
    });
    expect(invalidRes.status).toBe(400);
    const invalidData = await invalidRes.json();
    expect(invalidData.error).toBe("BadRequestError");
    expect(invalidData.details.length).toBe(2);
  });

  it("handles route groups and nested prefixes", async () => {
    const app = new Volt();

    app.group("/api/v1", (v1) => {
      v1.get("/status", () => ({ status: "operational" }));
    });

    const client = createTestClient(app);
    const res = await client.get("/api/v1/status");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "operational" });
  });

  it("returns 404 for unmatched routes", async () => {
    const app = new Volt();
    const client = createTestClient(app);
    const res = await client.get("/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("supports custom error handling with onError hook", async () => {
    const app = new Volt();

    app.get("/error", () => {
      throw new Error("Database connection failed");
    });

    app.onError((err) => {
      return new Response(JSON.stringify({ customError: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    });

    const client = createTestClient(app);
    const res = await client.get("/error");
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.customError).toBe("Database connection failed");
  });

  it("supports cookies and custom headers", async () => {
    const app = new Volt();

    app.get("/set-cookie", (c) => {
      c.setCookie("session", "xyz123", { httpOnly: true, secure: true });
      return { ok: true };
    });

    const client = createTestClient(app);
    const res = await client.get("/set-cookie");
    expect(res.headers.get("set-cookie")).toContain("session=xyz123");
    expect(res.headers.get("set-cookie")).toContain("HttpOnly");
    expect(res.headers.get("set-cookie")).toContain("Secure");
  });
});
