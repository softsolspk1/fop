// NO TOP-LEVEL IMPORTS that can crash
export default async function handler(req: any, res: any) {
  // 1. Immediate Health Check (no dependencies)
  if (req.url === '/_health_check') {
    return res.json({ 
      status: 'ok', 
      isolated: true,
      time: new Date().toISOString()
    });
  }

  try {
    // 2. Lazy load the app
    const app = (await import('../src/index')).default;
    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel Runtime Error]:', error);
    return res.status(500).json({ 
      error: 'Failed to load application',
      message: error.message,
      stack: error.stack
    });
  }
}
