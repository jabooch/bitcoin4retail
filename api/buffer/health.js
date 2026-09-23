const { getOrganizations } = require("../../lib/buffer");

function authorized(req) {
  const expected = process.env.B4R_AUTOMATION_SECRET;
  if (!expected) return false;
  return req.headers.authorization === `Bearer ${expected}`;
}

module.exports = async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const configured = {
    bufferApiKey: Boolean(process.env.BUFFER_API_KEY),
    automationSecret: Boolean(process.env.B4R_AUTOMATION_SECRET),
  };

  if (!configured.bufferApiKey) {
    return res.status(503).json({ ok: false, configured, error: "BUFFER_API_KEY is not configured" });
  }

  try {
    const organizations = await getOrganizations();
    return res.status(200).json({
      ok: true,
      configured,
      bufferReachable: true,
      organizations: organizations.map(o => ({ id: o.id, name: o.name })),
    });
  } catch (error) {
    console.error("buffer health error", error);
    return res.status(502).json({ ok: false, configured, bufferReachable: false, error: error.message });
  }
};
