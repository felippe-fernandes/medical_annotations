import { jsPDF } from "jspdf";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

// Função helper para parsear datas evitando problemas de timezone
function parseLocalDate(date: Date | string): Date {
  if (date instanceof Date && !isNaN(date.getTime())) {
    // Extrair componentes UTC e criar data local
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return new Date(year, month, day);
  }

  const dateStr = date.toString();
  if (dateStr.includes('-') && dateStr.includes('T')) {
    const [datePart] = dateStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  } else if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(date);
}

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
  let yPosition = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Header com fundo azul
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(0, 0, pageWidth, 35, "F");

  // Logo e Título
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.text("Med Notes", margin, yPosition + 10);

  doc.setFontSize(10);
  doc.setTextColor(219, 234, 254); // blue-200
  doc.text("Sistema de Anotações Médicas", margin, yPosition + 18);

  // Data de geração no canto direito do header
  doc.setFontSize(9);
  doc.setTextColor(191, 219, 254); // blue-300
  const generatedDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm");
  doc.text(`Gerado em ${generatedDate}`, pageWidth - margin, yPosition + 18, { align: "right" });

  yPosition = 45;

  // Filtrar notas por data
  let filteredNotes = [...patient.dailyNotes];

  if (options.startDate && options.endDate) {
    const filterStart = startOfDay(options.startDate);
    const filterEnd = endOfDay(options.endDate);

    filteredNotes = filteredNotes.filter((note) => {
      const noteDate = parseLocalDate(note.data);
      const noteStartOfDay = startOfDay(noteDate);

      // Incluir se a nota está entre o início e fim (inclusive)
      return noteStartOfDay >= filterStart && noteStartOfDay <= filterEnd;
    });
  }

  // Card de Informações do Paciente
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  const cardHeight = patient.dataNascimento ? 32 : 25;
  doc.roundedRect(margin, yPosition, contentWidth, cardHeight, 2, 2, "FD");

  yPosition += 8;
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Informações do Paciente", margin + 5, yPosition);

  yPosition += 8;
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(`Paciente: ${patient.nome}`, margin + 5, yPosition);

  if (patient.dataNascimento) {
    yPosition += 7;
    const birthDate = format(new Date(patient.dataNascimento), "dd/MM/yyyy");
    doc.text(`Data de Nascimento: ${birthDate}`, margin + 5, yPosition);
  }

  yPosition += 7;
  doc.text(`Total de Anotações: ${filteredNotes.length}`, margin + 5, yPosition);

  // Informações de filtro
  if (options.startDate && options.endDate) {
    yPosition += 6;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    const dateRange = `Período filtrado: ${format(options.startDate, "dd/MM/yyyy")} até ${format(options.endDate, "dd/MM/yyyy")}`;
    doc.text(dateRange, margin + 5, yPosition);
  }

  yPosition += cardHeight - (patient.dataNascimento ? 23 : 16);

  // Seção de Histórico de Anotações
  yPosition += 12;
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text("Histórico de Anotações", margin, yPosition);

  // Linha decorativa abaixo do título
  yPosition += 3;
  doc.setDrawColor(59, 130, 246); // blue-500
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, margin + 60, yPosition);

  yPosition += 10;
  doc.setLineWidth(0.2);

  // Ordenar notas por data (mais recente primeiro) e remover duplicatas
  const uniqueNotes = filteredNotes.reduce((acc, note) => {
    const noteTime = parseLocalDate(note.data).getTime();
    const exists = acc.some(n => parseLocalDate(n.data).getTime() === noteTime);
    if (!exists) {
      acc.push(note);
    }
    return acc;
  }, [] as DailyNote[]);

  const sortedNotes = uniqueNotes.sort(
    (a, b) => parseLocalDate(b.data).getTime() - parseLocalDate(a.data).getTime()
  );

  sortedNotes.forEach((note, index) => {
    // Verificar se precisa de nova página
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    // Card para cada nota
    const noteDate = parseLocalDate(note.data);

    // Cabeçalho da nota com fundo cinza
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(margin, yPosition, contentWidth, 11, 1.5, 1.5, "FD");

    // Data da anotação no cabeçalho
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138); // blue-900
    doc.setFont(undefined, "bold");
    const formattedDate = format(noteDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    doc.text(formattedDate, margin + 4, yPosition + 7.5);

    doc.setFont(undefined, "normal");
    yPosition += 13;

    // Tags
    if (note.tags && note.tags.length > 0) {
      let tagX = margin + 3;
      note.tags.forEach((tag) => {
        const colors = tagColors[tag] || tagColors.default;
        doc.setFillColor(...colors.bg);
        doc.setTextColor(...colors.text);
        doc.setFontSize(8);

        const tagText = ` ${tag} `;
        const tagWidth = doc.getTextWidth(tagText) + 2;

        doc.roundedRect(tagX, yPosition - 2.5, tagWidth, 4.5, 1, 1, "F");
        doc.text(tagText, tagX + 1, yPosition);

        tagX += tagWidth + 3;
      });
      yPosition += 6;
    }

    // Box com informações
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(255, 255, 255); // white

    const boxStartY = yPosition;
    let boxHeight = 12;

    // Calcular altura necessária
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

    doc.roundedRect(margin, boxStartY, contentWidth, boxHeight, 1.5, 1.5, "FD");

    yPosition += 7;

    // Horários de sono
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

    // Humor
    if (note.humor) {
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(`Humor: ${humorLabels[note.humor - 1]} (${note.humor}/5)`, margin + 6, yPosition);
      yPosition += 8;
    }

    // Detalhes extras
    if (note.detalhesExtras) {
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138); // blue-900
      doc.setFont(undefined, "bold");
      doc.text("Detalhes:", margin + 6, yPosition);
      yPosition += 6;

      doc.setFont(undefined, "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // slate-700
      const detailsLines = doc.splitTextToSize(note.detalhesExtras, contentWidth - 14);
      detailsLines.forEach((line: string) => {
        doc.text(line, margin + 6, yPosition);
        yPosition += 5;
      });
      yPosition += 4;
    }

    // Registros horários
    if (note.hourlyNotes.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138); // blue-900
      doc.setFont(undefined, "bold");
      doc.text(`Registros Horarios (${note.hourlyNotes.length}):`, margin + 6, yPosition);
      yPosition += 6;

      doc.setFont(undefined, "normal");
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
  let fileName = patient.nome.replace(/\s+/g, "_");

  // Adicionar período filtrado ao nome se houver
  if (options.startDate && options.endDate) {
    const startStr = format(options.startDate, "dd-MM-yyyy");
    const endStr = format(options.endDate, "dd-MM-yyyy");
    fileName += `_${startStr}_a_${endStr}`;
  }

  // Adicionar data de geração
  fileName += `_gerado_${format(new Date(), "dd-MM-yyyy")}.pdf`;

  doc.save(fileName);
}
