import React from 'react';

interface ReportTemplateProps {
  title: string;
  month: number;
  year: number;
  userId: string;
  totalHours: number;
  totalAmount: number;
  status?: string;
}

const ReportTemplate: React.FC<ReportTemplateProps> = ({
  title,
  month,
  year,
  userId,
  totalHours,
  totalAmount,
  status,
}) => {
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
            .row {
              margin: 8px 0;
            }
            .label {
              font-weight: 700;
            }
          `}
        </style>
      </head>
      <body>
        <h1>{title}</h1>
        <div className="row">
          <span className="label">Mes:</span> {month}
        </div>
        <div className="row">
          <span className="label">Año:</span> {year}
        </div>
        <div className="row">
          <span className="label">Usuario:</span> {userId}
        </div>
        <div className="row">
          <span className="label">Total horas:</span> {totalHours}
        </div>
        <div className="row">
          <span className="label">Total monto:</span> {totalAmount}
        </div>
        {status ? (
          <div className="row">
            <span className="label">Estado:</span> {status}
          </div>
        ) : null}
      </body>
    </html>
  );
};

export default ReportTemplate;
