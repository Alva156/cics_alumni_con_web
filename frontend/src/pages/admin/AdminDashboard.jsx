import React, { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [fontSize, setFontSize] = useState(getFontSize());
  const chartRefs = useRef([]);

  function getFontSize() {
    if (window.innerWidth < 640) {
      // Small screens
      return 7;
    } else if (window.innerWidth < 768) {
      // Medium screens
      return 9;
    } else if (window.innerWidth < 1024) {
      // Large screens
      return 13;
    } else {
      // Extra large screens
      return 13;
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setFontSize(getFontSize());
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const createOptions = (stepSize) => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: "#000000",
          font: {
            weight: "bold",
            size: fontSize,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#000000",
          font: {
            weight: "bold",
            size: fontSize,
          },
          stepSize,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  });

  const options1 = createOptions(100);
  const options2 = createOptions(2);

  const data1 = {
    labels: ["CS", "IS", "IT"],
    datasets: [
      {
        label: "Number of Alumni",
        data: [555, 300, 801],
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data2 = {
    labels: ["Networking", "Web Development", "Automation"],
    datasets: [
      {
        label: "Number of Alumni",
        data: [300, 700, 200],
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data3 = {
    labels: ["2016", "2017", "2018", "2019", "2020"],
    datasets: [
      {
        label: "Number of Alumni",
        data: [300, 700, 200, 300, 700],
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data4 = {
    labels: ["2020", "2021", "2022", "2023", "2024"],
    datasets: [
      {
        label: "Number of Alumni",
        data: [300, 700, 200, 300, 700, 200],
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data5 = {
    labels: ["Employed", "Unemployed", "Retired", "Underemployed"],
    datasets: [
      {
        label: "Number of Alumni",
        data: [800, 100, 200, 50],
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data6 = {
    labels: [
      "IT",
      "Finance",
      "Healthcare",
      "Retail",
      "Media and Entertainment",
    ],
    datasets: [
      {
        label: "Number of Alumni",
        data: [900, 700, 200, 400, 60],
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data7 = {
    labels: ["1 month", "2 months", "3 months", "4 months", "5 months"],
    datasets: [
      {
        label: "Number of Alumni",
        data: [3, 5, 11, 12, 15],
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <h1 className="text-xl mb-4">Dashboard</h1>

      <div className="mb-4 p-4 border border-black rounded-lg cursor-pointer">
        <div>
          <div className="text-sm text-black-600">Number of Users</div>
          <div className="text-lg font-medium mb-1 mt-2">9990</div>
        </div>
      </div>
      <div className="mb-4 p-4 border border-black rounded-lg cursor-pointer">
        <div>
          <div className="text-sm text-black-600">
            Number of currently employed users
          </div>
          <div className="text-lg font-medium mb-1 mt-2">9990</div>
        </div>
      </div>

      <div className="mb-4 p-6 border border-black rounded-lg cursor-pointer">
        <div>
          <div className="text-sm text-black-600">Academic Program</div>
          <div className="h-48 mt-8">
            <Bar data={data1} options={options1} />
          </div>
        </div>
      </div>
      <div className="mb-4 p-6 border border-black rounded-lg cursor-pointer">
        <div>
          <div className="text-sm text-black-600">Academic Specialization</div>
          <div className="h-48 mt-8">
            <Bar data={data2} options={options1} />
          </div>
        </div>
      </div>
      <div className="mb-4 p-4 border border-black rounded-lg cursor-pointer">
        <div>
          <div className="text-sm text-black-600">Entry Year</div>
          <div className="h-48 mt-8">
            <Bar data={data3} options={options1} />
          </div>
        </div>
      </div>
      <div className="mb-4 p-4 border border-black rounded-lg cursor-pointer">
        <div>
          <div className="text-sm text-black-600">Year Graduated</div>
          <div className="h-48 mt-8">
            <Bar data={data4} options={options1} />
          </div>
        </div>
      </div>
      <div className="mb-4 p-4 border border-black rounded-lg cursor-pointer">
        <div>
          <div className="text-sm text-black-600">Employment Status</div>
          <div className="h-48 mt-8">
            <Bar data={data5} options={options1} />
          </div>
        </div>
      </div>
      <div className="mb-4 p-4 border border-black rounded-lg cursor-pointer">
        <div>
          <div className="text-sm text-black-600">Work Industry</div>
          <div className="h-48 mt-8">
            <Bar data={data6} options={options1} />
          </div>
        </div>
      </div>
      <div className="mb-4 p-4 border border-black rounded-lg cursor-pointer">
        <div>
          <div className="text-sm text-black-600">
            How long it takes to land a job (Months)
          </div>
          <div className="h-48 mt-8">
            <Bar data={data7} options={options2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
