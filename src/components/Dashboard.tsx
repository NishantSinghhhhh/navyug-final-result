import React, { useState } from "react";
import { creds } from "../data/creds";
import { results } from "../data/Result";

const Dashboard: React.FC = () => {
  const [schoolData, setSchoolData] = useState(results);

  // Function to create table borders
  const createTableBorder = (width: number): string => {
    return "+".concat("-".repeat(width - 2)).concat("+");
  };

  // Function to create table row with proper padding
  const createTableRow = (columns: string[], widths: number[]): string => {
    return "| " + columns.map((col, i) => 
      col.padEnd(widths[i] - 3, " ")
    ).join(" | ") + " |";
  };

  // Function to get category text based on class and tag
  const getCategoryText = (studentClass: string, schoolTag: string) => {
    if (studentClass === "VI-VII") {
      return `Category 1 (${schoolTag})`;
    } else {
      return "Category 2";
    }
  };

  // Function to determine the predominant category
  const getPredominantCategory = (students: any[]) => {
    const hasCategory1 = students.some(student => student.class === "VI-VII");
    const hasCategory2 = students.some(student => student.class === "VIII-IX");
    return hasCategory1 ? "category 1 (Class 6,7)" : "category 2 (Class 8,9)";
  };

  // Function to generate text content for each school
  const generateTextFiles = () => {
    schoolData.forEach((school) => {
      const schoolDetails = creds.find((cred) => cred.username === school.schoolID);
      const schoolName = schoolDetails ? schoolDetails.schoolName : "Unknown School";
      const categoryText = getPredominantCategory(school.students);

      // Define column headers and their minimum widths
      const headers = ["No.", "Name", "Username", "Category"];
      const minWidths = [6, 30, 20, 25];

      // Calculate actual column widths based on content
      const widths = minWidths.map((min, index) => {
        const contentWidths = school.students.map(student => {
          switch(index) {
            case 0: return String(student.name).length + 3;
            case 1: return student.name.length + 3;
            case 2: return student.username.length + 3;
            case 3: return getCategoryText(student.class, school.tag).length + 3;
            default: return min;
          }
        });
        return Math.max(min, ...contentWidths, headers[index].length + 3);
      });

      // Generate table content with dynamic category in the message
      const tableContent = [
        `We feel immense pleasure in informing that ${schoolName} has achieved ${school.tag} rank in ${categoryText} in the Navyug 2024-25. We wish you all the best for your future endeavors.\n`,
        `\nResults for ${schoolName}\n`,
        `\nStudent details:\n`,
        createTableBorder(widths.reduce((a, b) => a + b, 3)),
        createTableRow(headers, widths),
        createTableBorder(widths.reduce((a, b) => a + b, 3)),
        ...school.students.map((student, index) =>
          createTableRow([
            String(index + 1),
            student.name,
            student.username,
            getCategoryText(student.class, school.tag)
          ], widths)
        ),
        createTableBorder(widths.reduce((a, b) => a + b, 3)),
        "\nKeep up the great work, and we wish you all the best for the next round!\n",
        "\nWarm Regards",
        "Team myAimate\n"
      ].join("\n");

      // Create and download the file
      const blob = new Blob([tableContent], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${schoolName.replace(/\s+/g, "_")}_Results.txt`;
      link.click();
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <img src="../assets/logo.svg" alt="Logo" className="h-12 w-auto" />
            <img src="../assets/Ait.svg" alt="AWES Logo" className="h-12" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Round 1 Results
          </h1>
          <p className="text-lg text-gray-600">
            Congratulations! These students have successfully qualified for the second round.
          </p>
        </div>

        <button
          onClick={generateTextFiles}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          Download Results as Text Files
        </button>
      </div>
    </div>
  );
};

export default Dashboard;