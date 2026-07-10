
import './ImageSlider.css';

const ImageSlider = () => {
  const images = [
    '/slider-1.jpg',
    '/slider-2.jpg',
    '/slider-3.png'
  ];

  return (
    <div className="image-slider-container">
      <div className="slider-track">
        {images.map((img, index) => (
          <div key={index} className="slide">
            <img src={img} alt={`Slide ${index + 1}`} />
          </div>
        ))}
        {images.map((img, index) => (
          <div key={`duplicate-${index}`} className="slide">
            <img src={img} alt={`Slide ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
