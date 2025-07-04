# ASI Alliance Integration

This document explains how to set up and configure the ASI Alliance AI integration for trust score calculation.

## Overview

The ASI integration uses the ASI-1 language model to analyze candidate verification data and generate comprehensive trust scores. The AI analyzes multiple factors including:

- Employment verification success rate (40% weight)
- Role consistency and career progression (25% weight)
- Verification response quality (20% weight)
- Timeline consistency (15% weight)

## 🚨 CRITICAL FIX: Service Role Key Configuration

**If you're getting the error: "new row violates row-level security policy for table 'trust_scores'"**

The issue is that we need to use the Supabase Service Role Key instead of the Anonymous Key for server-side operations.

### Steps to Fix:

1. **Get your Service Role Key from Supabase:**

   - Go to your Supabase project dashboard: https://supabase.com/dashboard/project/zgcwkjlumbgpvvmwpnqx
   - Navigate to Settings → API
   - Copy the `service_role` key (NOT the `anon` key)

2. **Add to your environment variables:**

   ```bash
   # Add this to your .env.local file in the frontend directory
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **The service role key allows:**
   - Bypassing Row Level Security (RLS) policies
   - Full database access for server-side operations
   - Proper trust score storage

### Why This is Needed:

- The anonymous key has limited permissions and cannot bypass RLS policies
- The service role key has full permissions and can perform administrative operations
- Trust score calculation requires inserting data into protected tables

## Environment Variables

Make sure you have these environment variables set:

```bash
# Required for Supabase
SUPABASE_URL=https://zgcwkjlumbgpvvmwpnqx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional for ASI LLM (will use fallback scoring if not set)
ASI_API_KEY=your_asi_api_key_here
```

## ASI API Integration

### Configuration

- **Endpoint**: `https://api.asi1.ai/v1/chat/completions`
- **Model**: `asi1-mini`
- **Authentication**: Bearer token via `ASI_API_KEY`

### Trust Score Calculation

The ASI LLM analyzes candidate data using weighted factors:

- Employment verification success rate (40% weight)
- Role consistency and career progression (25% weight)
- Verification response quality (20% weight)
- Timeline consistency (15% weight)

### Fallback Scoring

If ASI API is unavailable, the system uses a fallback algorithm:

- Base score calculated from verification success rate
- Minimum score of 25 for candidates with requests but no completions
- Score of 30 for candidates with no verification requests

## Trust Score Levels

- **Platinum (90-100)**: Exceptional verification record
- **Gold (75-89)**: Strong verification record
- **Silver (60-74)**: Good verification record
- **Bronze (0-59)**: Needs improvement

## API Endpoints

### POST /api/candidate/ai-score

Calculate trust score for a candidate.

**Request:**

```json
{
  "candidateId": "candidate_nullifier_hash"
}
```

**Response:**

```json
{
  "success": true,
  "trustScore": 85,
  "analysis": "Detailed AI analysis...",
  "breakdown": {
    "verification_rate": 90,
    "career_progression": 80,
    "response_quality": 85,
    "timeline_consistency": 85
  }
}
```

## Database Schema

### trust_scores table

- `id`: UUID primary key
- `candidate_id`: String (World ID nullifier hash)
- `score`: Integer (0-100)
- `analysis`: Text (AI analysis)
- `breakdown`: JSONB (score breakdown by category)
- `recommendations`: Text array
- `risk_factors`: Text array
- `strengths`: Text array
- `calculated_at`: Timestamp
- `updated_at`: Timestamp

## Error Handling

- Network errors fall back to basic scoring
- Invalid JSON responses use fallback scoring
- Database errors are logged with full context
- Service role key errors provide clear instructions

## Security Notes

- Service role key should be kept secret and only used server-side
- Never expose service role key in client-side code
- Use environment variables for all sensitive configuration
- RLS policies are bypassed only for legitimate server operations
