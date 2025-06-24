import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from './ui/Button';

interface InputData {
  'City FE (Guide) - Conventional Fuel': number | string;
  'Hwy FE (Guide) - Conventional Fuel': number | string;
  'Comb FE (Guide) - Conventional Fuel': number | string;
  'Annual Fuel1 Cost - Conventional Fuel': number | string;
}

interface ClusterResponse {
  cluster_id: number;
  insights: {
    description: string;
    average_comb_fe: number;
    recommendation: string;
  };
}

const ClusterInsights: React.FC<{ autoInputs?: any }> = ({ autoInputs }) => {
  const [inputData, setInputData] = useState<InputData>({
    "City FE (Guide) - Conventional Fuel": "",
    "Hwy FE (Guide) - Conventional Fuel": "",
    "Comb FE (Guide) - Conventional Fuel": "",
    "Annual Fuel1 Cost - Conventional Fuel": "",
  });

  useEffect(() => {
    if (autoInputs) {
      setInputData({
        "City FE (Guide) - Conventional Fuel": autoInputs.cityFuelEfficiency || "",
        "Hwy FE (Guide) - Conventional Fuel": autoInputs.highwayFuelEfficiency || "",
        "Comb FE (Guide) - Conventional Fuel": autoInputs.combinedFuelEfficiency || "",
        "Annual Fuel1 Cost - Conventional Fuel": autoInputs.annualFuelCost || "",
      });
    }
  }, [autoInputs]);

  const [clusterResult, setClusterResult] = useState<ClusterResponse | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePredictCluster = async () => {
    if (Object.values(inputData).some((val) => val === '')) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setClusterResult(null);
    setExplanation(null);

    try {
      const response = await axios.post<ClusterResponse>(
        'http://127.0.0.1:5000/predict-cluster',
        inputData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      setClusterResult(response.data);
      await fetchExplanation(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while predicting the cluster.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExplanation = async (clusterData: ClusterResponse) => {
    try {
      const response = await axios.post<{ explanation: string }>(
        'http://127.0.0.1:5000/explain',
        {
          model_name: 'Clustering Model',
          input_data: inputData,
          result: clusterData,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setExplanation(response.data.explanation);
    } catch (err) {
      console.error('Failed to fetch GPT explanation:', err);
      setExplanation('Failed to fetch GPT-generated insights.');
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="space-y-4">
        {Object.keys(inputData).map((key) => (
          <div key={key}>
            <label className="block mb-2 text-sm font-medium text-gray-400">{key}:</label>
            <input
              type="number"
              name={key}
              value={(inputData as any)[key]}
              onChange={handleInputChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <Button
          label={isLoading ? 'Loading...' : 'Predict Cluster'}
          onClick={handlePredictCluster}
        />
      </div>

      {isLoading && <p className="mt-4 text-center text-yellow-400">Loading...</p>}

      {clusterResult && (
        <div className="mt-4 text-center text-green-400">
          <h3>Cluster ID: {clusterResult.cluster_id}</h3>
          <p>{clusterResult.insights.description}</p>
          <p>Average FE: {clusterResult.insights.average_comb_fe}</p>
          <p>Recommendation: {clusterResult.insights.recommendation}</p>
        </div>
      )}

      {explanation && (
        <div className="mt-4 text-center text-blue-400">
          <h4>Professional Insights:</h4>
          <p>{explanation}</p>
        </div>
      )}

      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
    </div>
  );
};

export default ClusterInsights;
