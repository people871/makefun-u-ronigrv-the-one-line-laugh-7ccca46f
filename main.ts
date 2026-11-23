// "The Microwave Marathon" — one funny line for the make.fun bounty
// u-ronigrv-the-one-line-laugh-7ccca46f.
//
// The joke: a smartwatch celebrates 10,000 steps, then the punchline
// pulls the rug out — nearly all of them were just pacing in front of
// the microwave. One sentence, an everyday truth anyone with a tracker
// recognises, and the surprise lands in the last few words.
//
// The program does one thing: it writes that line, and nothing else,
// to /output/entry.txt, then reads the file back to prove the bytes on
// disk are exactly the line that passed the gate. Node 22, no
// dependencies, no network, the same bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The line before the judge. 125 Unicode code points as written;
// the gate counts the file, so the trailing newline makes 126.
const LINE =
  "My smartwatch congratulated me on 10,000 steps, then admitted 9,400 of them were just me pacing while the microwave finished.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only whitespace, and the entry is a single sentence.
const MIN_POINTS = 1;
const MAX_POINTS = 200;

// Code points, not UTF-16 units and not bytes: the gate counts the
// same way, so an em dash or an accented letter counts once.
function codePoints(text: string): number {
  return [...text].length;
}

function fail(message: string): never {
  throw new Error(`entry rejected: ${message}`);
}

function main(): void {
  // One sentence: exactly one sentence terminator in the whole line,
  // and it must be the final character. A naive split on "." would
  // miscount a decimal or an abbreviation, so scan the terminators
  // themselves — ".", "!" and "?" — and require a single one at the end.
  const terminators = [...LINE].filter((ch) => ch === "." || ch === "!" || ch === "?");
  if (
    LINE.includes("\n") ||
    terminators.length !== 1 ||
    ![".", "!", "?"].includes(LINE.slice(-1))
  ) {
    fail("the entry must be exactly one sentence");
  }

  const fileText = LINE + "\n";
  const size = codePoints(fileText);
  if (size < MIN_POINTS || size > MAX_POINTS) {
    fail(`entry must be ${MIN_POINTS}-${MAX_POINTS} characters, got ${size}`);
  }
  if (fileText.trim().length === 0) {
    fail("entry must not be only whitespace");
  }

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");

  // Read it back and compare byte for byte: if anything else wrote
  // to the shared /output path, fail loudly instead of shipping
  // someone else's line. Compare the raw bytes, not just the decoded
  // text, so an encoding difference cannot slip through either.
  const onDisk = readFileSync("/output/entry.txt");
  if (!onDisk.equals(Buffer.from(fileText, "utf8"))) {
    fail(
      `entry.txt on disk (${onDisk.length} bytes) is not the gated line (${Buffer.byteLength(fileText, "utf8")} bytes)`,
    );
  }
}

main();
