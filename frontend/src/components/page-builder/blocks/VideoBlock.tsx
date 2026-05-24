export function VideoBlock({ content }: { content: Record<string, unknown> }) {
  const url       = content.url as string | undefined;
  const thumbnail = content.thumbnail as string | undefined;
  const autoplay  = content.autoplay as boolean | undefined;
  const muted     = content.muted as boolean | undefined;
  const controls  = content.controls !== false;

  if (!url) {
    return (
      <div className="flex items-center justify-center h-48 rounded-2xl bg-muted border border-dashed border-border text-muted-foreground text-sm">
        No video URL set
      </div>
    );
  }

  const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
  const isVimeo   = url.includes("vimeo.com");

  if (isYoutube || isVimeo) {
    const embedUrl = isYoutube
      ? url.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")
      : url.replace("vimeo.com/", "player.vimeo.com/video/");
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Video"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl">
      <video
        src={url}
        poster={thumbnail}
        autoPlay={autoplay}
        muted={autoplay || muted}
        controls={controls}
        className="w-full rounded-2xl"
        playsInline
      />
    </div>
  );
}
