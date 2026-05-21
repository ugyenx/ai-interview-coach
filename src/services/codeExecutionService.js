export async function executeCode(language, code, executionMode = 'docker') {
  // Docker Container Execution (Runs all languages in Docker containers)
  if (executionMode === 'docker') {
    try {
      const response = await fetch('http://localhost:3001/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to execute in Docker container");
      return data.output || "Process finished with exit code 0";
    } catch (err) {
      return `[Docker Error]: ${err.message}\nMake sure Docker Desktop is installed/running, and the execution server is started.`;
    }
  }

  // Local Browser Execution (JS only)
  if (executionMode === 'local') {
    if (language !== 'javascript') {
      try {
        const response = await fetch('http://localhost:3001/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language, code })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to execute on local server");
        return data.output || "Process finished with exit code 0";
      } catch (err) {
        return `[Local Docker Error]: ${err.message}\nMake sure Docker Desktop is installed and the local execution server is running.`;
      }
    }

    return new Promise((resolve) => {
      let output = [];
      
      // Sandbox console
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;
      const originalInfo = console.info;

      const capture = (...args) => output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
      console.log = capture;
      console.error = (...args) => output.push('[Error] ' + args.join(' '));
      console.warn = (...args) => output.push('[Warn] ' + args.join(' '));
      console.info = (...args) => output.push('[Info] ' + args.join(' '));

      try {
        // Execute the code safely
        const execFunc = new Function(code);
        execFunc();
        
        if (output.length === 0) {
          output.push("Process finished with exit code 0");
        }
        resolve(output.join('\n'));
      } catch (err) {
        resolve(`[Runtime Error]: ${err.message}\n${err.stack}`);
      } finally {
        // Restore console
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
        console.info = originalInfo;
      }
    });
  }

  // Cloud API Execution (Gemini Fallback)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const prompt = `You are a strict code compiler and execution environment for ${language}.
The user has provided the following code:

\`\`\`${language}
${code}
\`\`\`

If there are any syntax errors or compilation errors, output ONLY the exact error message that a standard compiler/interpreter would output. 
If the code is valid, execute it and output exactly what would be printed to stdout. 
If there is no stdout, simply output "Process finished with exit code 0".
DO NOT wrap your response in markdown blocks like \`\`\`. DO NOT add conversational text. ONLY output the raw console/terminal text.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1
      }
    })
  });

  if (!response.ok) {
    let errMsg = 'Failed to reach AI Code Executor';
    try {
      const errData = await response.json();
      errMsg = errData.error?.message || JSON.stringify(errData);
    } catch(e) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  try {
    return data.candidates[0].content.parts[0].text.trim();
  } catch (err) {
    return "Error: Could not parse AI execution response.";
  }
}
