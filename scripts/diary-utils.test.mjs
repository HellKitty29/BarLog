import assert from "node:assert/strict";
import {
  diaryFilterOptions,
  filterDiaryLogs,
  getDiaryAnchorDate,
  getSelectedDiaryDay
} from "../src/web/diary-utils.ts";

const mayLogs = [
  {
    id: "1",
    userId: "u1",
    photoUrl: "photo",
    drinkName: "House Lager",
    drinkCategory: "beer",
    createdAt: "2026-05-29T12:00:00Z"
  },
  {
    id: "2",
    userId: "u1",
    photoUrl: "photo",
    drinkName: "Garden Negroni",
    drinkCategory: "cocktail",
    barName: "Botanist",
    moodTags: ["bitter"],
    createdAt: "2026-05-30T12:00:00Z"
  },
  {
    id: "3",
    userId: "u1",
    photoUrl: "photo",
    drinkName: "Orange Wine",
    drinkCategory: "wine",
    createdAt: "2026-05-30T13:00:00Z"
  }
];

assert.equal(getDiaryAnchorDate("2026-05", new Date("2026-05-30T08:00:00Z")), "2026-05-30");
assert.equal(getDiaryAnchorDate("2026-04", new Date("2026-05-30T08:00:00Z")), "2026-04-01");

assert.deepEqual(
  diaryFilterOptions.map((option) => option.label),
  ["All", "Cocktail", "Brew", "Wine", "Beer", "Whisky", "Sake", "Mocktail"]
);

assert.deepEqual(
  filterDiaryLogs(mayLogs, { search: "", selectedDate: null, category: "brew" }).map((log) => log.id),
  ["1"]
);

assert.deepEqual(
  filterDiaryLogs(mayLogs, { search: "botanist", selectedDate: "2026-05-30", category: "cocktail" }).map((log) => log.id),
  ["2"]
);

assert.deepEqual(
  filterDiaryLogs(mayLogs, { search: "", selectedDate: "2026-05-30", category: "all" }).map((log) => log.id),
  ["2", "3"]
);

assert.deepEqual(
  getSelectedDiaryDay(mayLogs, "2026-05-30", new Map([["2026-05-30", 5]])),
  {
    count: 5,
    dateLabel: "2026-05-30 (Sat)",
    logs: [mayLogs[1], mayLogs[2]]
  }
);

assert.equal(getSelectedDiaryDay(mayLogs, null, new Map()), null);
