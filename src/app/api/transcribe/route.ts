import { NextRequest, NextResponse } from 'next/server';
import { TranscriptionService } from '@/services/transcription';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the request body
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'No video URL provided' }, { status: 400 });
    }

    // Initialize transcription service
    const transcriptionService = TranscriptionService.getInstance(
      process.env.TRANSCRIPTION_API_URL!,
      process.env.TRANSCRIPTION_API_KEY!
    );

    // Start transcription
    const result = await transcriptionService.transcribeVideo(videoUrl);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe video' },
      { status: 500 }
    );
  }
} 