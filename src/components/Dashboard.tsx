import React, { useState } from "react";
import { creds } from "../data/creds"; // Import creds
import logo3 from "../assets/logo.svg";
import logo4 from "../assets/Ait.svg";
import { results } from "../data/Result";
import { jsPDF } from "jspdf";
import "../assets/Poppins-Regular.ttf";
import "../assets/Montserrat-Regular.ttf";

const Dashboard: React.FC = () => {
  const [schoolData, setSchoolData] = useState(results);

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPosition = margin;

    doc.setFontSize(24);
    doc.text("Round 1 Results", margin, yPosition);
    yPosition += 10;

    schoolData.forEach((school) => {
      const schoolDetails = creds.find((cred) => cred.username === school.schoolID);
      const schoolName = schoolDetails ? schoolDetails.schoolName : "Unknown School";

      doc.setFontSize(18);
      doc.text(`School ID: ${school.schoolID}`, margin, yPosition);
      yPosition += 10;

      doc.setFontSize(16);
      doc.text(`School Name: ${schoolName}`, margin, yPosition);
      yPosition += 10;

      school.students.forEach((student) => {
        doc.setFontSize(12);
        doc.text(`Username: ${student.username}`, margin, yPosition);
        doc.text(`Name: ${student.name}`, margin + 60, yPosition);
        doc.text(`Category: ${student.class}`, margin + 120, yPosition);
        yPosition += 10;

        if (yPosition > 280) {
          doc.addPage();
          yPosition = margin;
        }
      });

      yPosition += 10;
    });

    doc.save("Round_1_Results_All.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <img src={logo3} alt="Logo" className="h-12 w-auto" />
            <img src={logo4} alt="AWES Logo" className="h-12" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Round 1 Results</h1>
          <p className="text-lg text-gray-600">
            Congratulations! These students have successfully qualified for the second round.
          </p>
        </div>

        {schoolData.map((school, schoolIndex) => {
          const schoolDetails = creds.find((cred) => cred.username === school.schoolID);
          const schoolName = schoolDetails ? schoolDetails.schoolName : "Unknown School";

          return (
            <div
              key={schoolIndex}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-10"
            >
              <div className="flex justify-between ">

              <h2 className="text-2xl font-bold text-gray-700 px-6 py-4">
               {schoolName}
                
              </h2>
              <h2 className="text-2xl font-bold text-gray-700 px-6 py-4">
              Rank : {school.tag}
              </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">
                        Category     
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {school.students.map((student, studentIndex) => (
                      <tr
                        key={`${schoolIndex}-${studentIndex}`}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{student.username}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{student.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-semibold text-blue-800">
                            {student.class === "VI-VII" ? "Category 1" : "Category 2"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        <div className="flex justify-center mt-8">
          <button
            onClick={generatePDF}
            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md hover:shadow-lg"
          >
            Download All Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
