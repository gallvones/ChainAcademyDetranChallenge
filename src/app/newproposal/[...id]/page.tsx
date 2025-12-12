"use client";

import { MainLayout } from "@/components/templates";
import { Button } from "@/components/atoms/button";
import Image from "next/image";
import {
  Send,
  DollarSign,
  User,
  Mail,
  Phone,
  MessageSquare,
  Car,
  Calendar,
  Palette,
  Hash,
  MapPin,
} from "lucide-react";
import { use, useState, useEffect } from "react";

export default function NewProposal({ params }: { params: Promise<{ id: string[] }> }) {
  const resolvedParams = use(params);
  const carId = resolvedParams.id[0];

  const [car, setCar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    proposedValue: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await fetch(`/api/cars/${carId}`);
        const data = await response.json();
        setCar(data);
      } catch (error) {
        console.error("Erro ao buscar carro:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCar();
  }, [carId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Pegar userId do localStorage
      const userDetranStr = localStorage.getItem("userDetran");
      if (!userDetranStr) {
        alert("Você precisa estar autenticado para enviar uma proposta");
        setIsSubmitting(false);
        return;
      }

      const userDetran = JSON.parse(userDetranStr);
      const userId = userDetran.id;

      // Converter phone e amount para números
      const phoneNumber = parseFloat(formData.phone.replace(/\D/g, ''));
      const amountNumber = parseFloat(formData.proposedValue.replace(/[^\d,]/g, '').replace(',', '.'));

      // Enviar proposta para a API
      const response = await fetch("/api/proposals/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          carId,
          email: formData.email,
          phone: phoneNumber,
          amount: amountNumber,
          description: formData.message || "Sem mensagem adicional",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar proposta");
      }

      alert("Proposta enviada com sucesso!");

      // Resetar formulário
      setFormData({
        name: "",
        email: "",
        phone: "",
        proposedValue: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Erro ao enviar proposta:", error);
      alert(error.message || "Erro ao enviar proposta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#FFEB3B] bg-clip-text text-transparent drop-shadow-lg">
              Faça sua Proposta
            </h1>
            <p className="text-lg text-gray-600">
              Confira os detalhes do veículo e preencha o formulário abaixo
            </p>
          </div>

          {/* Car Info Container */}
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(255,193,7,0.15)] border border-[#FFC107]/30 p-8">
              <p className="text-center text-gray-500">Carregando informações do veículo...</p>
            </div>
          ) : car ? (
            <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(255,193,7,0.15)] border border-[#FFC107]/30 overflow-hidden">
              <div className="grid md:grid-cols-3 gap-6 p-6">
                {/* Image */}
                <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                  {car.img ? (
                    <Image
                      src={car.img}
                      alt={car.name}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFC107]/90 text-black text-xs font-bold">
                      <MapPin className="w-3 h-3" />
                      {car.uf}
                    </div>
                  </div>
                </div>

                {/* Car Details */}
                <div className="md:col-span-2 space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Car className="w-6 h-6 text-[#FFC107]" />
                    {car.name}
                  </h2>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {car.info?.model && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-semibold">Modelo:</span>
                        <span>{car.info.model}</span>
                      </div>
                    )}
                    {car.info?.year && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-[#FFC107]" />
                        <span>{car.info.year}</span>
                      </div>
                    )}
                    {car.info?.color && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Palette className="w-4 h-4 text-[#FFC107]" />
                        <span className="capitalize">{car.info.color}</span>
                      </div>
                    )}
                    {car.info?.plates && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Hash className="w-4 h-4 text-[#FFC107]" />
                        <span className="font-mono font-semibold">{car.info.plates}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="font-semibold">Chassi:</span>
                      <span className="font-mono">{car.chassi}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(255,193,7,0.15)] border border-[#FFC107]/30 overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Grid de 2 colunas para inputs */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Nome completo */}
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                    >
                      <User className="w-3.5 h-3.5 text-[#FFC107]" />
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all outline-none text-gray-900 text-sm"
                      placeholder="Digite seu nome completo"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#FFC107]" />
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all outline-none text-gray-900 text-sm"
                      placeholder="seu@email.com"
                    />
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#FFC107]" />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all outline-none text-gray-900 text-sm"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  {/* Valor proposto */}
                  <div className="space-y-2">
                    <label
                      htmlFor="proposedValue"
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-[#FFC107]" />
                      Valor Proposto
                    </label>
                    <input
                      type="text"
                      id="proposedValue"
                      name="proposedValue"
                      value={formData.proposedValue}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all outline-none text-gray-900 font-bold text-sm"
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>

                {/* Mensagem - Linha completa */}
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wide"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#FFC107]" />
                    Mensagem (Opcional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg border-2 border-gray-200 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all outline-none text-gray-900 resize-none text-sm"
                    placeholder="Adicione uma mensagem ou detalhes sobre sua proposta..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex gap-3">
                  <Button
                    type="submit"
                    variant="amber"
                    hoverColor="yellow"
                    size="md"
                    disabled={isSubmitting}
                    className="flex-1"
                    icon={<Send className="w-4 h-4" />}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Proposta"}
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    href={`/myproposals/${carId}`}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>

                {/* Info Box */}
                <div className="p-3 bg-gradient-to-br from-[#FFC107]/10 to-transparent rounded-lg border border-[#FFC107]/20">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-semibold text-gray-700">Nota:</span>{" "}
                    Sua proposta será enviada diretamente ao proprietário do
                    veículo. Você receberá uma notificação assim que sua
                    proposta for visualizada ou respondida.
                  </p>
                </div>
              </form>
            </div>
          </div>
      </div>
    </MainLayout>
  );
}
