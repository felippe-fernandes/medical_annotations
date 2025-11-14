import { parseDateToLocal } from "@/lib/dateUtils";
import type { DailyNote, PatientData } from "@/lib/types";
import { sanitizeFileName } from "@/lib/utils/security";
import { endOfDay, format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";

export interface PDFExportOptions {
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
}

const humorLabels = ["Muito Ruim", "Ruim", "Neutro", "Bom", "Muito Bom"];

const tagColors: Record<string, { bg: [number, number, number]; text: [number, number, number] }> = {
  consulta: { bg: [219, 234, 254], text: [30, 58, 138] },
  doente: { bg: [254, 226, 226], text: [127, 29, 29] },
  exame: { bg: [233, 213, 255], text: [76, 29, 149] },
  internação: { bg: [254, 243, 199], text: [120, 53, 15] },
  cirurgia: { bg: [252, 231, 243], text: [131, 24, 67] },
  emergência: { bg: [255, 237, 213], text: [154, 52, 18] },
  default: { bg: [226, 232, 240], text: [51, 65, 85] },
};

export function generatePatientPDF(patient: PatientData, options: PDFExportOptions = {}) {
  const doc = new jsPDF();
  let yPosition = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  doc.setFillColor(30, 58, 138);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text("Med Notes", margin, yPosition + 10);

  doc.setFontSize(10);
  doc.setTextColor(219, 234, 254);
  doc.text("Sistema de Anotações Médicas", margin, yPosition + 18);

  doc.setFontSize(9);
  doc.setTextColor(191, 219, 254);
  const generatedDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm");
  doc.text(`Gerado em ${generatedDate}`, pageWidth - margin, yPosition + 18, { align: "right" });

  yPosition = 45;

  let filteredNotes = [...patient.dailyNotes];

  if (options.startDate && options.endDate) {
    const filterStart = startOfDay(options.startDate);
    const filterEnd = endOfDay(options.endDate);

    filteredNotes = filteredNotes.filter((note) => {
      const noteDate = parseDateToLocal(note.data);
      const noteStartOfDay = startOfDay(noteDate);

      return noteStartOfDay >= filterStart && noteStartOfDay <= filterEnd;
    });
  }

  if (options.tags && options.tags.length > 0) {
    filteredNotes = filteredNotes.filter((note) => {
      return note.tags.some((tag) => options.tags!.includes(tag));
    });
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  const cardHeight = patient.dataNascimento ? 32 : 25;
  doc.roundedRect(margin, yPosition, contentWidth, cardHeight, 2, 2, "FD");

  yPosition += 8;
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("Informações do Paciente", margin + 5, yPosition);

  yPosition += 8;
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text(`Paciente: ${patient.nome}`, margin + 5, yPosition);

  if (patient.dataNascimento) {
    yPosition += 7;
    const birthDate = format(new Date(patient.dataNascimento), "dd/MM/yyyy");
    doc.text(`Data de Nascimento: ${birthDate}`, margin + 5, yPosition);
  }

  yPosition += 7;
  doc.text(`Total de Anotações: ${filteredNotes.length}`, margin + 5, yPosition);

  if (options.startDate && options.endDate) {
    yPosition += 6;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const dateRange = `Período filtrado: ${format(options.startDate, "dd/MM/yyyy")} até ${format(options.endDate, "dd/MM/yyyy")}`;
    doc.text(dateRange, margin + 5, yPosition);
  }

  if (options.tags && options.tags.length > 0) {
    yPosition += 6;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    const tagsFilter = `Tags filtradas: ${options.tags.join(", ")}`;
    doc.text(tagsFilter, margin + 5, yPosition);
  }

  yPosition += cardHeight - (patient.dataNascimento ? 23 : 16);

  yPosition += 12;
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text("Histórico de Anotações", margin, yPosition);

  yPosition += 3;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, margin + 60, yPosition);

  yPosition += 10;
  doc.setLineWidth(0.2);

  const uniqueNotes = filteredNotes.reduce((acc, note) => {
    const noteTime = parseDateToLocal(note.data).getTime();
    const exists = acc.some(n => parseDateToLocal(n.data).getTime() === noteTime);
    if (!exists) {
      acc.push(note);
    }
    return acc;
  }, [] as DailyNote[]);

  const sortedNotes = uniqueNotes.sort(
    (a, b) => parseDateToLocal(b.data).getTime() - parseDateToLocal(a.data).getTime()
  );

  sortedNotes.forEach((note, index) => {
    const noteDate = parseDateToLocal(note.data);

    const isIncomplete = !note.horaDormiu || !note.horaAcordou;

    let totalCardHeight = 13;

    if (note.tags && note.tags.length > 0) {
      totalCardHeight += 8;
    }

    let boxHeight = 12;
    if (note.horaAcordou || note.horaDormiu) boxHeight += 8;
    if (note.humor) boxHeight += 8;
    if (note.detalhesExtras) {
      const detailsLines = doc.splitTextToSize(note.detalhesExtras, contentWidth - 14);
      boxHeight += detailsLines.length * 5 + 10;
    }
    if (note.hourlyNotes.length > 0) {
      note.hourlyNotes.forEach((hourly) => {
        const hourlyLines = doc.splitTextToSize(`  ${hourly.hora} - ${hourly.descricao}`, contentWidth - 14);
        boxHeight += hourlyLines.length * 5 + 2;
      });
      boxHeight += 8;
    }
    totalCardHeight += boxHeight + 2;

    if (yPosition + totalCardHeight > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const cardStartY = yPosition;

    if (isIncomplete) {
      doc.setDrawColor(251, 191, 36);
    } else {
      doc.setDrawColor(203, 213, 225);
    }
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, cardStartY, contentWidth, totalCardHeight, 2, 2, "S");
    doc.setLineWidth(0.2);

    if (isIncomplete) {
      doc.setFillColor(254, 243, 199);
    } else {
      doc.setFillColor(241, 245, 249);
    }
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, cardStartY, contentWidth, 11, "F");

    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.setFont("helvetica", "bold");
    const formattedDate = format(noteDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    doc.text(formattedDate, margin + 4, yPosition + 7.5);

    doc.setFont("helvetica", "normal");
    yPosition += 13;

    if (note.tags && note.tags.length > 0) {
      let tagX = margin + 4;
      note.tags.forEach((tag) => {
        const colors = tagColors[tag] || tagColors.default;
        doc.setFillColor(...colors.bg);
        doc.setTextColor(...colors.text);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");

        const tagText = ` ${tag} `;
        const tagWidth = doc.getTextWidth(tagText) + 4;
        const tagHeight = 5;

        doc.roundedRect(tagX, yPosition - 3, tagWidth, tagHeight, 1.5, 1.5, "F");
        doc.setDrawColor(...colors.text);
        doc.setLineWidth(0.3);
        doc.roundedRect(tagX, yPosition - 3, tagWidth, tagHeight, 1.5, 1.5, "S");
        doc.setLineWidth(0.2);

        doc.text(tagText, tagX + 2, yPosition + 0.5);

        tagX += tagWidth + 4;
      });
      doc.setFont("helvetica", "normal");
      yPosition += 8;
    }

    yPosition += 5;

    if (note.horaAcordou || note.horaDormiu) {
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      let sleepText = "";
      if (note.horaAcordou) sleepText += `Acordou: ${note.horaAcordou}`;
      if (note.horaAcordou && note.horaDormiu) sleepText += "  |  ";
      if (note.horaDormiu) sleepText += `Dormiu: ${note.horaDormiu}`;
      doc.text(sleepText, margin + 6, yPosition);
      yPosition += 8;
    }

    if (note.humor) {
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(`Humor: ${humorLabels[note.humor - 1]} (${note.humor}/5)`, margin + 6, yPosition);
      yPosition += 8;
    }

    if (note.detalhesExtras) {
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138);
      doc.setFont("helvetica", "bold");
      doc.text("Detalhes:", margin + 6, yPosition);
      yPosition += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const detailsLines = doc.splitTextToSize(note.detalhesExtras, contentWidth - 14);
      detailsLines.forEach((line: string) => {
        doc.text(line, margin + 6, yPosition);
        yPosition += 5;
      });
      yPosition += 4;
    }

    if (note.hourlyNotes.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138);
      doc.setFont("helvetica", "bold");
      doc.text(`Registros Horarios (${note.hourlyNotes.length}):`, margin + 6, yPosition);
      yPosition += 6;

      doc.setFont("helvetica", "normal");
      note.hourlyNotes.forEach((hourly) => {
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const hourlyText = `  ${hourly.hora} - ${hourly.descricao}`;
        const hourlyLines = doc.splitTextToSize(hourlyText, contentWidth - 14);
        hourlyLines.forEach((line: string) => {
          doc.text(line, margin + 6, yPosition);
          yPosition += 5;
        });
        yPosition += 2;
      });
    }

    yPosition = cardStartY + totalCardHeight + 6;
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  let fileName = sanitizeFileName(patient.nome);

  if (options.startDate && options.endDate) {
    const startStr = format(options.startDate, "dd-MM-yyyy");
    const endStr = format(options.endDate, "dd-MM-yyyy");
    fileName += `_${startStr}_a_${endStr}`;
  }

  fileName += `_gerado_${format(new Date(), "dd-MM-yyyy")}.pdf`;

  doc.save(fileName);
}
