const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/execute", (req, res) => {
  const { language, code } = req.body;
  if (!code) return res.status(400).json({ error: "Code is required" });

  let command, args;

  if (language === "python") {
    command = "docker";
    args = ["run", "--rm", "-i", "python:3.9-slim", "python"];
  } else if (language === "cpp") {
    command = "docker";
    args = [
      "run",
      "--rm",
      "-i",
      "gcc:latest",
      "bash",
      "-c",
      "cat > main.cpp && g++ main.cpp -o main && ./main",
    ];
  } else if (language === "javascript") {
    command = "docker";
    args = ["run", "--rm", "-i", "node:18-alpine", "node"];
  } else {
    return res.status(400).json({ error: "Unsupported language" });
  }

  const child = spawn(command, args, { shell: true });

  let output = "";
  let errorOutput = "";

  child.stdout.on("data", (data) => {
    output += data.toString();
  });

  child.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  child.on("close", (codeStatus) => {
    if (codeStatus !== 0) {
      return res.json({ output: output + "\n[Error]: " + errorOutput });
    }
    if (!output.trim() && !errorOutput.trim()) {
      return res.json({ output: "Process finished with exit code 0" });
    }
    res.json({ output: output + errorOutput });
  });

  child.on("error", (err) => {
    res
      .status(500)
      .json({
        error:
          "Failed to start Docker process. Is Docker running? Error: " +
          err.message,
      });
  });

  // Pipe the code directly to Docker container via STDIN
  child.stdin.write(code);
  child.stdin.end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Docker Execution Server running on http://localhost:${PORT}`);
});
