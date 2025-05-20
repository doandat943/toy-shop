import React, { useState } from 'react';
import { Card, Modal, Button } from 'react-bootstrap';
import { FaPlay } from 'react-icons/fa';

const ProductVideo = ({ videos }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  
  // Handle opening video modal
  const openVideoModal = (video) => {
    setCurrentVideo(video);
    setShowModal(true);
  };
  
  // Handle closing video modal
  const closeVideoModal = () => {
    setShowModal(false);
    setTimeout(() => setCurrentVideo(null), 300); // Reset current video after modal animation
  };
  
  if (!videos || videos.length === 0) {
    return null;
  }
  
  return (
    <div className="product-videos my-4">
      <h3 className="mb-3">Video hướng dẫn sử dụng</h3>
      <div className="row">
        {videos.map((video, index) => (
          <div key={index} className="col-md-6 col-lg-4 mb-3">
            <Card className="video-card h-100">
              <div className="video-thumbnail position-relative">
                <Card.Img 
                  variant="top" 
                  src={video.thumbnail || `/uploads/video-thumbnail-${index + 1}.jpg`} 
                  alt={video.title}
                />
                <div className="play-button" onClick={() => openVideoModal(video)}>
                  <FaPlay color="#fff" size={24} />
                </div>
              </div>
              <Card.Body>
                <Card.Title as="h5">{video.title}</Card.Title>
                {video.description && (
                  <Card.Text className="text-muted">
                    {video.description}
                  </Card.Text>
                )}
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => openVideoModal(video)}
                >
                  Xem Video
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
      
      {/* Video Modal */}
      <Modal
        show={showModal}
        onHide={closeVideoModal}
        centered
        size="lg"
        className="video-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentVideo?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {currentVideo?.youtubeId ? (
            <div className="ratio ratio-16x9">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1`}
                title={currentVideo?.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : currentVideo?.url ? (
            <div className="ratio ratio-16x9">
              <video 
                controls 
                autoPlay 
                poster={currentVideo.thumbnail}
              >
                <source src={currentVideo.url} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ thẻ video.
              </video>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          {currentVideo?.description && (
            <p className="text-muted mb-0 me-auto">
              {currentVideo.description}
            </p>
          )}
          <Button variant="secondary" onClick={closeVideoModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      
      <style jsx>{`
        .video-thumbnail {
          cursor: pointer;
        }
        .play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background-color: rgba(255, 0, 0, 0.7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .video-thumbnail:hover .play-button {
          background-color: rgba(255, 0, 0, 0.9);
          transform: translate(-50%, -50%) scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default ProductVideo; 