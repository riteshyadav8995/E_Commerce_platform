# Migrating from Exotel to Plivo for AI Voice Calling

This guide details the complete procedure for replacing your current Exotel AI calling setup with Plivo. Plivo operates on a very similar mechanism (REST API for outbound calls, Webhooks for XML instructions, and WebSockets for real-time audio streaming), making the migration straightforward.

## 1. Setup Plivo Credentials & Environment Variables

First, create an account on [Plivo](https://www.plivo.com/). Get your Auth ID, Auth Token, and a Plivo virtual phone number from the Plivo dashboard.

Update your `backend/.env` file. Remove the Exotel variables and add the Plivo ones:

```env
# Remove these:
# EXOTEL_API_KEY=...
# EXOTEL_API_TOKEN=...
# EXOTEL_ACCOUNT_SID=...
# EXOTEL_VIRTUAL_NUMBER=...

# Add these:
PLIVO_AUTH_ID=your_plivo_auth_id_here
PLIVO_AUTH_TOKEN=your_plivo_auth_token_here
PLIVO_VIRTUAL_NUMBER=your_plivo_number_here
```

Update `backend/src/config/env.validation.ts` to validate these new variables instead of Exotel.

## 2. Install the Plivo Node.js SDK

To make interacting with the Plivo REST API easier, install their official SDK:

```bash
cd backend
npm install plivo
```

## 3. Update Outbound Call Logic (`voice-agent.service.ts`)

In `backend/src/modules/voice-agent/voice-agent.service.ts`, replace the Exotel `fetch` block inside `startCall` with the Plivo SDK equivalent.

```typescript
// Import at the top of the file
import * as plivo from 'plivo';

// Inside startCall, replace the "if (data.phoneNumber)" block:
} else if (data.phoneNumber) {
  try {
    const authId = process.env.PLIVO_AUTH_ID;
    const authToken = process.env.PLIVO_AUTH_TOKEN;
    const plivoNumber = process.env.PLIVO_VIRTUAL_NUMBER;
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    if (!authId || !authToken || !plivoNumber) {
      throw new Error('Plivo credentials not configured in .env');
    }

    const client = new plivo.Client(authId, authToken);
    const webhookUrl = `${backendUrl}/api/v1/voice-agent/plivo/webhook?callLogId=${callLog.id}`;

    // Make the outbound call using Plivo API
    await client.calls.create(
      plivoNumber,           // from
      data.phoneNumber,      // to
      webhookUrl,            // answer_url
      {
        answerMethod: 'POST',
      }
    );
  } catch (err) {
    console.error('Failed to trigger Plivo outbound call:', err);
  }
}
```

## 4. Update the Webhook Controller (`voice-agent.controller.ts`)

When Plivo connects the call to the user, it will make a POST request to your webhook URL requesting XML instructions. You need to return Plivo XML (PHLO) containing a `<Stream>` tag to connect the audio to your WebSocket.

Update or replace the `exotelWebhook` method with a `plivoWebhook` method:

```typescript
plivoWebhook = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { callLogId } = req.query;
  const host = req.headers.host || 'localhost:3000';
  const wsProtocol = host.includes('localhost') ? 'ws' : 'wss';
  
  // Point to your Plivo WebSocket endpoint
  const streamUrl = `${wsProtocol}://${host}/api/v1/voice-agent/plivo-stream${callLogId ? `?callLogId=${callLogId}` : ''}`;

  // Plivo XML to start a bidirectional audio stream
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Stream url="${streamUrl}" bidirectional="true" keepCallAlive="true" />
    </Response>`;

  res.header('Content-Type', 'text/xml');
  res.send(xml);
});
```
*(Don't forget to update the routes in `voice-agent.routes.ts` to point to `/plivo/webhook`)*

## 5. Update the WebSocket Streaming Server (`exotel.stream.ts` -> `plivo.stream.ts`)

Rename your WebSocket file to `plivo.stream.ts` and adjust the event names. Plivo's WebSocket stream events are very similar to Twilio's. The JSON payload structure for incoming audio typically looks like this:

```json
{
  "event": "media",
  "media": {
    "payload": "base64_encoded_audio_data"
  }
}
```

Modify the `message` handler in your WebSocket server:

```typescript
ws.on('message', async (message: string) => {
  try {
    const data = JSON.parse(message);

    if (data.event === 'start') {
      const streamId = data.start.streamId;
      logger.info(`[Plivo Stream] Started stream: ${streamId}`);
      // Send greeting audio...
    } 
    else if (data.event === 'media') {
      // Decode base64 audio and send to Deepgram/Google Speech-to-Text
      const audioBuffer = Buffer.from(data.media.payload, 'base64');
      deepgramLive.send(audioBuffer);
    } 
    else if (data.event === 'stop') {
      logger.info('[Plivo Stream] Stream stopped');
    }
  } catch (err) {
    logger.error('Error handling Plivo stream message', err);
  }
});
```

To send audio back to the caller (AI voice speaking), you package the base64 audio and send it back to Plivo over the same WebSocket:

```typescript
const sendAudioToPlivo = (base64Audio: string) => {
  ws.send(JSON.stringify({
    event: 'media',
    media: {
      payload: base64Audio
    }
  }));
};
```

## Summary Checklist

1. [ ] Create Plivo Account and get `Auth ID`, `Auth Token`, and a virtual number.
2. [ ] Update `backend/.env` with Plivo credentials.
3. [ ] Run `npm install plivo` in the backend.
4. [ ] Replace Exotel `fetch` call with Plivo SDK `client.calls.create` in `voice-agent.service.ts`.
5. [ ] Update the webhook endpoint to return Plivo `<Response><Stream>` XML.
6. [ ] Rename/Refactor the WebSocket handler to process Plivo's `event: media` payloads.
