import { jsPDF } from "jspdf";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HourlyNote {
  hora: string;
  descricao: string;
}

interface DailyNote {
  data: Date;
  horaDormiu: string | null;
  horaAcordou: string | null;
  humor: number | null;
  detalhesExtras: string | null;
  tags: string[];
  hourlyNotes: HourlyNote[];
}

interface PatientData {
  nome: string;
  dataNascimento: Date | null;
  dailyNotes: DailyNote[];
}

interface PDFExportOptions {
  startDate?: Date;
  endDate?: Date;
  filterTag?: string;
}

const humorLabels = ["Muito Ruim", "Ruim", "Neutro", "Bom", "Muito Bom"];

const tagColors: Record<string, { bg: [number, number, number]; text: [number, number, number] }> = {
  consulta: { bg: [219, 234, 254], text: [30, 58, 138] }, // blue
  doente: { bg: [254, 226, 226], text: [127, 29, 29] }, // red
  exame: { bg: [233, 213, 255], text: [76, 29, 149] }, // purple
  internação: { bg: [254, 243, 199], text: [120, 53, 15] }, // amber
  cirurgia: { bg: [252, 231, 243], text: [131, 24, 67] }, // pink
  emergência: { bg: [255, 237, 213], text: [154, 52, 18] }, // orange
  default: { bg: [226, 232, 240], text: [51, 65, 85] }, // slate
};

export function generatePatientPDF(patient: PatientData, options: PDFExportOptions = {}) {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Header - Logo e Título
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("🩺 Med Notes", margin, yPosition);

  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("Sistema de Anotações Médicas", margin, yPosition);

  // Linha divisória
  yPosition += 5;
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  // Informações do Paciente
  yPosition += 15;
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text("Informações do Paciente", margin, yPosition);

  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(`Nome: ${patient.nome}`, margin, yPosition);

  if (patient.dataNascimento) {
    yPosition += 7;
    const birthDate = format(new Date(patient.dataNascimento), "dd/MM/yyyy");
    doc.text(`Data de Nascimento: ${birthDate}`, margin, yPosition);
  }

  yPosition += 7;

  // Filtrar notas por data e tag
  let filteredNotes = [...patient.dailyNotes];

  if (options.startDate && options.endDate) {
    const filterStart = startOfDay(new Date(options.startDate));
    const filterEnd = endOfDay(new Date(options.endDate));

    filteredNotes = filteredNotes.filter((note) => {
      const noteDate = startOfDay(new Date(note.data));
      return isWithinInterval(noteDate, {
        start: filterStart,
        end: filterEnd,
      });
    });
  }

  if (options.filterTag) {
    filteredNotes = filteredNotes.filter((note) =>
      note.tags.includes(options.filterTag!)
    );
  }

  doc.text(`Total de Anotações: ${filteredNotes.length}`, margin, yPosition);

  // Informações de filtro
  if (options.startDate || options.endDate || options.filterTag) {
    yPosition += 7;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);

    if (options.startDate && options.endDate) {
      const dateRange = `Período: ${format(options.startDate, "dd/MM/yyyy")} - ${format(options.endDate, "dd/MM/yyyy")}`;
      doc.text(dateRange, margin, yPosition);
      yPosition += 5;
    }

    if (options.filterTag) {
      doc.text(`Filtrado por tag: ${options.filterTag}`, margin, yPosition);
      yPosition += 5;
    }
  }

  // Data de geração do relatório
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Relatório gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, margin, yPosition);

  // Anotações Diárias
  yPosition += 15;
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text("Histórico de Anotações", margin, yPosition);

  yPosition += 10;

  // Ordenar notas por data (mais recente primeiro) e remover duplicatas
  const uniqueNotes = filteredNotes.reduce((acc, note) => {
    const noteTime = new Date(note.data).getTime();
    const exists = acc.some(n => new Date(n.data).getTime() === noteTime);
    if (!exists) {
      acc.push(note);
    }
    return acc;
  }, [] as DailyNote[]);

  const sortedNotes = uniqueNotes.sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  sortedNotes.forEach((note) => {
    // Verificar se precisa de nova página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Data da anotação
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138); // blue-900
    const noteDate = format(new Date(note.data), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    doc.text(noteDate, margin, yPosition);

    yPosition += 8;

    // Tags
    if (note.tags && note.tags.length > 0) {
      let tagX = margin;
      note.tags.forEach((tag) => {
        const colors = tagColors[tag] || tagColors.default;
        doc.setFillColor(...colors.bg);
        doc.setTextColor(...colors.text);
        doc.setFontSize(8);

        const tagText = ` ${tag} `;
        const tagWidth = doc.getTextWidth(tagText) + 2;

        doc.roundedRect(tagX, yPosition - 3, tagWidth, 5, 1, 1, "F");
        doc.text(tagText, tagX + 1, yPosition);

        tagX += tagWidth + 3;
      });
      yPosition += 7;
    }

    // Box com informações
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50

    const boxStartY = yPosition;
    let boxHeight = 10;

    // Calcular altura necessária
    if (note.horaAcordou || note.horaDormiu) boxHeight += 7;
    if (note.humor) boxHeight += 7;
    if (note.detalhesExtras) {
      const detailsLines = doc.splitTextToSize(note.detalhesExtras, contentWidth - 10);
      boxHeight += detailsLines.length * 5 + 7;
    }
    if (note.hourlyNotes.length > 0) {
      boxHeight += note.hourlyNotes.length * 7 + 10;
    }

    doc.rect(margin, boxStartY, contentWidth, boxHeight, "FD");

    yPosition += 5;

    // Horários de sono
    if (note.horaAcordou || note.horaDormiu) {
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      let sleepText = "";
      if (note.horaAcordou) sleepText += `Acordou: ${note.horaAcordou}`;
      if (note.horaAcordou && note.horaDormiu) sleepText += " | ";
      if (note.horaDormiu) sleepText += `Dormiu: ${note.horaDormiu}`;
      doc.text(sleepText, margin + 5, yPosition);
      yPosition += 7;
    }

    // Humor
    if (note.humor) {
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(`Humor: ${humorLabels[note.humor - 1]} (${note.humor}/5)`, margin + 5, yPosition);
      yPosition += 7;
    }

    // Detalhes extras
    if (note.detalhesExtras) {
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text("Detalhes:", margin + 5, yPosition);
      yPosition += 5;

      const detailsLines = doc.splitTextToSize(note.detalhesExtras, contentWidth - 10);
      detailsLines.forEach((line: string) => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 2;
    }

    // Registros horários
    if (note.hourlyNotes.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(`Registros Horários (${note.hourlyNotes.length}):`, margin + 5, yPosition);
      yPosition += 5;

      note.hourlyNotes.forEach((hourly) => {
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        const hourlyText = `  • ${hourly.hora} - ${hourly.descricao}`;
        const hourlyLines = doc.splitTextToSize(hourlyText, contentWidth - 15);
        hourlyLines.forEach((line: string) => {
          doc.text(line, margin + 5, yPosition);
          yPosition += 4;
        });
        yPosition += 3;
      });
    }

    yPosition += 10;
  });

  // Rodapé na última página
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Salvar PDF
  const fileName = `${patient.nome.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
}
