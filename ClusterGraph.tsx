import React, { useEffect, useState } from "react";
import axios from "axios";
import * as d3 from "d3";

interface ClusterDetails {
  "Car Model and Year": string;
  "Combined FE": number;
  "Annual Fuel Cost": number;
  "Distance from Cluster": number;
  Cluster: number;
}

interface DataPoint {
  x: number;
  y: number;
  cluster: number;
  details: ClusterDetails;
}

interface Centroid {
  x: number;
  y: number;
  cluster: number;
}

const clusterInsights = {
  0: {
    description: "Orange, High fuel efficiency vehicles.",
    average_comb_fe: 30,
    recommendation: "Keep tires inflated and perform regular maintenance."
  },
  1: {
    description: "Blue, Moderate fuel efficiency vehicles.",
    average_comb_fe: 20,
    recommendation: "Consider eco-friendly driving habits."
  },
  2: {
    description: "Green, Low fuel efficiency vehicles.",
    average_comb_fe: 45,
    recommendation: "Plan short trips efficiently."
  }
};

const ClusterGraph: React.FC = () => {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [centroids, setCentroids] = useState<Centroid[]>([]);

  useEffect(() => {
    const fetchClusterData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/cluster-graph");
        setDataPoints(response.data.points);
        setCentroids(response.data.centroids);
      } catch (error) {
        console.error("Error fetching cluster data:", error);
      }
    };

    fetchClusterData();
  }, []);

  useEffect(() => {
    if (dataPoints.length > 0 && centroids.length > 0) {
      drawChart(dataPoints, centroids);
    }
  }, [dataPoints, centroids]);

  const drawChart = (data: DataPoint[], centroids: Centroid[]) => {
    d3.select("#cluster-chart").selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3
      .select("#cluster-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.x) as [number, number])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.y) as [number, number])
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text("PCA Component 1");

    svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(10))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("fill", "white")
      .style("text-anchor", "middle")
      .text("PCA Component 2");

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background-color", "#333")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "5px")
      .style("visibility", "hidden")
      .style("font-size", "12px");

    // Add data points
    svg
      .selectAll(".point")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 5)
      .attr("fill", (d) => colorScale(d.cluster.toString()) as string)
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(
            `
            <strong>Car:</strong> ${d.details["Car Model and Year"]}<br>
            <strong>Combined FE:</strong> ${d.details["Combined FE"]} MPG<br>
            <strong>Annual Cost:</strong> $${d.details["Annual Fuel Cost"]}<br>
            <strong>Cluster:</strong> ${d.details.Cluster}<br>
            <strong>Distance from Avg:</strong> ${d.details["Distance from Cluster"]}
            `
          );

        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("fill", d3.color(colorScale(d.cluster.toString()) as string)?.darker(1)?.toString() || "#000");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 20}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", (event, d) => {
        tooltip.style("visibility", "hidden");

        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", 5)
          .attr("fill", colorScale(d.cluster.toString()) as string);
      });

    // Add centroids
    svg
      .selectAll(".centroid")
      .data(centroids)
      .enter()
      .append("path")
      .attr("d", d3.symbol().type(d3.symbolCross).size(200))
      .attr("transform", (d) => `translate(${xScale(d.x)},${yScale(d.y)})`)
      .attr("fill", "red");
  };

  return (
    <div>
      <div className="text-center mb-6 p-4 bg-gray-900 text-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Understanding the Cluster Model</h2>
        <p className="text-sm">
          The cluster model groups cars based on their fuel efficiency, annual fuel costs, and other features.
          Each cluster represents a unique category of vehicles, ranging from high fuel efficiency to low fuel 
          efficiency. This visualization helps users identify patterns and provides actionable recommendations 
          for improving fuel efficiency and reducing costs.
        </p>
      </div>
      <div
        className="cluster-key grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg shadow-md"
        style={{ color: "#fff", lineHeight: "1.8" }}
      >
        <div id="cluster-chart" className="chart-container mt-6"></div>
        {Object.entries(clusterInsights).map(([key, value]) => (
          <div
            key={key}
            className="p-4 border border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
            style={{ backgroundColor: "#1f1f1f" }}
          >
            <strong className="text-lg">Cluster {key}</strong>
            <p>
              <em>{value.description}</em>
            </p>
            <p>
              <strong>Avg FE:</strong> {value.average_comb_fe} MPG
            </p>
            <p>
              <strong>Tips:</strong> {value.recommendation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );  
}

export default ClusterGraph;
