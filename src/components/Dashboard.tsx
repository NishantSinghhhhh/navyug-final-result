import React, { useState } from "react";
import { creds } from "../data/creds";
import { results } from "../data/Result";
import jsPDF from "jspdf";
import JSZip from "jszip";

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
      return "Category 1"; // Only return "Category 1" without the schoolTag
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
    const zip = new JSZip(); // Initialize zip
     const pdfs = [];

     results.forEach((school, index) => {
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

      const tableContent = [
        `We are delighted to take this opportunity to commend the remarkable efforts to the students from  ${schoolName} in the  ${categoryText} for their outstanding project at Navyug 2024-25. Their exceptional work has earned them a special mention, recognizing their innovative approach and dedication.`,
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
        "Their dedication and creativity in tackling ",
      ].join("\n");

      // Create and download the file
      const blob = new Blob([tableContent], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${schoolName.replace(/\s+/g, "_")}_Results.txt`;
      link.click();
    });
  };
  
  const addHighlightedMessage = (pdf, schoolName, tag, categoryText, startY) => {
    let yPos = startY;
    const margin = 15;
    const maxWidth = 180;
  
    // Store current text state
    const defaultFontSize = pdf.getFontSize();
    
    // Function to measure text width
    const getTextWidth = (text) => {
      return pdf.getStringUnitWidth(text) * defaultFontSize / pdf.internal.scaleFactor;
    };
  
    // Function to draw a single text segment with specific styling
    const drawStyledText = (text, isHighlighted, xPos) => {
      if (isHighlighted) {
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(0, 0, 0); 
      } else {
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0); 
      }
      pdf.text(text, xPos, yPos);
      return getTextWidth(text);
    };
    
    // Function to convert tag to "1st", "2nd", "3rd"
    const formatTag = (tag) => {
      if (tag == "1") return "1st";
      if (tag == "2") return "2nd";
      if (tag == "3") return "3rd";
      return tag.toString(); // Default behavior for other values
    };
  
    // Break message into segments with their styles
    const segments = [
      { text: "We are delighted to take this opportunity to commend the remarkable efforts of the students from ", highlight: false },
      { text: schoolName, highlight: true },
      { text: " in ", highlight: false },
      { text: categoryText, highlight: true },
      { text: " for their outstanding project for Navyug 2024-25. Their exceptional work has earned them a ", highlight: false },
      { text: "special mention,", highlight: true },
      { text: " recognizing their innovative approach and dedication", highlight: false },
     
    ];
  
    let currentX = margin;
    let currentLine = [];
    let remainingWidth = maxWidth;
  
    // Process each segment
    segments.forEach(segment => {
      let words = segment.text.split(' ');
  
      words.forEach((word, wordIndex) => {
        const wordWithSpace = word + (wordIndex < words.length - 1 ? ' ' : '');
        const wordWidth = getTextWidth(wordWithSpace);
  
        if (wordWidth > remainingWidth) {
          // Draw current line
          currentX = margin;
          currentLine.forEach(item => {
            const width = drawStyledText(item.text, item.highlight, currentX);
            currentX += width;
          });
  
          // Reset for new line
          yPos += 7;
          currentX = margin;
          currentLine = [];
          remainingWidth = maxWidth;
        }
  
        currentLine.push({
          text: wordWithSpace,
          highlight: segment.highlight
        });
        remainingWidth -= wordWidth;
      });
    });
  
    // Draw any remaining text
    if (currentLine.length > 0) {
      currentX = margin;
      currentLine.forEach(item => {
        const width = drawStyledText(item.text, item.highlight, currentX);
        currentX += width;
      });
      yPos += 7;
    }
  
    // Reset text styling to default
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
  
    return yPos;
  };
  
  const createStyledTable = (pdf, tableData, startY) => {
    // Table configuration
    const headers = ["No.", "Name", "Category"];
    const columnWidths = [20, 100, 60];
    const tableWidth = columnWidths.reduce((a, b) => a + b, 0);
    const tableX = 15;
    let yPos = startY + 15;
    const tableY = yPos;
    const rowHeight = 12;
  
    // Draw table background and border
    pdf.setDrawColor(234, 234, 234); // Light gray border
    pdf.setLineWidth(0.5);
    pdf.rect(
      tableX, 
      tableY - 8, 
      tableWidth, 
      10 + (tableData.length * rowHeight)
    );
  
    // Header styling - matching the blue from the image
    pdf.setFillColor(33, 150, 243); // Bright blue header
    pdf.rect(tableX, tableY - 8, tableWidth, 10, "F");
  
    // Header text
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFont("helvetica", "bold");
    let xHeaderPos = tableX;
  
    // Add header text
    headers.forEach((header, index) => {
      pdf.text(header, xHeaderPos + 5, tableY);
      
      // Add vertical lines between columns
      if (index < headers.length - 1) {
        pdf.setDrawColor(234, 234, 234);
        pdf.line(
          xHeaderPos + columnWidths[index],
          tableY - 8,
          xHeaderPos + columnWidths[index],
          tableY + 2 + (tableData.length * rowHeight)
        );
      }
      xHeaderPos += columnWidths[index];
    });
  
    // Table Rows
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    yPos += 10;
  
    // Render each row
    tableData.forEach((row, index) => {
      // Zebra striping - matching the light gray from the image
      if (index % 2 === 0) {
        pdf.setFillColor(247, 247, 247);
        pdf.rect(tableX, yPos - 6, tableWidth, rowHeight, "F");
      }
  
      let xRowPos = tableX;
      const rowData = [
        String(index + 1),
        row.name,
        row.category
      ];
  
      // Horizontal lines between rows
      pdf.setDrawColor(234, 234, 234);
      pdf.line(tableX, yPos - 6, tableX + tableWidth, yPos - 6);
  
      // Add cell text
      rowData.forEach((text, colIndex) => {
        const maxWidth = columnWidths[colIndex] - 10;
        const truncatedText = pdf.splitTextToSize(text, maxWidth)[0];
        pdf.text(truncatedText, xRowPos + 5, yPos);
        xRowPos += columnWidths[colIndex];
      });
  
      yPos += rowHeight;
    });
  
    return yPos;
  };
  
  
  
 const generatePdfFiles = () => {
  results.forEach((school) => {
    const schoolDetails = creds.find((cred) => cred.username === school.schoolID);
    const schoolName = schoolDetails ? schoolDetails.schoolName : "Unknown School";
    const categoryText = getPredominantCategory(school.students);
    
    const pdf = new jsPDF();
    
    // Check for base64Image, if any
      const base64Image = "data:image/jpeg;base64,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" 
      
    if (base64Image) {
      pdf.addImage(base64Image, "PNG", 10, 10, 200, 30);
    }
    
    // Document Title
    pdf.setFontSize(20);
    pdf.setTextColor(44, 62, 80);
    pdf.text(schoolName, 105, 45, { align: "center" });
    
    // Congratulatory Message
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    let yPos = 60;
    
    // const message = `We are delighted to announce that ${schoolName} secured rank ${school.tag}  in ${categoryText} at Navyug 2024-25. This remarkable achievement is a testament to the dedication and hard work of our students and faculty. We extend our heartfelt congratulations and best wishes for your continued success in all future endeavors!`;

    // const wrappedText = pdf.splitTextToSize(message, 180);
    // wrappedText.forEach((line) => {
    //   pdf.text(line, 15, yPos);
    //   yPos += 7;
    // });
    
  // Usage example:
  // let yPos = 60;
  yPos = addHighlightedMessage(
    pdf,
    schoolName,
    school.tag,
    categoryText,
    yPos
  );
    
  yPos = createStyledTable(
    pdf,
    school.students.map(student => ({
      name: student.name,
      category: getCategoryText(student.class, school.tag)
    })),
    yPos
  );
    yPos += 10
    // Footer
    const footerYPos = yPos + 5;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    const message1 = `Their commitment to tackling crucial topics with creativity and determination truly deserves this honor. We extend our heartfelt appreciation for their hard work and excellence.`;
    const wrappedText1 = pdf.splitTextToSize(message1, 180);
    wrappedText1.forEach((line) => {
      pdf.text(line, 15, yPos);
      yPos += 7;
    });
    yPos += 5     
    // Signature
    pdf.setFont("helvetica", "italic");
    pdf.text("Warm Regards,", 15, footerYPos + 20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Team myAimate", 15, footerYPos + 25);
    
    // Page Number
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Page 1 of 1`, 180, 290, { align: "right" });
    
    // Save PDF
    pdf.save(`${schoolName.replace(/\s+/g, "_")}_Results.pdf`);
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
            onClick={generatePdfFiles}
            className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition"
          >
            Download Results as PDF Files
          </button>
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