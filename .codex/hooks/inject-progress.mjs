import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const progressPath = join(root, "PROGRESS.md");

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function parseProgress(markdown) {
  const phase = markdown.match(/^- Phase:\s*`([^`]+)`/m)?.[1] ?? "unknown";
  const active = markdown.match(/^- Active:\s*`([^`]+)`/m)?.[1] ?? "none";
  const updated = markdown.match(/^- Updated:\s*`([^`]+)`/m)?.[1] ?? "unknown";

  const tasks = [];
  const taskLine = /^- \[([ x~-])\] \*\*(M\d+-\d+|P\d+-\d+)\*\* (.+)$/gm;
  let match;
  while ((match = taskLine.exec(markdown)) !== null) {
    const mark = match[1];
    tasks.push({
      id: match[2],
      title: match[3].trim(),
      status: mark === "x" ? "done" : mark === "~" ? "in_progress" : mark === "-" ? "blocked" : "todo",
    });
  }

  const inProgress = tasks.filter((task) => task.status === "in_progress");
  const nextTodo = tasks.find((task) => task.status === "todo" && task.id.startsWith(phase === "P2" ? "P2" : phase));

  return { phase, active, updated, inProgress, nextTodo };
}

readStdin();

let context =
  "Kids Portal progress rule: every piece of work must be a task id from PROGRESS.md. Read that file first, mark the task [~], do only that task, then update PROGRESS.md in the same turn.";

try {
  const markdown = readFileSync(progressPath, "utf8");
  const { phase, active, updated, inProgress, nextTodo } = parseProgress(markdown);
  const current = inProgress[0] ?? (active !== "none" ? { id: active, title: "see PROGRESS.md" } : nextTodo);

  context += ` Current phase ${phase}. Active ${active}. Updated ${updated}.`;
  if (current) {
    context += ` Next/current task: ${current.id} — ${current.title}.`;
  } else {
    context += " No open task in the current phase. Ask before adding tasks or advancing phase.";
  }
} catch {
  context += " PROGRESS.md could not be read. Stop and restore it before coding.";
}

process.stdout.write(JSON.stringify({ additional_context: context }));
