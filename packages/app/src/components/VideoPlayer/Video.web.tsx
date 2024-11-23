import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

//@ts-ignore
import videojs from 'video.js/dist/video'
import 'video.js/dist/video-js.min.css'
import Player from 'video.js/dist/types/player';

const getOptions = (uri: string) => {
    return {
        autoplay: true,
        controls: true,
        responsive: true,
        preload: 'auto',
        fluid: true,
        sources: [{
            src: uri,
            type: uri.includes('m3u8') ? "application/x-mpegURL" : "video/mp4"
        }],
        playbackRates: [1, 1.5, 2],
        userActions: {
            click: false,
            hotkeys: function (event: KeyboardEvent) {
                const player = this as any as Player

                switch (event.code) {
                    case "KeyF":
                        if (!player.isFullscreen()) {
                            player.requestFullscreen()
                        } else {
                            player.exitFullscreen()
                        }
                        break

                    case "KeyM":
                        if (!player.muted()) {
                            player.muted(true)
                        } else {
                            player.muted(false)
                        }
                        break

                    case "Space":
                        if (player.paused()) {
                            player.play()
                        } else {
                            player.pause();
                        }
                        break

                    case "ArrowRight":
                        player.currentTime(+(player.currentTime() || 0) + 5)
                        break

                    case "ArrowLeft":
                        player.currentTime(+(player.currentTime() || 0) - 5)
                        break
                }
            }
        }
    }
}

export const Video: React.FC<{ uri: string }> = ({ uri }) => {
    const videoRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<Player | null>(null);

    useEffect(() => {
        const videoElement = document.createElement("video-js");
        videoElement.classList.add('vjs-big-play-centered');
        videoRef.current!.appendChild(videoElement);
        const options = getOptions(uri);

        const player = playerRef.current = videojs(videoElement, options, () => { });
        player.focus()

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    return (
        <View style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingHorizontal: 50 }}>
            <div data-vjs-player>
                <div ref={videoRef} />
            </div>
        </View>
    )
};

