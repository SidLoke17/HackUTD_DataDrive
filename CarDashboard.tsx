import React, { useState, useEffect } from "react";
import axios from "axios";

interface CarDashboardProps {
  setSharedInputs: (inputs: any) => void;
}

const CarDashboard: React.FC<CarDashboardProps> = ({ setSharedInputs }) => {
  const [cars, setCars] = useState<{ model_year: number; model: string }[]>([]);
  const [selectedCar, setSelectedCar] = useState<string>("");
  const [carDetails, setCarDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/cars");
        setCars(response.data.cars); // Assuming response includes a "cars" array
      } catch (err) {
        console.error("Error fetching car data:", err);
        setError("Failed to fetch car list. Please try again.");
      }
    };

    fetchCars();
  }, []);

  const handleCarSelection = async (carName: string) => {
    setSelectedCar(carName);
    setCarDetails(null); // Reset car details on selection
    setError(null);

    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/car-details?name=${encodeURIComponent(carName)}`
      );
      setCarDetails(response.data);

      // Automatically update shared inputs
      setSharedInputs({
        engineDisplacement: response.data.engine_displacement,
        cylinders: response.data.cylinders,
        cityFuelEfficiency: response.data.city_fuel_efficiency,
        highwayFuelEfficiency: response.data.highway_fuel_efficiency,
        co2: response.data.co2_emissions,
        annualFuelCost: response.data.annual_fuel_cost,
        combinedFuelEfficiency: response.data.combined_fuel_efficiency,
      });
    } catch (err) {
      console.error("Error fetching car details:", err);
      setError("Failed to fetch car details. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">

      <div className="mb-4">
        <label htmlFor="car-select" className="block mb-2 text-sm font-medium text-gray-400">
          Select a Car:
        </label>
        <select
          id="car-select"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500"
          value={selectedCar}
          onChange={(e) => handleCarSelection(e.target.value)}
        >
          <option value="">-- Select a Car --</option>
          {cars.map((car, index) => (
            <option key={index} value={car.model}>
              {car.model_year} - {car.model}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {carDetails && (
        <div className="text-white">
          <h3 className="text-xl font-bold">Car Details:</h3>
          <p>
            <strong>Model Year:</strong> {carDetails.model_year}
          </p>
          <p>
            <strong>Engine Displacement:</strong> {carDetails.engine_displacement} L
          </p>
          <p>
            <strong>Cylinders:</strong> {carDetails.cylinders}
          </p>
          <p>
            <strong>City Fuel Efficiency:</strong> {carDetails.city_fuel_efficiency} MPG
          </p>
          <p>
            <strong>Highway Fuel Efficiency:</strong> {carDetails.highway_fuel_efficiency} MPG
          </p>
          <p>
            <strong>Combined Fuel Efficiency:</strong> {carDetails.combined_fuel_efficiency} MPG
          </p>
          <p>
            <strong>Annual Fuel Cost:</strong> ${carDetails.annual_fuel_cost}
          </p>
          <p>
            <strong>CO2 Emissions:</strong> {carDetails.co2_emissions} g/mi
          </p>
        </div>
      )}
    </div>
  );
};

export default CarDashboard;
