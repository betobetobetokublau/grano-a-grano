import { daysUntilExpiration, parseLocalDate } from "./dates";

describe("parseLocalDate", () => {
  it("parses YYYY-MM-DD as local midnight, not UTC", () => {
    const d = parseLocalDate("2026-06-15");
    expect(d.getFullYear()).toBe(2026);
    // getMonth is 0-indexed: June = 5
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(15);
    // local midnight: hours/minutes/seconds/ms all zero
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });

  it("handles year rollover boundary: 1999-12-31 vs 2000-01-01", () => {
    const lastDay = parseLocalDate("1999-12-31");
    const firstDay = parseLocalDate("2000-01-01");
    expect(lastDay.getFullYear()).toBe(1999);
    expect(lastDay.getMonth()).toBe(11);
    expect(lastDay.getDate()).toBe(31);
    expect(firstDay.getFullYear()).toBe(2000);
    expect(firstDay.getMonth()).toBe(0);
    expect(firstDay.getDate()).toBe(1);
    // Exactly one calendar day apart
    expect(firstDay.getTime() - lastDay.getTime()).toBe(24 * 60 * 60 * 1000);
  });
});

describe("daysUntilExpiration", () => {
  it("returns 0 when expiration is today (same local day)", () => {
    // Use mid-day local now to avoid any boundary noise.
    const now = new Date(2026, 5, 15, 14, 30, 0);
    expect(daysUntilExpiration("2026-06-15", now)).toBe(0);
  });

  it("returns positive number when expiration is in the future", () => {
    const now = new Date(2026, 5, 15, 14, 30, 0);
    expect(daysUntilExpiration("2026-06-20", now)).toBe(5);
  });

  it("returns negative number when expiration is in the past", () => {
    const now = new Date(2026, 5, 15, 14, 30, 0);
    expect(daysUntilExpiration("2026-06-10", now)).toBe(-5);
  });

  it("counts exact day difference across a month boundary", () => {
    const now = new Date(2026, 4, 30, 9, 0, 0); // May 30
    expect(daysUntilExpiration("2026-06-05", now)).toBe(6);
  });

  it("counts exact day difference across a year boundary", () => {
    const now = new Date(1999, 11, 31, 23, 0, 0); // Dec 31 1999 23:00 local
    expect(daysUntilExpiration("2000-01-01", now)).toBe(1);
  });

  it("returns -1 for yesterday", () => {
    const now = new Date(2026, 5, 15, 14, 30, 0);
    expect(daysUntilExpiration("2026-06-14", now)).toBe(-1);
  });

  it("returns +1 for tomorrow", () => {
    const now = new Date(2026, 5, 15, 14, 30, 0);
    expect(daysUntilExpiration("2026-06-16", now)).toBe(1);
  });
});
