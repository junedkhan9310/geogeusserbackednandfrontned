import { FaLocationArrow, FaTrophy } from "react-icons/fa";

const ResultsCard = ({ distance, score }) => {
  // Format distance for display
  const formatDistance = (distanceKm) => {
    if (distanceKm < 1) {
      return `${(distanceKm * 1000).toFixed(0)} m`;
    } else {
      return `${distanceKm.toFixed(1)} km`;
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Results</h2>
      
      <div className="flex items-center justify-start mb-4">
        <FaLocationArrow className="text-red-500 mr-3 text-2xl" />
        <span className="text-lg font-semibold text-gray-700">Distance: {formatDistance(distance)}</span>
      </div>
      
      <div className="flex items-center justify-start mb-4">
        <FaTrophy className="text-yellow-500 mr-3 text-2xl" />
        <span className="text-lg font-semibold text-gray-700">Score: {score} points</span>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-md border-t border-gray-300">
        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span>Your guess</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Correct location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsCard;
