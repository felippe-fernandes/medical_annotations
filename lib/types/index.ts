// Tipos compartilhados da aplicação

export interface HourlyNote {
  id?: string;
  hora: string;
  descricao: string;
}

export interface DailyNote {
  id: string;
  data: Date;
  horaDormiu: string | null;
  horaAcordou: string | null;
  humor: number | null;
  detalhesExtras: string | null;
  tags: string[];
  hourlyNotes: HourlyNote[];
}

export interface Patient {
  id: string;
  nome: string;
  dataNascimento: Date | null;
  userId: string;
  dailyNotes?: DailyNote[];
}

export interface PatientData {
  nome: string;
  dataNascimento: Date | null;
  dailyNotes: DailyNote[];
}
