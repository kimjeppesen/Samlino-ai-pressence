# KPI Calculation & Brand Presence Detection Logic

## Table of Contents
1. [How Brand Presence is Detected](#how-brand-presence-is-detected)
2. [How Queries are Sent to LLMs](#how-queries-are-sent-to-llms)
3. [KPI Calculation Methods](#kpi-calculation-methods)
4. [Sentiment Analysis Logic](#sentiment-analysis-logic)
5. [Competitor Tracking](#competitor-tracking)

---

## How Brand Presence is Detected

### Overview
The system **mimics real user queries** by sending your search queries directly to AI platforms (Claude, ChatGPT, Perplexity, Gemini) via their official APIs, then analyzes the responses to detect if your brand is mentioned.

### Step-by-Step Process

#### 1. **Query Submission** (`queryProcessor.ts`)
When you upload a CSV file with queries like "Bilforsikring" or "Billig bilforsikring", the system:

```typescript
// For each query, it sends it to each configured AI platform
const aiResponse = await callAIProvider(platform, query.query);
```

**What happens:**
- Your query (e.g., "Bilforsikring") is sent **exactly as a user would type it** into the AI chat interface
- The system uses the official API endpoints (not web scraping)
- Each platform processes the query as if a real user asked it

#### 2. **API Call Structure** (`aiProviders.ts`)

**Claude API Example:**
```typescript
POST https://api.anthropic.com/v1/messages
Headers:
  - x-api-key: YOUR_API_KEY
  - anthropic-version: 2023-06-01
  - anthropic-dangerous-direct-browser-access: true
Body:
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "Bilforsikring"  // Your actual query
    }
  ]
}
```

**This is identical to:**
- Opening Claude's chat interface
- Typing "Bilforsikring"
- Pressing Enter
- Getting the response

The API returns the **exact same response** a user would see in the chat interface.

#### 3. **Response Analysis** (`brandDetection.ts`)

After receiving the AI's response, the system analyzes it for brand mentions:

```typescript
export function analyzeBrandPresence(
  response: string,  // Full AI response text
  brandName?: string
): BrandPresenceAnalysis
```

**Detection Method:**
1. **Text Search**: Searches for your brand name and aliases in the response
   - Brand: "Samlino"
   - Aliases: ["Samlino", "samlino", "samlino.dk", "samlino dk"]
   
2. **Case-Insensitive Matching**: 
   - Normalizes both response and search terms to lowercase
   - Uses regex with word boundaries for exact matches
   - Special handling for domains (e.g., "samlino.dk" doesn't use word boundaries)

3. **Position Detection**:
   - Finds the **first mention** position in the response
   - Position = 1 if mentioned in first 50 characters
   - Position increases as mention appears later in response

4. **Context Extraction**:
   - Extracts 50 characters before and after each mention
   - Used for sentiment analysis and display

**Example:**
```
Query: "Bilforsikring"
AI Response: "For bilforsikring i Danmark, kan du overveje flere muligheder. 
Samlino er en populær platform der sammenligner priser fra forskellige 
forsikringsselskaber. Du kan også tjekke findforsikring eller FDM..."

Detection Result:
- mentioned: true
- position: 1 (mentioned early in response)
- context: "...Samlino er en populær platform der sammenligner..."
- sentiment: positive (contains "populær")
```

---

## How Queries are Sent to LLMs

### Yes, It Mimics Chat LLMs

The system **directly mimics** what happens when a user chats with an AI:

1. **User Query → API Call**
   - Your CSV query: "Bilforsikring"
   - Sent as: `{ role: "user", content: "Bilforsikring" }`
   - **No modifications, no context added** - just the raw query

2. **AI Processes Naturally**
   - The AI model processes it exactly as if a user typed it
   - No special instructions like "mention brands" or "list companies"
   - The AI responds naturally based on its training data

3. **Response is Real**
   - The response is what the AI would actually say to a user
   - If your brand isn't mentioned, it means the AI wouldn't mention it to a real user either
   - This gives you **authentic visibility data**

### Why This Approach?

**Advantages:**
- ✅ **Real-world accuracy**: Measures actual user experience
- ✅ **No bias**: AI responds naturally without prompting
- ✅ **Authentic data**: Same response users would see
- ✅ **Multi-platform**: Tests across different AI models

**Limitations:**
- ⚠️ Responses may vary between API calls (AI non-determinism)
- ⚠️ No guarantee brand will be mentioned even if relevant
- ⚠️ Depends on AI's training data and knowledge cutoff

### Processing Flow

```
CSV Upload
  ↓
Parse Queries: ["Bilforsikring", "Billig bilforsikring", ...]
  ↓
For each query:
  ├─→ Claude API: Send query → Get response → Analyze
  ├─→ ChatGPT API: Send query → Get response → Analyze
  ├─→ Perplexity API: Send query → Get response → Analyze
  └─→ Gemini API: Send query → Get response → Analyze
  ↓
Store Results: { mentioned: true/false, position, sentiment, ... }
  ↓
Calculate KPIs from stored results
```

---

## KPI Calculation Methods

### 1. Overall AI Visibility Score (0-100)

**Location:** `metricsCalculator.ts` → `calculateOverallVisibility()`

**Formula:**
```typescript
visibility = (mentionRate × 0.6) + (positionScore × 0.4)

Where:
- mentionRate = (mentionedQueries / totalQueries) × 100
- positionScore = max(0, 100 - (avgPosition - 1) × 10)
```

**Breakdown:**
- **Mention Rate (60% weight)**: Percentage of queries where brand is mentioned
  - If mentioned in 50 out of 100 queries → 50% mention rate
- **Position Score (40% weight)**: How early brand appears in responses
  - Position 1 (first mention) → 100 points
  - Position 2 → 90 points
  - Position 3 → 80 points
  - Position 10+ → 0 points

**Example:**
```
Total queries: 100
Mentioned: 60 queries
Average position: 2.5

Mention Rate = (60/100) × 100 = 60%
Position Score = max(0, 100 - (2.5-1) × 10) = 85

Visibility = (60 × 0.6) + (85 × 0.4) = 36 + 34 = 70/100
```

**Why This Formula?**
- **Mention rate** shows how often you appear (frequency)
- **Position** shows prominence (earlier = more visible)
- **Weighted combination** balances both factors

---

### 2. Total AI Mentions

**Location:** `metricsCalculator.ts` → `calculateTotalMentions()`

**Formula:**
```typescript
totalMentions = queryResults.filter(r => r.mentioned).length
```

**Simple count** of all queries where brand was mentioned across all platforms.

**Example:**
- 100 queries processed
- 60 mentioned your brand
- **Total Mentions = 60**

---

### 3. Sentiment Score (0-100)

**Location:** `metricsCalculator.ts` → `calculateAvgSentiment()`

**Formula:**
```typescript
sentimentScore = average of sentiment values

Where sentiment values:
- 'positive' → 80 points
- 'neutral' → 50 points
- 'negative' → 30 points
```

**Sentiment Detection** (`brandDetection.ts` → `analyzeSentiment()`):

The system analyzes the **context around brand mentions** (50 chars before/after):

**Positive Indicators:**
- Words: "best", "excellent", "great", "top", "recommended", "highly", "outstanding", "superior", "leading", "preferred", "popular", "trusted", "reliable", "innovative", "advanced", "powerful", "efficient", "effective"

**Negative Indicators:**
- Words: "worst", "poor", "bad", "terrible", "awful", "disappointing", "fails", "issues", "problems", "limitations", "weak", "slow", "expensive", "overpriced", "complicated", "difficult", "lacks", "missing"

**Calculation:**
```typescript
positiveCount = count of positive words in context
negativeCount = count of negative words in context

if (positiveCount > negativeCount) → 'positive' (80 points)
else if (negativeCount > positiveCount) → 'negative' (30 points)
else → 'neutral' (50 points)
```

**Example:**
```
Context: "Samlino er en populær platform der sammenligner priser"

Analysis:
- "populær" → positive word
- positiveCount = 1, negativeCount = 0
- Result: 'positive' → 80 points

If 10 mentions:
- 6 positive (80 pts each)
- 3 neutral (50 pts each)
- 1 negative (30 pts)

Average = (6×80 + 3×50 + 1×30) / 10 = 66/100
```

---

### 4. Competitor Ranking

**Location:** `metricsCalculator.ts` → `calculateCompetitorRank()`

**Formula:**
```typescript
1. Get all competitor metrics (your brand + competitors)
2. Sort by visibility score (descending)
3. Find your brand's position in sorted list
4. Rank = position (1 = highest visibility)
```

**Example:**
```
Competitors sorted by visibility:
1. findforsikring: 85 visibility
2. Samlino: 70 visibility  ← Your brand (Rank #2)
3. fdm: 65 visibility
4. alm. brand: 50 visibility

Competitor Rank = 2
```

**Competitor Detection:**
- Uses same brand detection logic
- Searches for competitor names/aliases in AI responses
- Calculates same metrics (visibility, mentions, sentiment)

---

### 5. Platform-Specific Metrics

**Location:** `metricsCalculator.ts` → `calculatePlatformMetrics()`

For each platform (Claude, ChatGPT, Perplexity, Gemini):

```typescript
platformResults = queryResults.filter(r => r.platform === platform)
visibility = calculateOverallVisibility(platformResults)
mentions = platformResults.filter(r => r.mentioned).length
sentiment = calculateAvgSentiment(platformResults)
```

**Shows:**
- Which platforms mention your brand most
- Platform-specific visibility scores
- Platform-specific sentiment

---

## Sentiment Analysis Logic

### Detailed Sentiment Detection

**Location:** `brandDetection.ts` → `analyzeSentiment()`

**Process:**
1. Extract context (50 chars before/after mention)
2. Convert to lowercase for case-insensitive matching
3. Count positive vs negative indicator words
4. Determine sentiment based on counts

**Sentiment Determination:**
```typescript
if (positiveCount > negativeCount) → 'positive'
else if (negativeCount > positiveCount) → 'negative'
else → 'neutral'
```

**Multiple Mentions:**
If brand is mentioned multiple times in one response:
- Each mention gets its own sentiment
- Overall sentiment = majority sentiment
- If tied, defaults to 'neutral'

---

## Competitor Tracking

### How Competitors are Detected

**Location:** `competitorTracking.ts`

**Configuration:**
```typescript
COMPETITORS = [
  { name: 'findforsikring', aliases: ['findforsikring', 'find forsikring', 'findforsikring.dk'] },
  { name: 'fdm', aliases: ['fdm', 'FDM', 'FDM.dk'] },
  { name: 'alm. brand', aliases: ['alm. brand', 'alm brand', 'almbrand'] },
]
```

**Detection Process:**
1. For each AI response, check if competitor aliases appear
2. Uses same text search logic as brand detection
3. Calculates same metrics (visibility, mentions, sentiment)
4. Compares your brand against competitors

**Competitor Metrics Calculation:**
- Same formula as your brand's visibility score
- Same sentiment analysis
- Same position scoring
- Allows direct comparison

---

## Data Flow Summary

```
1. CSV Upload
   ↓
2. Parse Queries
   ↓
3. For Each Query:
   ├─ Send to Claude API (raw query, no modifications)
   ├─ Send to ChatGPT API (raw query)
   ├─ Send to Perplexity API (raw query)
   └─ Send to Gemini API (raw query)
   ↓
4. Receive AI Responses (natural responses, as users would see)
   ↓
5. Analyze Each Response:
   ├─ Search for brand name/aliases
   ├─ Find mention position
   ├─ Extract context
   ├─ Analyze sentiment
   └─ Calculate confidence
   ↓
6. Store Results
   ↓
7. Calculate KPIs:
   ├─ Overall Visibility = (mentionRate × 0.6) + (positionScore × 0.4)
   ├─ Total Mentions = count of mentioned queries
   ├─ Sentiment = average of sentiment scores (positive=80, neutral=50, negative=30)
   ├─ Competitor Rank = position in sorted visibility list
   └─ Platform Metrics = same calculations per platform
```

---

## Key Insights

### What This System Measures

1. **Real User Experience**: What users actually see when they ask AI platforms
2. **Natural Mentions**: No prompting or bias - pure AI responses
3. **Multi-Platform Coverage**: Tests across different AI models
4. **Competitive Intelligence**: Compares your visibility against competitors

### Limitations

1. **AI Variability**: Same query might get different responses on different calls
2. **Training Data Dependency**: AI can only mention brands it knows about
3. **No Historical Comparison**: Growth metrics require manual tracking
4. **Sentiment Simplicity**: Uses keyword matching, not advanced NLP

### Best Practices

1. **Test Multiple Queries**: More queries = more accurate data
2. **Monitor Regularly**: AI responses can change over time
3. **Compare Platforms**: Different AIs may have different knowledge
4. **Review Context**: Check actual mentions to understand sentiment

---

## Technical Details

### API Rate Limiting

- **Delay between queries**: 1 second
- **Delay between batches**: 2 seconds
- **Batch size**: 3 queries at a time (configurable)

### Response Storage

- Full AI responses stored in `localStorage`
- Results include: mentioned, position, sentiment, context, confidence
- Can be exported/cleared via UI

### Confidence Scoring

```typescript
confidence = min(mentionCount × 0.3, 0.9)
if (responseLength > 200) confidence += 0.1
if (mentioned && confidence < 0.5) confidence = 0.5
```

- Based on number of mentions
- Boosted for longer responses
- Minimum 0.5 if brand is mentioned

---

This system provides **authentic, real-world visibility data** by directly querying AI platforms as users would, then analyzing the natural responses for brand presence and sentiment.
