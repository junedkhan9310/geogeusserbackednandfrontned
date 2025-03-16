// controllers/mapillaryController.js
import axios from "axios";

const metadataEndpoint = "https://graph.mapillary.com";
const clientToken = process.env.MAPILLARY_ACCESS_TOKEN || 'MLY|4324601697617554|77cecffb3eef9cb3ff0a11471873f03c';
const headers = { "Authorization": `OAuth ${clientToken}` };

// Defined bounding boxes
const boundingBoxes = [
    { latMin: 51.1541169, latMax: 51.1546169, lonMin: 4.4434176, lonMax: 4.4439176 }, // Antwerp, Belgium
    { latMin: 40.7120, latMax: 40.7170, lonMin: -74.0160, lonMax: -74.0100 }, // New York, USA
    { latMin: 51.5074, latMax: 51.5174, lonMin: -0.1278, lonMax: -0.1178 }, // London, UK
    { latMin: 48.8566, latMax: 48.8666, lonMin: 2.3522, lonMax: 2.3622 }, // Paris, France
    { latMin: 35.6528, latMax: 35.6628, lonMin: 139.7000, lonMax: 139.7100 }, // Tokyo, Japan
    { latMin: -33.8688, latMax: -33.8588, lonMin: 151.2093, lonMax: 151.2193 }, // Sydney, Australia
    { latMin: 52.5200, latMax: 52.5300, lonMin: 13.4050, lonMax: 13.4150 }, // Berlin, Germany
    { latMin: -33.9186, latMax: -33.9086, lonMin: 18.4232, lonMax: 18.4332 } // Cape Town, South Africa
];

// **Fetch full image list**
const getFullImageList = async (req, res) => {
    try {
        // Select a random bounding box
        const randomBoundingBox = boundingBoxes[Math.floor(Math.random() * boundingBoxes.length)];

        // API request to get images in the bounding box
        const urlImageSearch = `${metadataEndpoint}/images?fields=id,is_pano&bbox=${randomBoundingBox.lonMin},${randomBoundingBox.latMin},${randomBoundingBox.lonMax},${randomBoundingBox.latMax}&is_pano=true&limit=100`;

        const { data: dataImageSearch } = await axios.get(urlImageSearch, { headers });

        if (!dataImageSearch.data || dataImageSearch.data.length === 0) {
            return res.status(404).json({ message: "No pano images found in the selected bounding box." });
        }

        // Filter pano images
        const images = dataImageSearch.data.filter(image => image.is_pano === true);
        if (images.length === 0) {
            return res.status(404).json({ message: "No pano images available." });
        }

        // Select a random pano image
        const randomPanoImage = images[Math.floor(Math.random() * images.length)];

        // Fetch full details of the image, including coordinates (geometry)
        const urlImage = `${metadataEndpoint}/${randomPanoImage.id}?fields=id,thumb_2048_url,captured_at,sequence,geometry`;
        const { data: dataImage } = await axios.get(urlImage, { headers });

        return res.json({
            id: dataImage.id,
            imageUrl: dataImage.thumb_2048_url,
            capturedAt: dataImage.captured_at,
            sequence: dataImage.sequence,
            coordinates: dataImage.geometry // Contains latitude and longitude
        });

    } catch (error) {
        console.error("Error fetching images:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export {getFullImageList}