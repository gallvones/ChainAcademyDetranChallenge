"use client";

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/templates';
import { ProposalCard } from '@/components/molecules/proposalCard';
import { Loader2, FileX } from 'lucide-react';
import { useAuth } from '@/hooks';

interface Proposal {
  _id: string;
  userId: string;
  carId: {
    _id: string;
    name: string;
    model?: string;
    year?: number;
    img?: string;
  };
  email: string;
  phone: number;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomerProposalsPage() {
  const { userId, isAuthenticated, userRole } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProposals() {
      // Aguarda userId estar disponível antes de fazer a requisição
      if (!userId) {
        return;
      }

      try {
        const response = await fetch(`/api/proposals/getbyuserid?userId=${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao buscar propostas');
        }

        if (data.success) {
          setProposals(data.proposals);
        }
      } catch (err: any) {
        console.error('Erro ao buscar propostas:', err);
        setError(err.message || 'Erro ao carregar propostas');
      } finally {
        setLoading(false);
      }
    }

    fetchProposals();
  }, [userId]);

  // Verificação de autenticação separada
  useEffect(() => {
    if (!isAuthenticated && userId === null) {
      // Dá um pequeno delay para o hook carregar
      const timer = setTimeout(() => {
        if (!userId) {
          setError('Usuário não autenticado. Faça login para ver suas propostas.');
          setLoading(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, userId]);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4 animate-fade-in-down">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#FFEB3B] bg-clip-text text-transparent drop-shadow-lg">
            Minhas Propostas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Acompanhe o status de todas as suas propostas enviadas
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#FFC107] animate-spin" />
            <p className="mt-4 text-gray-600">Carregando propostas...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
              <FileX className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && proposals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 max-w-md text-center">
              <FileX className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                Nenhuma proposta encontrada
              </h3>
              <p className="text-amber-700">
                Você ainda não enviou nenhuma proposta. Explore nossos veículos e faça sua primeira oferta!
              </p>
            </div>
          </div>
        )}

        {/* Proposals Grid */}
        {!loading && !error && proposals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {proposals.map((proposal) => (
              <ProposalCard key={proposal._id} proposal={proposal} userRole={userRole || ''} />
            ))}
          </div>
        )}

        {/* Summary Statistics */}
        {!loading && !error && proposals.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-600 font-medium">Pendentes</p>
              <p className="text-3xl font-bold text-amber-700">
                {proposals.filter(p => p.status === 'pending').length}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-600 font-medium">Aprovadas</p>
              <p className="text-3xl font-bold text-green-700">
                {proposals.filter(p => p.status === 'approved').length}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-sm text-red-600 font-medium">Rejeitadas</p>
              <p className="text-3xl font-bold text-red-700">
                {proposals.filter(p => p.status === 'rejected').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
