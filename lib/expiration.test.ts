import { computeExpiration } from "./expiration";

describe("computeExpiration", () => {
  it("sealed + roast_date returns roast + 30 days", () => {
    const result = computeExpiration({
      roast_date: "2026-06-01",
      manual_expires_at: null,
      is_open: false,
      opened_at: null,
    });
    expect(result).toBe("2026-07-01"); // June 1 + 30d = July 1
  });

  it("open with recent opened_at returns opened + 14 (earlier than roast + 30)", () => {
    // Roast Jun 01 -> sealed Jul 01. Opened Jun 10 -> Jun 24. Jun 24 < Jul 01.
    const result = computeExpiration({
      roast_date: "2026-06-01",
      manual_expires_at: null,
      is_open: true,
      opened_at: "2026-06-10",
    });
    expect(result).toBe("2026-06-24");
  });

  it("open with late opened_at returns roast + 30 (min cap protects against extension)", () => {
    // Roast Jun 01 -> sealed Jul 01. Opened Jun 25 -> Jul 09. Jul 01 < Jul 09.
    const result = computeExpiration({
      roast_date: "2026-06-01",
      manual_expires_at: null,
      is_open: true,
      opened_at: "2026-06-25",
    });
    expect(result).toBe("2026-07-01");
  });

  it("no roast_date but manual_expires_at present returns manual_expires_at", () => {
    const result = computeExpiration({
      roast_date: null,
      manual_expires_at: "2026-08-15",
      is_open: false,
      opened_at: null,
    });
    expect(result).toBe("2026-08-15");
  });

  it("no roast_date and no manual_expires_at returns null", () => {
    const result = computeExpiration({
      roast_date: null,
      manual_expires_at: null,
      is_open: false,
      opened_at: null,
    });
    expect(result).toBeNull();
  });

  it("open=true but no opened_at falls back to sealed calc (roast + 30)", () => {
    const result = computeExpiration({
      roast_date: "2026-06-01",
      manual_expires_at: null,
      is_open: true,
      opened_at: null,
    });
    expect(result).toBe("2026-07-01");
  });

  it("returns a string in YYYY-MM-DD format", () => {
    const result = computeExpiration({
      roast_date: "2026-06-01",
      manual_expires_at: null,
      is_open: false,
      opened_at: null,
    });
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("boundary: opened_at equals roast_date -> opened + 14 wins", () => {
    // Roast Jun 01 -> sealed Jul 01. Opened Jun 01 -> Jun 15. Jun 15 < Jul 01.
    const result = computeExpiration({
      roast_date: "2026-06-01",
      manual_expires_at: null,
      is_open: true,
      opened_at: "2026-06-01",
    });
    expect(result).toBe("2026-06-15");
  });
});
