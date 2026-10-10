function CropGallery() {
  const crops = [
    {
      name: 'Tomato',
      image: '/Farm-AI-Advisory/images/tomato.jpg',
      text: 'Disease & health detection',
    },
    {
      name: 'Potato',
      image: '/Farm-AI-Advisory/images/potato.jpg',
      text: 'Disease & health detection',
    },
    {
      name: 'Pepper',
      image: '/Farm-AI-Advisory/images/pepper.jpg',
      text: 'Disease & health detection',
    },
    {
      name: 'Corn',
      image: '/Farm-AI-Advisory/images/corn.jpg',
      text: 'Disease & health detection',
    },
    {
      name: 'Grape',
      image: '/Farm-AI-Advisory/images/grape.jpg',
      text: 'Disease & health detection',
    },
    {
      name: 'Strawberry',
      image: '/Farm-AI-Advisory/images/strawberry.jpg',
      text: 'Disease & health detection',
    },
  ]

  return (
    <section className="crop-gallery-section">
      <div className="crop-gallery-header">
        <h2>Supported Crops</h2>
        <p>
          Upload clear leaf images for AI disease analysis
        </p>
      </div>

      <div className="crop-gallery">
        {crops.map((crop) => (
          <div
            className="crop-gallery-card"
            key={crop.name}
          >
            <img
              src={crop.image}
              alt={`${crop.name} crop`}
            />

            <div className="crop-gallery-content">
              <h3>{crop.name}</h3>
              <p>{crop.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CropGallery
