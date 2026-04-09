import { useEffect, useState } from 'react';

interface ImportantNewsModalProps {
  videoUrl?: string; // YouTube embed URL or MP4 URL
  videoType?: 'youtube' | 'mp4';
}

export function ImportantNewsModal({ videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ', videoType = 'youtube' }: ImportantNewsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem('importantNewsSeen');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('importantNewsSeen', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 transform scale-95 transition-transform duration-300 ease-out animate-in fade-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <div className="text-center py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-red-600 uppercase tracking-wide">Important News</h2>
        </div>

        {/* Video */}
        <div className="p-6">
          {videoType === 'youtube' ? (
            <div className="aspect-video">
              <iframe
                src={videoUrl}
                title="Important News Video"
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Bottom Close button */}
        <div className="flex justify-center pb-6">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}