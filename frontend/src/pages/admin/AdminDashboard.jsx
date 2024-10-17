import React, { useState, useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
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
  const [dashboardData, setDashboardData] = useState({});
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const chartRefs = useRef([]);
  const startYears = Object.keys(dashboardData.usersPerStartYear || {});
  const gradYears = Object.keys(dashboardData.usersPerGradYear || {});
  const timeToJobKeys = Object.keys(dashboardData.usersPerTimeToJob || {});
  const timeToJobValues = Object.values(dashboardData.usersPerTimeToJob || {});

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
      // Extra large screenss
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
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/profile/dashboard-stats`,
        {
          withCredentials: true,
        }
      );
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
    labels: ["IT", "CS", "IS"],
    datasets: [
      {
        label: "Number of Alumni",
        data: dashboardData.usersPerProgram,
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data2 = {
    labels: ["Web Development", "Networking", "Automation"], // Fetch specializations as labels
    datasets: [
      {
        label: "Number of Alumni",
        data: dashboardData.usersPerSpecialization,
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data3 = {
    labels: startYears, // Use the dynamic years as labels
    datasets: [
      {
        label: "Number of Alumni",
        data: dashboardData.usersPerStartYear, // Use the dynamic number of users
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data4 = {
    labels: gradYears, // Use the dynamic graduation years as labels
    datasets: [
      {
        label: "Number of Alumni Graduated",
        data: dashboardData.usersPerGradYear, // Use the dynamic number of graduated users
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data5 = {
    labels: ["Employed", "Unemployed", "Underemployed", "Retired"],
    datasets: [
      {
        label: "Number of Alumni",
        data: dashboardData.usersPerEmploymentStatus,
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data6 = {
    labels: ["Local", "International"],
    datasets: [
      {
        label: "Number of Alumni",
        data: dashboardData.usersPerWorkIndustry,
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  const data7 = {
    labels: timeToJobKeys,
    datasets: [
      {
        label: "Number of Alumni",
        data: timeToJobValues,
        backgroundColor: "#BE142E",
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-8 mb-12">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-medium text-gray-700">Dashboard</h1>
      </div>

      <div className="mb-4 p-4 border border-black rounded-lg cursor-pointer">
        <div>
          <div className="text-sm text-black-600">Number of Users</div>
          <div className="text-lg font-medium mb-1 mt-2">
            {dashboardData.numberOfUsers}
          </div>
        </div>
      </div>
      <div className="mb-4 p-4 border border-black rounded-lg cursor-pointer">
        <div>
          <div className="text-sm text-black-600">
            Number of currently employed users
          </div>
          <div className="text-lg font-medium mb-1 mt-2">
            {dashboardData.employedUsers}
          </div>
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
