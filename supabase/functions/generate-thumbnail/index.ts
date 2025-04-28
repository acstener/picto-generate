
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

    // Check if this is a Mr. Beast style thumbnail
    const isMrBeastStyle = 
      videoTitle?.includes('$') || 
      thumbnailDetails?.includes('Mr. Beast') || 
      thumbnailText?.includes('$') ||
      (videoDescription && videoDescription.includes('challenge'));

    // Prepare the prompt for the image generation
    const prompt = `
      Create a professional YouTube thumbnail for a video titled "${videoTitle || 'Untitled Video'}".
      ${videoDescription ? `The video is about: ${videoDescription}.` : ''}
      ${thumbnailDetails ? `Design details: ${thumbnailDetails}.` : ''}
      ${thumbnailText ? `The text to display on the thumbnail: "${thumbnailText}".` : ''}
      
      ${isMrBeastStyle ? `
      This should specifically follow Mr. Beast's thumbnail style:
      - Bold, eye-catching large text (usually in yellow, red, or white)
      - Bright, high-contrast colors
      - Shocked facial expressions or reactions
      - Money visuals when relevant (cash, dollar signs)
      - Clean, easily readable composition
      - Often includes arrows pointing at important elements
      - Numbers or dollar amounts should be very large and prominent
      - Use vibrant backgrounds that make the subject pop
      ` : ''}
      
      The person in the thumbnail has been provided as an image. Include this face in the design,
      ideally with an appropriate expression for the video title/context.
      Create a professional, eye-catching thumbnail that will get high click-through rates on YouTube.
      Style: ${style || 'modern professional'}
    `.trim();

    // First, get a detailed description of how the thumbnail should look
    const descriptionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              { type: 'text', text: `Analyze this face image and create a detailed description for a YouTube thumbnail with title "${videoTitle}".` },
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

    if (!descriptionResponse.ok) {
      const error = await descriptionResponse.json();
      console.error('OpenAI description API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const descriptionData = await descriptionResponse.json();
    const thumbnailDescription = descriptionData.choices[0].message.content;
    console.log('Generated thumbnail description:', thumbnailDescription);
    
    // Now generate the actual image
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });

    if (!imageResponse.ok) {
      const error = await imageResponse.json();
      console.error('OpenAI image generation API error:', error);
      throw new Error(`OpenAI image generation API error: ${error.error?.message || 'Unknown error'}`);
    }

    const imageData = await imageResponse.json();
    const generatedImageUrl = imageData.data[0].url;
    console.log('Generated image URL:', generatedImageUrl);

    return new Response(
      JSON.stringify({ 
        thumbnailUrl: generatedImageUrl,
        description: thumbnailDescription
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
