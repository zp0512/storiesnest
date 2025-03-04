import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/services/storage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const video = formData.get('video') as Blob;

    if (!video) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Initialize storage service
    const storageService = StorageService.getInstance(
      process.env.STORAGE_API_URL!,
      process.env.STORAGE_API_KEY!,
      session.user.id
    );

    // Upload the video
    const result = await storageService.uploadVideo(video);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
} 