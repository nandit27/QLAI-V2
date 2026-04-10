import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import ReactCardFlip from 'react-card-flip';
import Modal from 'react-modal';

import { Button } from "../components/ui/Button";

const FlashCard = ({ title, content, videoId, start, end }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const playerRef = useRef(null);
  const iframeRef = useRef(null);
  const modalPlayerRef = useRef(null);

  useEffect(() => {
    if (isFlipped && !window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        playerRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            'onReady': () => {},
            'onStateChange': (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
              }
            }
          }
        });
      };
    }
  }, [isFlipped]);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handlePlay = () => {
    if (playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    if (modalPlayerRef.current) {
      modalPlayerRef.current.pauseVideo();
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
        <Card 
          onClick={handleFlip} 
          className="h-96 w-80 bg-gray-800 text-white border-gray-700 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex flex-col h-full justify-center items-center p-6 text-center">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <p>{content}</p>
          </div>
        </Card>

        <Card 
          onClick={handleFlip} 
          className="h-96 w-80 bg-gray-800 text-white border-gray-700 shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
        >
          <div className="flex flex-col h-full">
            <div className="p-4 bg-gray-900">
              <h3 className="text-xl font-bold text-center">Video Segment</h3>
            </div>
            <div 
              className="flex-1 relative cursor-pointer"
              onClick={openModal}
            >
              <iframe
                ref={iframeRef}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?start=${start}&end=${end}&enablejsapi=1&controls=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              {!isPlaying && (
                <Button
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-6xl opacity-100 hover:opacity-90 transition-opacity"
                  variant="ghost"
                  size="icon">
                  ▶
                </Button>
              )}
            </div>
          </div>
        </Card>
      </ReactCardFlip>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            background: '#1a1a1a',
            border: 'none',
            borderRadius: '8px',
            padding: '0',
            width: '90%',
            maxWidth: '800px',
            height: 'auto',
            aspectRatio: '16/9',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1000,
          },
        }}
        contentLabel="Video Modal"
      >
        <Button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-transparent border-none text-2xl"
          variant="ghost"
          size="icon">
          ×
        </Button>
        <iframe
          ref={(el) => {
            if (el && window.YT) {
              modalPlayerRef.current = new window.YT.Player(el, {
                events: {
                  'onReady': (event) => event.target.playVideo(),
                }
              });
            }
          }}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?start=${start}&end=${end}&enablejsapi=1&autoplay=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </Modal>
    </>
  );
};

export default FlashCard;