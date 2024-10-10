import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import "../css/graphchart.css"; // CSS file for styling

const generateUniqueColors = (numColors) => {
  const colors = [];
  while (colors.length < numColors) {
    const hue = Math.floor(Math.random() * 360); // Hue between 0 and 360
    const lightness = 50 + Math.floor(Math.random() * 20); // Lightness between 50 and 70
    const saturation = 60 + Math.floor(Math.random() * 20); // Saturation between 60 and 80
    
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    
    if (!colors.includes(color)) {
      colors.push(color);
    }
  }
  return colors;
};

const GraphCharts = () => {
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [refundStatusData, setRefundStatusData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5001/graph")
      .then((response) => response.json())
      .then((data) => {
        // Processing order status data
        const totalOrderValue = data.order_status.reduce((sum, [_, value]) => sum + value, 0);
        const orderData = data.order_status
          .map(([label, value]) => {
            const percentage = (value / totalOrderValue) * 100;
            return percentage > 1 ? { name: label, value: percentage } : null;
          })
          .filter((item) => item !== null);
        setOrderStatusData(orderData);

        // Processing refund status data
        const totalRefundValue = data.refund_status.reduce((sum, [_, value]) => sum + value, 0);
        const refundData = data.refund_status
          .map(([label, value]) => {
            const percentage = (value / totalRefundValue) * 100;
            return percentage > 1 ? { name: label, value: percentage } : null;
          })
          .filter((item) => item !== null);
        setRefundStatusData(refundData);
      })
      .catch((error) => console.error("Error fetching graph data:", error));
  }, []);

  const orderColors = generateUniqueColors(orderStatusData.length);
  const refundColors = generateUniqueColors(refundStatusData.length);

  return (
    <div className="graph-container">
      <div className="chart-container">
        <h2>Seller Id Distribution</h2>
        <div className="garea">
          <PieChart width={400} height={230}  className="piegraph">
            <Pie
              data={orderStatusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={110}
              dataKey="value"
            >
              {orderStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={orderColors[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
          </PieChart>
        </div>
      </div>
      <div className="chart-container">
        <h2>Category Distribution</h2>
        <div className="garea">
          <PieChart width={400} height={230}>
            <Pie
    
              data={refundStatusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={110}
              dataKey="value"
            >
              {refundStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={refundColors[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default GraphCharts;
