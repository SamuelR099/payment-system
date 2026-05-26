import React from 'react';

export interface TimesheetRow {
  date: string;
  description: string;
  startTime: string;
  endTime: string;
  hours: number;
}

interface ReportTemplateProps {
  logoUrl?: string;
  professionalName: string;
  position: string;
  monthYear: string;
  timesheets: TimesheetRow[];
  totalHours: number;
  hourlyRate: number;
  totalAmount: number;
  professionalSignatureUrl?: string;
  supervisorName: string;
  supervisorSignatureUrl?: string;
  signatureDate: string;
  supervisorSignatureDate?: string;
}

const formatNumber = (num: number, decimals = 2) => {
  return num.toFixed(decimals).replace('.', ',');
};

const ReportTemplate: React.FC<ReportTemplateProps> = ({
  professionalName,
  position,
  monthYear,
  timesheets,
  totalHours,
  hourlyRate,
  totalAmount,
  professionalSignatureUrl,
  supervisorName,
  supervisorSignatureUrl,
  signatureDate,
  supervisorSignatureDate,
}) => {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <style>
          {`
            @page {
              margin: 30px;
            }
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              font-size: 10px;
              color: #000;
              line-height: 1.2;
            }
            .header {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              margin-bottom: 25px;
            }
            .logo-container {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 5px;
            }
            .logo-text {
              font-size: 42px;
              font-weight: 900;
              color: #0077b6;
              letter-spacing: -2px;
              font-family: 'Arial Black', sans-serif;
            }
            .company-subtext {
              color: #0077b6;
              font-size: 11px;
              font-weight: bold;
              margin-top: -5px;
            }
            .doc-title {
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              margin-top: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #999;
              padding: 6px 4px;
              text-align: center;
            }
            th {
              background-color: #efefef;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 9px;
              height: 25px;
            }
            .info-table {
              margin-bottom: 15px;
            }
            .info-table td {
              font-weight: bold;
              font-size: 11px;
              height: 25px;
            }
            .certification-text {
              background-color: #efefef;
              border: 1px solid #999;
              padding: 12px;
              text-align: center;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 11px;
              border-bottom: none;
            }
            .timesheet-table {
              margin-bottom: 0;
            }
            .timesheet-table td {
              height: 35px;
            }
            .timesheet-table td:nth-child(2) {
              text-align: left;
              padding: 8px;
              font-size: 9px;
            }
            .summary-table-container {
              display: flex;
              justify-content: flex-end;
              margin-top: -1px;
            }
            .summary-table {
              width: 40.5%;
            }
            .summary-table td {
              height: 20px;
              padding: 4px 10px;
            }
            .summary-table td:first-child {
              text-align: right;
              font-weight: bold;
              text-transform: uppercase;
              border-left: none;
              width: 60%;
            }
            .summary-table td:last-child {
              text-align: right;
              font-weight: bold;
              width: 40%;
            }
            .currency-cell {
              display: flex;
              justify-content: space-between;
              padding: 0 5px;
            }
            .total-row {
              background-color: #efefef;
            }
            .signature-section {
              margin-top: 25px;
            }
            .signature-header {
              background-color: #efefef;
              border: 1px solid #999;
              padding: 8px;
              text-align: center;
              font-weight: bold;
              margin-bottom: 0;
              border-bottom: none;
            }
            .signature-box {
              border: 1px solid #999;
              padding: 15px 10px;
            }
            .signature-grid {
              display: table;
              width: 100%;
              border-collapse: collapse;
            }
            .signature-row {
              display: table-row;
            }
            .signature-col {
              display: table-cell;
              width: 40%;
              vertical-align: bottom;
              text-align: center;
              padding: 0 10px;
            }
            .signature-col.date-col {
              width: 20%;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 5px;
              margin-bottom: 3px;
            }
            .signature-label {
              font-size: 7px;
              text-transform: uppercase;
              font-weight: bold;
              color: #333;
            }
            .name-display {
              font-size: 11px;
              font-weight: bold;
              margin-bottom: 2px;
            }
            .signature-img {
              max-height: 50px;
              margin-bottom: -10px;
            }
            .spacer-row {
              height: 30px;
            }
          `}
        </style>
      </head>
      <body>
        <div className="header">
          <div className="logo-container">
            <span className="logo-text">PRIS</span>
          </div>
          <div className="company-subtext">Puerto Rico Information Systems, Inc.</div>
          <div className="doc-title">Hoja de Labor Realizada</div>
        </div>

        <table className="info-table">
          <thead>
            <tr>
              <th style={{ width: '33%' }}>Nombre del Profesional</th>
              <th style={{ width: '33%' }}>Cargo</th>
              <th style={{ width: '34%' }}>Mes Facturado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{professionalName}</td>
              <td>{position}</td>
              <td>{monthYear}</td>
            </tr>
          </tbody>
        </table>

        <div className="certification-text">
          Certifico que durante este mes se realizaron los siguientes servicios
        </div>
        <table className="timesheet-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>Día</th>
              <th style={{ width: '53%' }}>Detalle Labor Realizada</th>
              <th style={{ width: '12%' }}>Hora Entrada</th>
              <th style={{ width: '12%' }}>Hora Salida</th>
              <th style={{ width: '11%' }}>Total Hrs</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map((row, index) => (
              <tr key={index}>
                <td>{row.date}</td>
                <td>{row.description}</td>
                <td>{row.startTime}</td>
                <td>{row.endTime}</td>
                <td>{formatNumber(row.hours)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="summary-table-container">
          <table className="summary-table">
            <tbody>
              <tr>
                <td>Total de Horas</td>
                <td>{formatNumber(totalHours)}</td>
              </tr>
              <tr>
                <td>Costo por Hora</td>
                <td>
                  <div className="currency-cell">
                    <span>$</span>
                    <span>{formatNumber(hourlyRate)}</span>
                  </div>
                </td>
              </tr>
              <tr className="total-row">
                <td>Total Facturado</td>
                <td>
                  <div className="currency-cell">
                    <span>$</span>
                    <span>{formatNumber(totalAmount)}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="signature-section">
          <div className="signature-header">Aprobación y certificación</div>
          <div className="signature-box">
            <div className="signature-grid">
              <div className="signature-row">
                <div className="signature-col">
                  <div className="name-display">{professionalName}</div>
                  <div className="signature-line"></div>
                  <div className="signature-label">Nombre en letra de molde del profesional</div>
                </div>
                <div className="signature-col">
                  {professionalSignatureUrl && (
                    <img src={professionalSignatureUrl} className="signature-img" alt="Firma Profesional" />
                  )}
                  <div className="signature-line"></div>
                  <div className="signature-label">Firma del profesional</div>
                </div>
                <div className="signature-col date-col">
                  <div className="name-display">{signatureDate}</div>
                  <div className="signature-line"></div>
                  <div className="signature-label">Fecha</div>
                </div>
              </div>

              <div className="spacer-row"></div>

              <div className="signature-row">
                <div className="signature-col">
                  <div className="name-display">{supervisorName}</div>
                  <div className="signature-line"></div>
                  <div className="signature-label">Nombre en letra de molde del supervisor inmediato</div>
                </div>
                <div className="signature-col">
                  {supervisorSignatureUrl && (
                    <img src={supervisorSignatureUrl} className="signature-img" alt="Firma Supervisor" />
                  )}
                  <div className="signature-line"></div>
                  <div className="signature-label">Firma del supervisor</div>
                </div>
                <div className="signature-col date-col">
                  <div className="name-display">{supervisorSignatureDate}</div>
                  <div className="signature-line"></div>
                  <div className="signature-label">Fecha</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default ReportTemplate;
