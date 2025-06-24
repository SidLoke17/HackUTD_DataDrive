import React, { useEffect, useState } from "react";
import axios from "axios";
import * as d3 from "d3";

const FuelEfficiencyChart: React.FC<{ autoInputs?: any }> = ({ autoInputs }) => {
  const [engineDisplacement, setEngineDisplacement] = useState<number>(3.5);
  const [cylinders, setCylinders] = useState<number>(6);
  const [cityFE, setCityFE] = useState<number>(20);
  const [highwayFE, setHighwayFE] = useState<number>(28);
  const [co2, setCo2] = useState<number>(300);
  const [chartData, setChartData] = useState<
    { input: string; efficiency: number }[]
  >([]);

  useEffect(() => {
    if (autoInputs) {
      setEngineDisplacement(autoInputs.engineDisplacement || 3.5);
      setCylinders(autoInputs.cylinders || 6);
      setCityFE(autoInputs.cityFuelEfficiency || 20);
      setHighwayFE(autoInputs.highwayFuelEfficiency || 28);
      setCo2(autoInputs.co2 || 300);
    }
  }, [autoInputs]);

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict-fuel-efficiency",
        {
          "Eng Displ": engineDisplacement,
          "# Cyl": cylinders,
          "City FE (Guide) - Conventional Fuel": cityFE,
          "Hwy FE (Guide) - Conventional Fuel": highwayFE,
          "Comb CO2 Rounded Adjusted (as shown on FE Label)": co2,
        }
      );

      const predictedValue = response.data.predicted_comb_fe;
      setChartData((prevData) => [
        ...prevData,
        {
          input: `Eng: ${engineDisplacement}, Cyl: ${cylinders}, City FE: ${cityFE}, Hwy FE: ${highwayFE}, CO2: ${co2}`,
          efficiency: predictedValue,
        },
      ]);
    } catch (error) {
      console.error("Error fetching prediction:", error);
    }
  };

  const handleReset = () => {
    setChartData([]);
    d3.select("#chart").selectAll("*").remove(); // Clear the D3 chart
  };

  useEffect(() => {
    if (chartData.length > 0) {
      drawChart(chartData);
    }
  }, [chartData]);

  const drawChart = (data: { input: string; efficiency: number }[]) => {
    // Clear previous chart
    d3.select("#chart").selectAll("*").remove();
  
    const margin = { top: 20, right: 30, bottom: 60, left: 70 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    // Create SVG container
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    // Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, data.length - 1])
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.efficiency)! + 5])
      .range([height, 0]);
  
    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    svg.append("g").call(d3.axisLeft(yScale));
  
    // Labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text("Prediction Number");
  
    svg
      .append("text")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("fill", "white")
      .text("Predicted Fuel Efficiency (MPG)");
  
    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background-color", "#333")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "5px")
      .style("visibility", "hidden")
      .style("font-size", "12px");
  
    // Line Generator
    const line = d3
      .line<{ input: string; efficiency: number }>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d.efficiency));
  
    // Append the line to the SVG
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 2)
      .attr("d", line);
  
    // Circles (points)
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(i))
      .attr("cy", (d) => yScale(d.efficiency))
      .attr("r", 5)
      .attr("fill", "#ffab00")
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .text(`Input: ${d.input}\nEfficiency: ${d.efficiency.toFixed(2)}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 20}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });
  };
  

  return (
    <div className="fuel-efficiency-chart-container max-w-lg mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">
        Fuel Efficiency Predictive Analysis
      </h2>

      <div className="controls mb-4">
        <div className="slider mb-4">
          <label className="block text-white">
            Engine Displacement (L): {engineDisplacement}
          </label>
          <input
            type="range"
            min="1"
            max="6"
            step="0.1"
            value={engineDisplacement}
            onChange={(e) => setEngineDisplacement(Number(e.target.value))}
          />
        </div>

        <div className="slider mb-4">
          <label className="block text-white">
            Number of Cylinders: {cylinders}
          </label>
          <input
            type="range"
            min="3"
            max="12"
            step="1"
            value={cylinders}
            onChange={(e) => setCylinders(Number(e.target.value))}
          />
        </div>

        <div className="slider mb-4">
          <label className="block text-white">
            City Fuel Efficiency (MPG): {cityFE}
          </label>
          <input
            type="range"
            min="10"
            max="50"
            step="1"
            value={cityFE}
            onChange={(e) => setCityFE(Number(e.target.value))}
          />
        </div>

        <div className="slider mb-4">
          <label className="block text-white">
            Highway Fuel Efficiency (MPG): {highwayFE}
          </label>
          <input
            type="range"
            min="10"
            max="60"
            step="1"
            value={highwayFE}
            onChange={(e) => setHighwayFE(Number(e.target.value))}
          />
        </div>

        <div className="slider mb-4">
          <label className="block text-white">CO2 Emission (g/mi): {co2}</label>
          <input
            type="range"
            min="100"
            max="600"
            step="10"
            value={co2}
            onChange={(e) => setCo2(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="buttons mb-6 text-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Submit
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      <div id="chart" className="chart-container"></div>
    </div>
  );
};

export default FuelEfficiencyChart;
