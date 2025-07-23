const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const pdf = require('pdf-parse');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
const PORT = process.env.PORT || 8000;

app.get('/api/github/connect', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=read:user,repo`;
    res.redirect(githubAuthUrl);
});

app.get('/api/github/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code }),
        });
        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;
        if (!access_token) {
            console.error("GitHub OAuth Error:", tokenData.error_description || "No access token was returned from GitHub.");
            throw new Error(tokenData.error_description || "Failed to retrieve access token from GitHub.");
        }
        const userResponse = await fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${access_token}` } });
        const userData = await userResponse.json();
        res.redirect(`http://localhost:3000?github=success&login=${userData.login}&token=${access_token}`);
    } catch (error) {
        console.error('Error in GitHub OAuth callback:', error.message);
        res.redirect('http://localhost:3000?github=error');
    }
});

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { linkedinUrl, githubLogin, githubToken } = req.body;
    const resumeFile = req.file;
    let resumeText = 'No resume provided.';
    if (resumeFile) {
        const data = await pdf(resumeFile.buffer);
        resumeText = data.text;
    }
    let githubDataString = 'GitHub: Not connected.';
    if (githubLogin && githubToken) {
        const repoResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=5', { headers: { Authorization: `Bearer ${githubToken}` } });
        const repos = await repoResponse.json();
        const repoList = repos.map(repo => ({ name: repo.name, description: repo.description, language: repo.language }));
        githubDataString = `GitHub: User '${githubLogin}' is connected. Here is a list of their 5 most recently updated public repositories: ${JSON.stringify(repoList)}`;
    }
    let profileData = `- Resume Text: ${resumeText}\n- ${githubDataString}`;
    if (linkedinUrl) {
      profileData += `\n- LinkedIn: Profile exists at ${linkedinUrl}.`;
    } else {
      profileData += `\n- LinkedIn: No profile provided.`;
    }

    const prompt = `
      You are an expert career coach AI. Analyze the following profile of a junior developer and provide a honest Improvement steps.
      PROFILE DATA:
      ${profileData}
      
      Your response MUST be a valid JSON object enclosed in a markdown code block (\`\`\`json ... \`\`\`).
      The JSON object must strictly follow this structure:
      {
        "userScore": number,
        "roadmapSteps": [
          { "text": "string", "completed": boolean },
          { "text": "string", "completed": boolean },
          { "text": "string", "completed": boolean },
          { "text": "string", "completed": boolean },
          { "text": "string", "completed": boolean }
        ],
        "githubReview": { "repo": "string", "feedback": "string" },
        "linkedinReview": "string",
        "excelAt": ["string", "string"]
      }
      IMPORTANT: The "completed" field in roadmapSteps MUST be a boolean value (true or false). It cannot be a string.
      IMPORTANT: The "linkedinReview" and "githubReview" fields must contain detailed, constructive feedback.
    `;
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        "model": "mistralai/mistral-7b-instruct:free",
        "messages": [ { "role": "user", "content": prompt } ]
      })
    });

    if (!response.ok) throw new Error(`OpenRouter API error: ${await response.text()}`);

    const data = await response.json();
    const rawContent = data.choices[0].message.content;
    let jsonString = '';
    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
    } else {
        const jsonStartIndex = rawContent.indexOf('{');
        const jsonEndIndex = rawContent.lastIndexOf('}');
        if (jsonStartIndex === -1 || jsonEndIndex === -1) throw new Error("AI response did not contain a valid JSON object.");
        jsonString = rawContent.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    try {
        const structuredResponse = JSON.parse(jsonString);
        console.log("Successfully parsed structured JSON response from OpenRouter.");
        res.json(structuredResponse);
    } catch (parseError) {
        console.error("Failed to parse the extracted JSON string:", jsonString);
        throw new Error("AI returned a malformed JSON object.");
    }

  } catch (error) {
    console.error("Error during analysis:", error.message);
    res.status(500).json({ message: "Error during analysis." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});