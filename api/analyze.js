if (!process.env.ANTHROPIC_KEY) return res.status(500).json({ error: "No API key found in environment" });
