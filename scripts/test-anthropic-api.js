// Test script to verify Anthropic API is working
const fs = require('fs');

async function testAnthropicAPI() {
  // Read API key from .env.local
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const apiKeyMatch = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
  const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;
  
  console.log('🔍 Testing Anthropic API...');
  console.log('API Key present:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key starts with:', apiKey?.substring(0, 20) + '...');
  
  if (!apiKey || apiKey.length < 20) {
    console.error('❌ API key not configured properly');
    return;
  }
  
  try {
    console.log('\n📡 Sending test request to Anthropic API...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: 'Say "API is working!" if you can read this.',
        }],
      }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('\n✅ API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.content && data.content[0]) {
      console.log('\n🎉 Success! AI says:', data.content[0].text);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAnthropicAPI();
