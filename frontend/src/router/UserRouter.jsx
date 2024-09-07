import { createBrowserRouter } from "react-router-dom";
import Homepage from "../pages/User/homepage";
import Survey from "../pages/User/Survey";
import User from "../layout/user";
import UserProfile from "../pages/User/UserProfile";
import Threads from "../pages/User/Threads";
import Chatbot from "../pages/User/Chatbot";
import Alumni from "../pages/User/Alumni";
import Certifications from "../pages/User/Contents/Certifications";
import Companies from "../pages/User/Contents/Companies";
import DocumentRequest from "../pages/User/Contents/DocumentRequest";
import Events from "../pages/User/Contents/Events";
import News from "../pages/User/Contents/News";
import Job from "../pages/User/Contents/Job";
import Admin from "../layout/Admin";
import AdminAccount from "../pages/admin/AdminAccount";
import AdminAlumni from "../pages/admin/AdminAlumni";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminHomepage from "../pages/admin/AdminHomepage";
import AdminReports from "../pages/admin/AdminReports";
import AdminThreads from "../pages/admin/AdminThreads";
import AdminSurveyTool from "../pages/admin/AdminSurveyTool";
import AdminCertifications from "../pages/admin/Contents/AdminCertifications";
import AdminCompanies from "../pages/admin/Contents/AdminCompanies";
import AdminDocumentRequest from "../pages/admin/Contents/AdminDocumentRequest";
import AdminEvents from "../pages/admin/Contents/AdminEvents";
import AdminJob from "../pages/admin/Contents/AdminJob";
import AdminNews from "../pages/admin/Contents/AdminNews";
import Login from "../pages/authentication/Login";
import Register from "../pages/authentication/Register";
import ForgotPassword from "../pages/authentication/ForgotPassword";
import ResetPassword from "../pages/authentication/ResetPassword";
import VerifyAccount from "../pages/authentication/VerifyAccount";
import DataPrivacy from "../pages/authentication/DataPrivacy";

const router = createBrowserRouter([
  {
    path: "/",
    element: <User />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/user-alumni",
        element: <Alumni />,
      },
      {
        path: "/user-chatbot",
        element: <Chatbot />,
      },
      {
        path: "/user-survey",
        element: <Survey />,
      },
      {
        path: "/user-threads",
        element: <Threads />,
      },
      {
        path: "/user-userprofile",
        element: <UserProfile />,
      },
      {
        path: "/user-certifications",
        element: <Certifications />,
      },
      {
        path: "/user-companies",
        element: <Companies />,
      },
      {
        path: "/user-documentrequest",
        element: <DocumentRequest />,
      },
      {
        path: "/user-events",
        element: <Events />,
      },
      {
        path: "/user-job",
        element: <Job />,
      },
      {
        path: "/user-news",
        element: <News />,
      },
    ],
  },
  {
    path: "/",
    element: <Admin />,
    children: [
      {
        path: "/admin-account",
        element: <AdminAccount />,
      },
      {
        path: "/admin-alumni",
        element: <AdminAlumni />,
      },
      {
        path: "/admin-dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "/admin-home",
        element: <AdminHomepage />,
      },
      {
        path: "/admin-reports",
        element: <AdminReports />,
      },
      {
        path: "/admin-surveytool",
        element: <AdminSurveyTool />,
      },
      {
        path: "/admin-threads",
        element: <AdminThreads />,
      },
      {
        path: "/admin-certifications",
        element: <AdminCertifications />,
      },
      {
        path: "/admin-companies",
        element: <AdminCompanies />,
      },
      {
        path: "/admin-documentrequest",
        element: <AdminDocumentRequest />,
      },
      {
        path: "/admin-events",
        element: <AdminEvents />,
      },
      {
        path: "/admin-job",
        element: <AdminJob />,
      },
      {
        path: "/admin-news",
        element: <AdminNews />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgotpassword",
    element: <ForgotPassword />,
  },
  {
    path: "/resetpassword",
    element: <ResetPassword />,
  },
  {
    path: "/verifyaccount",
    element: <VerifyAccount />,
  },
  {
    path: "/dataprivacy",
    element: <DataPrivacy />,
  },
]);

export default router;
