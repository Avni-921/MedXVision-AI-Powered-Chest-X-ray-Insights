import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import API from '@/api/axios';

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  duration_minutes: number;
  order_index: number;
  course: { _id: string; title: string };
}

export function VideoPlayer() {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const { data } = await API.get(`/videos/${id}`);
      setVideo(data);
      // Fetch all videos in this course for navigation
      const { data: courseVideos } = await API.get(`/videos/course/${data.course._id}`);
      setAllVideos(courseVideos);

      // Update progress
      try {
        await API.put(`/courses/${data.course._id}/progress`, { videoId: data._id });
      } catch {}
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    // Handle standard YouTube URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle youtu.be short URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Already an embed URL or direct video link
    return url;
  };

  const isYouTube = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const currentIndex = allVideos.findIndex(v => v._id === id);
  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Video not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top bar */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to={`/courses/${video.course._id}`} className="text-slate-300 hover:text-white flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to {video.course.title}
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" /> {video.duration_minutes} min
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-6">
          {isYouTube(video.url) ? (
            <iframe
              src={getEmbedUrl(video.url)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <video src={video.url} controls className="w-full h-full" />
          )}
        </div>

        {/* Video Info */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
          <p className="text-slate-400">{video.description}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {prevVideo ? (
            <Link to={`/videos/${prevVideo._id}`}>
              <Button variant="outline" className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                <ChevronLeft className="w-4 h-4 mr-2" /> {prevVideo.title}
              </Button>
            </Link>
          ) : <div />}

          {nextVideo ? (
            <Link to={`/videos/${nextVideo._id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                {nextVideo.title} <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : <div />}
        </div>

        {/* Video List */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Course Videos</h3>
          <div className="space-y-2">
            {allVideos.map((v) => (
              <Link key={v._id} to={`/videos/${v._id}`}>
                <Card className={`${v._id === id ? 'border-blue-500 bg-slate-800' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'} transition-all`}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${v._id === id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      {v.order_index}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${v._id === id ? 'text-white' : 'text-slate-300'}`}>{v.title}</p>
                    </div>
                    <span className="text-xs text-slate-500">{v.duration_minutes}m</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
