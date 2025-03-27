
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { faceImage, videoTitle, videoDescription, thumbnailDetails, thumbnailText, style } = await req.json();
    
    if (!faceImage) {
      throw new Error('Face image is required');
    }

    console.log('Generating thumbnail with style:', style);
    console.log('Video title:', videoTitle);

    // Prepare the prompt for OpenAI
    const prompt = `
      Create a professional YouTube thumbnail with the following elements:
      - Title: ${videoTitle || 'Untitled Video'}
      ${videoDescription ? `- Description/Keywords: ${videoDescription}` : ''}
      ${thumbnailDetails ? `- Details: ${thumbnailDetails}` : ''}
      ${thumbnailText ? `- Text to display: ${thumbnailText}` : ''}
      ${style ? `- Style: ${style}` : ''}
      
      The thumbnail should be eye-catching, professional, and optimized for YouTube.
    `;

    // Call OpenAI API with the face image and prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: faceImage,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const generatedDescription = data.choices[0].message.content;
    
    console.log('Generated description:', generatedDescription);

    // For now, just return the face image as the generated thumbnail
    // In a real implementation, we would use another API to generate an actual image
    return new Response(
      JSON.stringify({ 
        thumbnailUrl: faceImage,
        description: generatedDescription
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-thumbnail function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
