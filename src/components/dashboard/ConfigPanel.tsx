// Component for configuring brand name and API keys

import { useState, useEffect } from 'react';
import { Settings, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getConfig, saveConfigToStorage, loadConfigFromStorage, type AppConfig } from '@/lib/config';

export function ConfigPanel() {
  const [config, setConfig] = useState<AppConfig>(getConfig());
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfigFromStorage();
    setConfig(getConfig());
  }, []);

  const handleSave = () => {
    saveConfigToStorage(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Force reload config to ensure it's available everywhere
    loadConfigFromStorage();
    setConfig(getConfig());
    console.log('[ConfigPanel] Configuration saved:', {
      hasAnthropic: !!config.api.anthropic?.apiKey,
      hasOpenAI: !!config.api.openai?.apiKey,
      openaiModel: config.api.openai?.model,
      brandName: config.brand.brandName,
    });
    // Trigger event to notify other components
    window.dispatchEvent(new Event('configUpdated'));
  };
  
  const handleClearCache = () => {
    if (confirm('Clear all cached configuration? This will reset to defaults but keep your API keys if saved.')) {
      // Clear config from localStorage
      localStorage.removeItem('ai-visibility-config');
      // Reload from defaults/environment
      loadConfigFromStorage();
      setConfig(getConfig());
      console.log('[ConfigPanel] Cache cleared, config reloaded');
      alert('Cache cleared! Config reloaded. Please re-enter your API keys if needed.');
    }
  };
  
  const testAPIKey = async (platform: 'anthropic' | 'openai' | 'perplexity' | 'google') => {
    const apiKey = config.api[platform]?.apiKey;
    if (!apiKey) {
      alert(`Please enter an ${platform} API key first`);
      return;
    }
    
    try {
      console.log(`[Test] Testing ${platform} API key...`);
      const testQuery = 'Hello';
      let response;
      
          if (platform === 'anthropic') {
            response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
              },
              body: JSON.stringify({
                model: config.api.anthropic?.model || 'claude-3-5-haiku-20241022',
                max_tokens: 10,
                messages: [{ role: 'user', content: testQuery }],
              }),
            });
          } else if (platform === 'openai') {
            const model = config.api.openai?.model || 'gpt-5-mini';
            // Newer models (gpt-4o, gpt-5, o1, etc.) use max_completion_tokens instead of max_tokens
            const isNewerModel = model.includes('gpt-4o') || model.includes('gpt-5') || model.includes('o1');
            const requestBody: any = {
              model,
              messages: [{ role: 'user', content: testQuery }],
            };
            // Use max_completion_tokens for newer models, max_tokens for older ones
            // Set reasonable limit for testing (200 tokens is enough for a test response)
            if (isNewerModel) {
              requestBody.max_completion_tokens = 200;
            } else {
              requestBody.max_tokens = 200;
            }
            
            // Detect if we're on Netlify and use proxy function to avoid CORS issues
            const isNetlify = window.location.hostname.includes('netlify.app');
            const apiUrl = isNetlify 
              ? '/.netlify/functions/openai-proxy'
              : 'https://api.openai.com/v1/chat/completions';
            
            // If using proxy, include API key in request body
            const body = isNetlify
              ? JSON.stringify({ ...requestBody, apiKey })
              : JSON.stringify(requestBody);
            
            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
            };
            
            // Only add Authorization header if not using proxy
            if (!isNetlify) {
              headers['Authorization'] = `Bearer ${apiKey}`;
            }
            
            response = await fetch(apiUrl, {
              method: 'POST',
              mode: 'cors',
              headers,
              body,
            }).catch((fetchError) => {
              console.error('[Test] OpenAI fetch error details:', fetchError);
              // Re-throw with more context for CORS errors
              if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('CORS') || fetchError.message.includes('NetworkError')) {
                throw new Error('CORS/Network Error: OpenAI API may have CORS restrictions from this domain. The API key is likely valid - try processing queries to verify.');
              }
              throw fetchError;
            });
      } else if (platform === 'perplexity') {
        response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: config.api.perplexity?.model || 'pplx-70b-online',
            messages: [{ role: 'user', content: testQuery }],
            max_tokens: 10,
          }),
        });
      } else if (platform === 'google') {
        const model = config.api.google?.model || 'gemini-pro';
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: testQuery }],
              }],
              generationConfig: {
                maxOutputTokens: 10,
              },
            }),
          }
        );
      } else {
        alert('API test not implemented for this platform yet');
        return;
      }
      
      console.log(`[Test] ${platform} response status:`, response.status);
      
      // Get response text first to handle both success and error cases
      const responseText = await response.text();
      console.log(`[Test] ${platform} response body:`, responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`[Test] ${platform} JSON parse error:`, parseError, 'Response text:', responseText);
        alert(`❌ API key test failed: Invalid response format. Check console for details.`);
        return;
      }
      
      if (response.ok) {
        if (platform === 'google') {
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            console.log(`[Test] ${platform} success:`, data);
            alert('✅ API key is valid!');
          } else {
            console.error(`[Test] ${platform} error - no content:`, data);
            // Check if there's an error in the response
            if (data.error) {
              alert(`❌ API key test failed: ${data.error.message || JSON.stringify(data.error)}`);
            } else {
              alert(`❌ API key test failed: No content in response. Response: ${JSON.stringify(data).substring(0, 200)}`);
            }
          }
        } else {
          // Handle different response structures
          let content: string | undefined;
          
          if (platform === 'anthropic') {
            content = data.content?.[0]?.text;
          } else if (platform === 'openai') {
            // OpenAI response structure: data.choices[0].message.content
            const choice = data.choices?.[0];
            if (choice) {
              // Check for finish_reason to understand why content might be missing
              if (choice.finish_reason === 'length' && !choice.message?.content) {
                // Content was cut off due to token limit
                content = choice.message?.content || choice.delta?.content || '';
                console.log(`[Test] ${platform} content was truncated (finish_reason: length)`);
              } else {
                content = choice.message?.content || choice.delta?.content;
              }
              
              // Log the full choice structure for debugging
              console.log(`[Test] ${platform} choice structure:`, {
                hasMessage: !!choice.message,
                hasContent: !!choice.message?.content,
                finishReason: choice.finish_reason,
                choice: choice
              });
            }
          } else {
            // Perplexity uses same structure as OpenAI
            content = data.choices?.[0]?.message?.content;
          }
          
          if (content && content.trim().length > 0) {
            console.log(`[Test] ${platform} success:`, data);
            alert('✅ API key is valid!');
          } else {
            console.error(`[Test] ${platform} error - no content:`, data);
            console.error(`[Test] ${platform} choices:`, data.choices);
            console.error(`[Test] ${platform} first choice:`, data.choices?.[0]);
            
            // Check if there's an error in the response
            if (data.error) {
              const errorMsg = data.error.message || JSON.stringify(data.error);
              // Provide helpful messages for common errors
              if (errorMsg.includes('model') && (errorMsg.includes('not found') || errorMsg.includes('does not exist'))) {
                alert(`❌ Model Error: The model "${config.api.openai?.model || 'gpt-5-mini'}" may not exist or you don't have access.\n\nTry: gpt-5-mini, gpt-4o, gpt-4o-mini, gpt-4-turbo, or gpt-3.5-turbo\n\nFull error: ${errorMsg}`);
              } else {
                alert(`❌ API key test failed: ${errorMsg}`);
              }
            } else if (platform === 'openai' && data.choices && data.choices[0]) {
              const choice = data.choices[0];
              const finishReason = choice.finish_reason;
              
              if (finishReason === 'length') {
                // Content was truncated - this is actually a success, just limited
                alert('✅ API key is valid! (Response was truncated due to token limit, but API is working)');
              } else if (finishReason === 'stop' && !choice.message?.content) {
                alert(`❌ API key test failed: Response completed but no content returned.\n\nFinish reason: ${finishReason}\n\nThis might indicate a model issue. Check console for details.`);
              } else {
                alert(`❌ API key test failed: No content in response.\n\nFinish reason: ${finishReason}\n\nCheck console for full response structure.`);
              }
            } else if (platform === 'openai' && data.choices && data.choices.length === 0) {
              alert(`❌ API key test failed: Empty choices array. This might indicate a model issue. Check that the model "${config.api.openai?.model || 'gpt-5-mini'}" is valid.\n\nResponse: ${JSON.stringify(data).substring(0, 200)}`);
            } else {
              alert(`❌ API key test failed: No content in response.\n\nThis might mean:\n1. The model name is invalid\n2. The API returned an unexpected format\n\nCheck console for full response.`);
            }
          }
        }
      } else {
        const errorText = await response.text();
        console.error(`[Test] ${platform} error response:`, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }
        const errorMsg = errorData.error?.message || 'Invalid API key';
        let userFriendlyMsg = errorMsg;
        
        // Provide helpful messages for common errors
        if (response.status === 429) {
          if (errorMsg.includes('quota')) {
            userFriendlyMsg = `Quota exceeded. Check your OpenAI billing at https://platform.openai.com/account/billing. If you have credits, try again in a few minutes.`;
          } else if (errorMsg.includes('rate limit')) {
            userFriendlyMsg = `Rate limit exceeded. Wait a few seconds and try again.`;
          } else {
            userFriendlyMsg = `Rate limit/quota issue. Check billing at https://platform.openai.com/account/billing or wait a few minutes.`;
          }
        } else if (response.status === 401) {
          userFriendlyMsg = `Invalid API key. Check that the key is correct and hasn't been revoked.`;
        } else if (response.status === 404) {
          userFriendlyMsg = `Model not found. The model "${config.api.openai?.model || 'gpt-5-mini'}" may not be available. Try a different model.`;
        }
        
        alert(`❌ API key test failed (${response.status}): ${userFriendlyMsg}`);
      }
    } catch (err) {
      console.error(`[Test] ${platform} fetch error:`, err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('CORS') || errorMsg.includes('NetworkError')) {
        // More helpful message for CORS errors
        const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        if (isProduction && platform === 'openai') {
          alert(`❌ CORS/Network Error: OpenAI API test failed from this domain. This is often a CORS restriction on production domains.\n\n✅ Your API key is likely valid - try processing actual queries to verify.\n\n💡 If queries also fail, you may need to use a backend proxy for OpenAI API calls.`);
        } else {
          alert(`❌ CORS/Network Error: The API may not support direct browser requests from this domain. Your API key is likely valid - try processing queries to verify. Check console for details.`);
        }
      } else {
        alert(`❌ Error: ${errorMsg}`);
      }
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskKey = (key: string | undefined): string => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuration
        </CardTitle>
        <CardDescription>
          Configure your brand name and API keys for AI platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="brand" className="space-y-4">
          <TabsList>
            <TabsTrigger value="brand">Brand</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="brand" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input
                id="brand-name"
                value={config.brand.brandName}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    brand: { ...config.brand, brandName: e.target.value },
                  })
                }
                placeholder="Enter your brand name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-aliases">Brand Aliases (comma-separated)</Label>
              <Input
                id="brand-aliases"
                value={config.brand.brandAliases?.join(', ') || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    brand: {
                      ...config.brand,
                      brandAliases: e.target.value.split(',').map(a => a.trim()).filter(Boolean),
                    },
                  })
                }
                placeholder="e.g., Brand Name, BrandName, Brand Inc"
              />
              <p className="text-xs text-muted-foreground">
                Alternative names or variations of your brand to search for
              </p>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Alert>
              <AlertDescription>
                API keys are stored locally in your browser. They are never sent to external servers except the respective AI platform APIs.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key (ChatGPT)</Label>
                <div className="flex gap-2">
                  <Input
                    id="openai-key"
                    type={showKeys.openai ? 'text' : 'password'}
                    value={config.api.openai?.apiKey || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                             api: {
                               ...config.api,
                               openai: {
                                 ...config.api.openai,
                                 apiKey: e.target.value,
                                 model: config.api.openai?.model || 'gpt-5-mini',
                               },
                             },
                      })
                    }
                         placeholder={showKeys.openai ? 'sk-...' : maskKey(config.api.openai?.apiKey)}
                       />
                       <Button
                         type="button"
                         variant="outline"
                         size="icon"
                         onClick={() => toggleKeyVisibility('openai')}
                       >
                         {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </Button>
                       <Button
                         type="button"
                         variant="outline"
                         size="sm"
                         onClick={() => testAPIKey('openai')}
                         disabled={!config.api.openai?.apiKey}
                       >
                         Test
                       </Button>
                     </div>
                     <div className="mt-2">
                       <Label htmlFor="openai-model" className="text-xs">Model</Label>
                       <Input
                         id="openai-model"
                         value={config.api.openai?.model || 'gpt-5-mini'}
                         onChange={(e) =>
                           setConfig({
                             ...config,
                             api: {
                               ...config.api,
                               openai: {
                                 ...config.api.openai,
                                 apiKey: config.api.openai?.apiKey || '',
                                 model: e.target.value,
                               },
                             },
                           })
                         }
                         placeholder="gpt-5-mini"
                         className="text-xs"
                       />
                     </div>
                     <p className="text-xs text-muted-foreground">
                       Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">platform.openai.com</a>
                     </p>
                   </div>

              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Anthropic API Key (Claude)</Label>
                <div className="flex gap-2">
                  <Input
                    id="anthropic-key"
                    type={showKeys.anthropic ? 'text' : 'password'}
                    value={config.api.anthropic?.apiKey || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                             api: {
                               ...config.api,
                               anthropic: {
                                 ...config.api.anthropic,
                                 apiKey: e.target.value,
                                 model: config.api.anthropic?.model || 'claude-3-5-haiku-20241022',
                               },
                             },
                      })
                    }
                         placeholder={showKeys.anthropic ? 'sk-ant-...' : maskKey(config.api.anthropic?.apiKey)}
                       />
                       <Button
                         type="button"
                         variant="outline"
                         size="icon"
                         onClick={() => toggleKeyVisibility('anthropic')}
                       >
                         {showKeys.anthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </Button>
                       <Button
                         type="button"
                         variant="outline"
                         size="sm"
                         onClick={() => testAPIKey('anthropic')}
                         disabled={!config.api.anthropic?.apiKey}
                       >
                         Test
                       </Button>
                     </div>
                     <div className="mt-2">
                       <Label htmlFor="anthropic-model" className="text-xs">Model</Label>
                       <Input
                         id="anthropic-model"
                         value={config.api.anthropic?.model || 'claude-3-5-haiku-20241022'}
                         onChange={(e) =>
                           setConfig({
                             ...config,
                             api: {
                               ...config.api,
                               anthropic: {
                                 ...config.api.anthropic,
                                 apiKey: config.api.anthropic?.apiKey || '',
                                 model: e.target.value,
                               },
                             },
                           })
                         }
                         placeholder="claude-3-5-haiku-20241022"
                         className="text-xs"
                       />
                     </div>
                     <p className="text-xs text-muted-foreground">
                       Get your API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">console.anthropic.com</a>
                     </p>
                   </div>

              <div className="space-y-2">
                <Label htmlFor="perplexity-key">Perplexity API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="perplexity-key"
                    type={showKeys.perplexity ? 'text' : 'password'}
                    value={config.api.perplexity?.apiKey || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        api: {
                          ...config.api,
                          perplexity: {
                            ...config.api.perplexity,
                            apiKey: e.target.value,
                            model: config.api.perplexity?.model || 'pplx-70b-online',
                          },
                        },
                      })
                    }
                    placeholder={showKeys.perplexity ? 'pplx-...' : maskKey(config.api.perplexity?.apiKey)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleKeyVisibility('perplexity')}
                  >
                    {showKeys.perplexity ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => testAPIKey('perplexity')}
                    disabled={!config.api.perplexity?.apiKey}
                  >
                    Test
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary underline">perplexity.ai</a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google-key">Google API Key (Gemini)</Label>
                <div className="flex gap-2">
                  <Input
                    id="google-key"
                    type={showKeys.google ? 'text' : 'password'}
                    value={config.api.google?.apiKey || ''}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        api: {
                          ...config.api,
                          google: {
                            ...config.api.google,
                            apiKey: e.target.value,
                            model: config.api.google?.model || 'gemini-pro',
                          },
                        },
                      })
                    }
                    placeholder={showKeys.google ? 'AIza...' : maskKey(config.api.google?.apiKey)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleKeyVisibility('google')}
                  >
                    {showKeys.google ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => testAPIKey('google')}
                    disabled={!config.api.google?.apiKey}
                  >
                    Test
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-2">
          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
            {saved && <span className="ml-2 text-xs">✓ Saved</span>}
          </Button>
          <Button 
            onClick={handleClearCache} 
            variant="outline" 
            className="w-full text-muted-foreground"
          >
            Clear Cache & Reload Config
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
