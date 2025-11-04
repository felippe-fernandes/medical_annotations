"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const patientSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  dataNascimento: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  initialData?: {
    id: string;
    nome: string;
    dataNascimento: Date | null;
  };
}

export function PatientForm({ initialData }: PatientFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      dataNascimento: initialData?.dataNascimento
        ? new Date(initialData.dataNascimento).toISOString().split('T')[0]
        : "",
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      const url = initialData
        ? `/api/patients/${initialData.id}`
        : "/api/patients";

      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          dataNascimento: data.dataNascimento || null,
        }),
      });

      if (!response.ok) throw new Error("Erro ao salvar paciente");

      const result = await response.json();
      router.push(`/patients/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar paciente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nome */}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-slate-300 mb-1">
          Nome *
        </label>
        <input
          {...register("nome")}
          type="text"
          id="nome"
          className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nome do paciente"
        />
        {errors.nome && (
          <p className="mt-1 text-sm text-red-400">{errors.nome.message}</p>
        )}
      </div>

      {/* Data de Nascimento */}
      <div>
        <label htmlFor="dataNascimento" className="block text-sm font-medium text-slate-300 mb-1">
          Data de Nascimento
        </label>
        <input
          {...register("dataNascimento")}
          type="date"
          id="dataNascimento"
          className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-900 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
