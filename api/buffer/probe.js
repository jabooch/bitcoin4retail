const { getOrganizations, getChannels, normalizeService } = require("../../lib/buffer");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const configured = {
    bufferApiKey: Boolean(process.env.BUFFER_API_KEY),
    automationSecret: Boolean(process.env.B4R_AUTOMATION_SECRET),
  };

  if (!configured.bufferApiKey) {
    return res.status(503).json({ ok:false, configured, services:[] });
  }

  try {
    const organizations = await getOrganizations();
    const services = [];
    for (const organization of organizations) {
      const channels = await getChannels(organization.id);
      for (const channel of channels) services.push(normalizeService(channel.service));
    }
    const validation = {};
    for (const wanted of ["instagram","tiktok","youtube"]) {
      const matches = services.filter(s => s === wanted).length;
      validation[wanted] = { connected: matches === 1, matches };
    }
    return res.status(200).json({
      ok:true,
      configured,
      bufferReachable:true,
      organizationCount:organizations.length,
      channelCount:services.length,
      services:[...new Set(services)].sort(),
      validation
    });
  } catch (error) {
    return res.status(502).json({
      ok:false,
      configured,
      bufferReachable:false,
      services:[],
      error:error.message
    });
  }
};