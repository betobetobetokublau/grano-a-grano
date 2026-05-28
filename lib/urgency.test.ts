import { urgencyLevel } from "./urgency";

describe("urgencyLevel", () => {
  it("daysLeft = -1 -> expired", () => {
    expect(urgencyLevel(-1)).toBe("expired");
  });

  it("daysLeft = -100 -> expired (deep past)", () => {
    expect(urgencyLevel(-100)).toBe("expired");
  });

  it("daysLeft = 0 -> red (boundary at start of 0-3 band)", () => {
    expect(urgencyLevel(0)).toBe("red");
  });

  it("daysLeft = 2 -> red (inside 0-3 band)", () => {
    expect(urgencyLevel(2)).toBe("red");
  });

  it("daysLeft = 3 -> orange (boundary: 3 belongs to orange, not red)", () => {
    expect(urgencyLevel(3)).toBe("orange");
  });

  it("daysLeft = 6 -> orange (inside 3-7 band)", () => {
    expect(urgencyLevel(6)).toBe("orange");
  });

  it("daysLeft = 7 -> yellow (boundary: 7 belongs to yellow, not orange)", () => {
    expect(urgencyLevel(7)).toBe("yellow");
  });

  it("daysLeft = 13 -> yellow (inside 7-14 band)", () => {
    expect(urgencyLevel(13)).toBe("yellow");
  });

  it("daysLeft = 14 -> green (boundary: 14 belongs to green, not yellow)", () => {
    expect(urgencyLevel(14)).toBe("green");
  });

  it("daysLeft = 100 -> green (deep future)", () => {
    expect(urgencyLevel(100)).toBe("green");
  });
});
