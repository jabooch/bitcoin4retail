const { getOrganizations, getChannels } = require("../../lib/buffer");

function authorized(req) {
  const expected = process.env.B4R_AUTOMATION_SECRET;
  if (!expected) return false;
  return req.headers.authorization === `Bearer ${expected}`;
}

module.exports = async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const organizations = await getOrganizations();
    const result = [];
    for (const organization of organizations) {
      const channels = await getChannels(organization.id);
      result.push({ organization, channels });
    }
    return res.status(200).json({ organizations: result });
  } catch (error) {
    console.error("buffer channels error", error);
    return res.status(500).json({ error: error.message });
  }
};
