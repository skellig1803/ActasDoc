import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ActaData } from '../types/acta';

export const triggerBrowserPrint = () => {
  window.print();
};

export const generatePdfFromElement = async (
  elementId: string,
  acta: ActaData,
  onProgress?: (progress: number) => void
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemento con ID #${elementId} no encontrado`);
  }

  onProgress?.(15);

  // Configure high-resolution canvas
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1024,
  });

  onProgress?.(60);

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Additional pages if document is longer than one page
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  onProgress?.(90);

  const sanitizedNum = (acta.actaNumero || 'SN').replace(/[^a-zA-Z0-9_-]/g, '_');
  const sanitizedFecha = acta.fecha || 'sin_fecha';
  const fileName = `Acta_Nro_${sanitizedNum}_${sanitizedFecha}.pdf`;

  pdf.save(fileName);
  onProgress?.(100);
};

export const formatActaForSharing = (acta: ActaData): string => {
  const tipoEmoji = {
    informe: 'ℹ️ Informe',
    exploracion: '💡 Exploración',
    decision: '✅ Decisión',
  };

  let text = `📋 ${acta.institucion.toUpperCase()}\n`;
  text += `ACTA DE REUNIÓN N° ${acta.actaNumero || 'S/N'}\n`;
  text += `📅 Fecha: ${acta.fecha} | ⏰ ${acta.horaInicio} - ${acta.horaFin || 'En curso'}\n`;
  text += `👤 Facilitador/a: ${acta.facilitador} | ✍️ Secretario/a: ${acta.secretario}\n`;
  text += `📍 Lugar: ${acta.lugar}\n\n`;

  if (acta.ausentes.length > 0) {
    text += `❌ Ausentes: ${acta.ausentes.join(', ')}\n`;
  } else {
    text += `👥 Asistencia: Claustro completo (Sin ausencias)\n`;
  }

  if (acta.invitados) {
    text += `🤝 Invitados: ${acta.invitados}\n`;
  }

  text += `\n════════════════════════════════════\n`;
  text += `2. APERTURA\n`;
  if (acta.apertura.checkIn) text += `• Check-in: ${acta.apertura.checkIn}\n`;
  if (acta.apertura.informesAvisosBreves) text += `• Avisos breves: ${acta.apertura.informesAvisosBreves}\n`;
  if (acta.apertura.compromisosAnteriores) text += `• Compromisos anteriores: ${acta.apertura.compromisosAnteriores}\n`;

  text += `\n════════════════════════════════════\n`;
  text += `3. TRATAMIENTO DE TEMAS DE LA AGENDA\n`;
  acta.temas.forEach((tema, idx) => {
    text += `\n#${idx + 1} ${tema.tema.toUpperCase()} [${tipoEmoji[tema.tipo]}]\n`;
    text += `Traído por: ${tema.traidoPor || 'No especificado'}\n`;
    text += `• Conversado: ${tema.desarrollo}\n`;
    if (tema.resolucion) {
      text += `• Resolución: ${tema.resolucion}\n`;
    }
  });

  if (acta.tareas.length > 0) {
    text += `\n════════════════════════════════════\n`;
    text += `4. PLAN DE ACCIÓN Y TAREAS ASIGNADAS\n`;
    acta.tareas.forEach((tarea, idx) => {
      text += `${idx + 1}. [${tarea.estado.toUpperCase()}] ${tarea.accion}\n`;
      text += `   Responsable: ${tarea.responsable} | Fecha límite: ${tarea.fechaLimite}\n`;
    });
  }

  text += `\n════════════════════════════════════\n`;
  text += `5. CIERRE Y PRÓXIMA REUNIÓN\n`;
  if (acta.cierre.proximaReunionFecha) {
    text += `Próxima reunión: ${acta.cierre.proximaReunionFecha} a las ${acta.cierre.proximaReunionHora || '--:--'}\n`;
  }
  if (acta.cierre.checkOut) {
    text += `Check-out: ${acta.cierre.checkOut}\n`;
  }

  return text;
};
