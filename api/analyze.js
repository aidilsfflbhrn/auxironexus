const https = require("https");

module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const KEY = "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";
  const bodyData = JSON.stringify(req.body);

  const options = {
    hostname: "api.anthropic.com",
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": KEY,
      "anthropic-version": "2023-06-01",
      "Content-Length": Buffer.byteLength(bodyData),
    },
  };

  const request = https.request(options, function(response) {
    let data = "";
    response.on("data", function(chunk) { data += chunk; });
    response.on("end", function() {
      try {
        res.status(200).json(JSON.parse(data));
      } catch(e) {
        res.status(500).json({ error: "Parse failed", raw: data.slice(0, 200) });
      }
    });
  });

  request.on("error", function(e) {
    res.status(500).json({ error: e.message });
  });

  request.write(bodyData);
  request.end();
};
