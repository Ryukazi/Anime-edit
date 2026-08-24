export default async function handler(req, res) {

  // Only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }


  try {

    const body = req.body || {};

    const keywords =
      String(body.keywords || '').trim();


    if (!keywords) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required'
      });
    }


    const payload = {
      keywords: keywords,
      count: Number(body.count) || 10,
      region: body.region || 'ne'
    };


    console.log(
      'Searching TikWM:',
      payload
    );


    const response = await fetch(
      'https://tikwm.com/api/feed/search',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0'
        },

        body: JSON.stringify(payload)
      }
    );


    const text =
      await response.text();


    console.log(
      'TikWM status:',
      response.status
    );


    console.log(
      'TikWM response:',
      text.slice(0, 1000)
    );


    if (!response.ok) {

      return res.status(502).json({
        success: false,
        error:
          `TikWM returned HTTP ${response.status}`,
        details:
          text.slice(0, 500)
      });

    }


    let data;

    try {

      data = JSON.parse(text);

    } catch {

      return res.status(502).json({
        success: false,
        error:
          'TikWM returned invalid JSON',
        details:
          text.slice(0, 500)
      });

    }


    // Return TikWM response unchanged
    return res.status(200).json(data);


  } catch (error) {

    console.error(
      'TikWM proxy error:',
      error
    );


    return res.status(500).json({
      success: false,
      error:
        'Failed to contact TikWM',
      message:
        error.message
    });

  }
}
