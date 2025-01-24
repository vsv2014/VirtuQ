import { Facebook, Twitter, Link as LinkIcon, Share2 } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
  description: string;
  image?: string;
}

interface NavigatorShare {
  share?: (data: { title: string; text: string; url: string }) => Promise<void>;
}

export function ShareButtons({ url, title, description, image }: ShareButtonsProps) {
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const copyToClipboard = async () => {
    if (!navigator.clipboard) {
      console.error('Clipboard API not available');
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShowCopiedTooltip(true);
      setTimeout(() => setShowCopiedTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const nav = navigator as NavigatorShare;
    if (nav.share) {
      try {
        await nav.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Share:</span>
      <div className="flex items-center gap-2">
        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          aria-label="Share on Facebook"
        >
          <Facebook size={20} />
        </a>

        {/* Twitter */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-sky-500 hover:bg-sky-50 rounded-full transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter size={20} />
        </a>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
          aria-label="Copy link"
        >
          <LinkIcon size={20} />
          {showCopiedTooltip && (
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded-md whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>

        {/* Native Share (if available) */}
        {(navigator as NavigatorShare).share && (
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Share"
          >
            <Share2 size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
