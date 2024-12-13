import React, { useState, useEffect, useRef } from "react";
import { Bar, Pie } from "react-chartjs-2";
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
  const collegeKeys = Object.keys(dashboardData.usersPerCollege || {});
  const collegeValues = Object.values(dashboardData.usersPerCollege || {});
  const collegeProgramKeys = Object.keys(
    dashboardData.usersPerCollegeProgram || {}
  );
  const collegeProgramValues = Object.values(
    dashboardData.usersPerCollegeProgram || {}
  );
  const specializationKeys = Object.keys(
    dashboardData.usersPerSpecialization || {}
  );
  const specializationValues = Object.values(
    dashboardData.usersPerSpecialization || {}
  );
  const dashboardRef = useRef(null);

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
  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Helper function to generate an array of colors for the chart
  const generateColorsForChoices = (choices) => {
    return choices.map(() => generateRandomColor());
  };

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
  // for bar
  const createOptions = (stepSize) => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        right: 30,
      }, //
    },
    scales: {
      x: {
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => {
              const value = data.datasets[0].data[i] || 0;
              return {
                text: `${label} - ${value}`,
                fillStyle: data.datasets[0].backgroundColor[i],
                hidden: false,
                index: i,
              };
            });
          },
          font: {
            size: (context) => {
              const width = context.chart.width;
              return width > 800 ? 14 : width > 500 ? 12 : 8;
            },
          },
        },
      },
    },
  });
  const options1 = createOptions(100);
  const options2 = createOptions(2);

  const data1 = {
    labels: collegeKeys,
    datasets: [
      {
        label: "Number of Alumni",
        data: collegeValues,
        backgroundColor: generateColorsForChoices(collegeKeys),
        borderRadius: 4,
      },
    ],
  };

  const data2 = {
    labels: collegeProgramKeys, // Fetch specializations as labels
    datasets: [
      {
        label: "Number of Alumni",
        data: collegeProgramValues,
        backgroundColor: generateColorsForChoices(collegeProgramKeys),
        borderRadius: 4,
      },
    ],
  };

  const data3 = {
    labels: startYears, // Use the dynamic years as labels
    datasets: [
      {
        label: "Number of Alumni",
        // Ensure data is correctly mapped to the start years
        data: startYears.map(
          (year) => dashboardData.usersPerStartYear[year] || 0
        ),
        backgroundColor: generateColorsForChoices(startYears),
        borderRadius: 4,
      },
    ],
  };

  const data4 = {
    labels: gradYears, // Use the dynamic graduation years as labels
    datasets: [
      {
        label: "Number of Alumni Graduated",
        // Ensure data is correctly mapped to the grad years
        data: gradYears.map(
          (year) => dashboardData.usersPerGradYear[year] || 0
        ),
        backgroundColor: generateColorsForChoices(gradYears),
        borderRadius: 4,
      },
    ],
  };

  const employmentStatusColors = generateColorsForChoices([
    "Employed",
    "Self-Employed",
    "Unemployed",
    "Underemployed",
    "Freelancing",
  ]);

  const data5 = {
    labels: [
      "Employed",
      "Self-Employed",
      "Unemployed",
      "Underemployed",
      "Freelancing",
    ],
    datasets: [
      {
        label: "Number of Alumni",
        data: dashboardData.usersPerEmploymentStatus,
        backgroundColor: employmentStatusColors, // Apply dynamic colors
        borderRadius: 4,
      },
    ],
  };
  const workIndustryColors = generateColorsForChoices(["Public", "Private"]);
  const data6 = {
    labels: ["Public", "Private"],
    datasets: [
      {
        label: "Number of Alumni",
        data: dashboardData.usersPerWorkIndustry,
        backgroundColor: workIndustryColors,
        borderRadius: 4,
      },
    ],
  };

  const data7 = {
    labels: timeToJobKeys.map((key) => `${key}`),
    datasets: [
      {
        label: "Number of Alumni",
        data: timeToJobValues,
        backgroundColor: generateColorsForChoices(timeToJobKeys),
        borderRadius: 4,
      },
    ],
  };
  const data8 = {
    labels: specializationKeys,
    datasets: [
      {
        label: "Number of Alumni",
        data: specializationValues,
        backgroundColor: generateColorsForChoices(specializationKeys),
        borderRadius: 4,
      },
    ],
  };
  const genderColors = generateColorsForChoices(["Male", "Female"]);
  const data9 = {
    labels: ["Male", "Female"],
    datasets: [
      {
        label: "Number of Alumni",
        data: dashboardData.usersPerGender,
        backgroundColor: genderColors,
        borderRadius: 4,
      },
    ],
  };
  const regionColors = generateColorsForChoices([
    "NCR",
    "CAR",
    "Region I",
    "Region II",
    "Region III",
    "Region IV-A",
    "Region IV-B",
    "Region V",
    "Region VI",
    "NIR",
    "Region VII",
    "Region VIII",
    "Region IX",
    "Region X",
    "Region XI",
    "Region XII",
    "Region XIII",
    "BARMM",
    "N/A",
  ]);
  const data10 = {
    labels: [
      "NCR",
      "CAR",
      "Region I",
      "Region II",
      "Region III",
      "Region IV-A",
      "Region IV-B",
      "Region V",
      "Region VI",
      "NIR",
      "Region VII",
      "Region VIII",
      "Region IX",
      "Region X",
      "Region XI",
      "Region XII",
      "Region XIII",
      "BARMM",
      "N/A",
    ],
    datasets: [
      {
        label: "Number of Alumni",
        data: dashboardData.usersPerRegion,
        backgroundColor: regionColors,
        borderRadius: 4,
      },
    ],
  };
  // for pie
  const createPieOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: {},
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => {
              const value = data.datasets[0].data[i] || 0;
              return {
                text: `${label} - ${value}`,
                fillStyle: data.datasets[0].backgroundColor[i],
                hidden: false,
                index: i,
              };
            });
          },
          font: {
            size: (context) => {
              const width = context.chart.width;
              return width > 800 ? 14 : width > 500 ? 12 : 8;
            },
          },
        },
      },
    },
  });
  const pieOptions = createPieOptions();
  // Function to trigger the browser's print dialog
  const exportToPDF = () => {
    if (dashboardRef.current) {
      window.print(); // Triggers the print dialog
    }
  };

  return (
    <div
      className="text-black font-light mx-4 md:mx-8 lg:mx-16 mt-4 mb-12 "
      ref={dashboardRef}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium text-gray-700">Dashboard</h1>
        <button
          onClick={exportToPDF}
          className="header btn mb-4 text-sm md:w-64 w-44 bg-blue text-white"
        >
          Export to PDF
        </button>
      </div>
  
   {/* Row 1 */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="text-sm text-black-600">Number of Currently Working Alumni</div>
      <div className="text-lg font-medium mb-1 mt-2">
        {dashboardData.employedUsers}
      </div>
    </div>
  </div>
</div>


<div className="chart mt-4 p-6 border border-black rounded-lg cursor-pointer chart-container">
  <div>
    <div className="text-sm text-black-600">Number of Alumni per College</div>
    <div className="h-80 mt-8">
      <Bar data={data2} options={options1} />
    </div>
  </div>
</div>

     
      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="chart p-6 border border-black rounded-lg cursor-pointer chart-container">
          <div>
            <div className="text-sm text-black-600">Number of Alumni per College Program</div>
            <div className="h-48 mt-8">
              <Bar data={data2} options={options1} />
            </div>
          </div>
        </div>
        <div className="chart p-6 border border-black rounded-lg cursor-pointer chart-container">
          <div>
            <div className="text-sm text-black-600">Number of Alumni per Gender</div>
            <div className="flex items-center justify-center h-64 mt-8">
              <Pie data={data9} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>
  

      {/* Row 3 */}
      <div className="chart mt-4 p-6 border border-black rounded-lg cursor-pointer chart-container">
        <div>
          <div className="text-sm text-black-600">Number of Alumni per Region</div>
          <div className="h-80 mt-8">
            <Bar data={data10} options={options1} />
          </div>
        </div>
      </div>

  
  
      {/* Row 4 */}
      <div className="chart mt-4 p-6 border border-black rounded-lg cursor-pointer chart-container">
        <div>
          <div className="text-sm text-black-600">Number of Alumni per Specialization</div>
          <div className="h-48 mt-8">
            <Bar data={data8} options={options1} />
          </div>
        </div>
      </div>

      {/* Row 5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="chart p-4 border border-black rounded-lg cursor-pointer chart-container">
          <div>
            <div className="text-sm text-black-600">Employment Status</div>
            <div className="flex items-center justify-center h-64 mt-8">
              <Pie data={data5} options={pieOptions} />
            </div>
          </div>
        </div>
        <div className="chart p-4 border border-black rounded-lg cursor-pointer chart-container">
          <div>
            <div className="text-sm text-black-600">Work Industry</div>
            <div className="flex items-center justify-center h-64 mt-8">
              <Pie data={data6} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>
  
      {/* Row 6 */}
      <div className="chart mt-4 p-6 border border-black rounded-lg cursor-pointer chart-container">
        <div>
          <div className="text-sm text-black-600">Entry Year</div>
          <div className="h-48 mt-8">
            <Bar data={data3} options={options1} />
          </div>
        </div>
      </div>
  
      {/* Row 7 */}
      <div className="chart mt-4 p-6 border border-black rounded-lg cursor-pointer chart-container">
        <div>
          <div className="text-sm text-black-600">Batch (Year Graduated)</div>
          <div className="h-48 mt-8">
            <Bar data={data4} options={options1} />
          </div>
        </div>
      </div>
  
      
  
      {/* Row 8 */}
      <div className="chart mt-4 p-4 border border-black rounded-lg cursor-pointer chart-container">
        <div>
          <div className="text-sm text-black-600">How long it takes to land a job</div>
          <div className="chart h-48 mt-8">
            <Bar data={data7} options={options2} />
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default AdminDashboard;
