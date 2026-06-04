import assert from "node:assert/strict";
import { createDrunkTiResult, drunkTiProfiles, drunkTiQuestions } from "../src/features/persona/drunkti.ts";

const chinesePattern = /[\u3400-\u9fff]/;

assert.equal(drunkTiQuestions.length, 8, "DrunkTI should use the 8 Excel questions");

for (const question of drunkTiQuestions) {
  assert.equal(question.options.length, 4, `Question ${question.axis} should have 4 answers`);
  assert.ok(!chinesePattern.test(question.text), `Question ${question.axis} should be English-only`);

  for (const option of question.options) {
    assert.ok(!chinesePattern.test(option.title), `Answer ${question.axis}/${option.value} should be English-only`);
    assert.ok(Array.isArray(option.scores), `Answer ${question.axis}/${option.value} should carry drink score targets`);
    assert.ok(option.scores.length > 0, `Answer ${question.axis}/${option.value} should score at least one drink`);
  }
}

assert.equal(drunkTiQuestions[0].text, "You walk into a bar. What do you do first?");
assert.equal(drunkTiQuestions[7].text, "Choose the flavor direction that attracts you most.");
assert.equal(drunkTiQuestions[0].options[0].title, "Scan the music, crowd, and the mood of the room.");
assert.equal(drunkTiQuestions[7].options[3].title, "Coffee, floral notes, mint, or a strange kind of clarity.");

assert.ok(drunkTiProfiles["Long Island Iced Tea"], "Long Island result should exist");
assert.equal(drunkTiProfiles["Long Island Iced Tea"].name, "Long Island Iced Tea");
assert.equal(drunkTiProfiles["Long Island Iced Tea"].tagline, "The maximalist chaos friend");
assert.equal(drunkTiProfiles["Bartender's Choice"].tagline, "The trusting experimenter");

assert.equal(
  createDrunkTiResult({ q1: "A", q2: "A", q3: "C", q4: "B", q5: "C", q6: "D", q7: "B", q8: "D" }).name,
  "Long Island Iced Tea"
);
assert.equal(
  createDrunkTiResult({ q1: "B", q2: "D", q3: "B", q4: "D", q5: "D", q6: "C", q7: "D", q8: "B" }).name,
  "Chartreuse"
);

console.log("DrunkTI English data check passed.");
