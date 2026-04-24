import React from 'react';

interface ReportTemplateProps {
  title: string;
  month: string;
  year: number;
  data: Array<{
    employeeName: string;
    hoursWorked: number;
    tasksCompleted: number;
  }>;
}

const ReportTemplate: React.FC<ReportTemplateProps> = ({ title, month, year, data }) => {
  return (
    <html>
      <head>
        <style>
          {`
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1 {
              text-align: center;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            table, th, td {
              border: 1px solid #ccc;
            }
            th, td {
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f4f4f4;
            }
          `}
        </style>
      </head>
      <body>
        <h1>{title}</h1>
        <p><strong>Month:</strong> {month}</p>
        <p><strong>Year:</strong> {year}</p>

        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Hours Worked</th>
              <th>Tasks Completed</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.employeeName}</td>
                <td>{item.hoursWorked}</td>
                <td>{item.tasksCompleted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </body>
    </html>
  );
};

export default ReportTemplate;
