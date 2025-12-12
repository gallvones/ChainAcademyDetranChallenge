"use client";

import { useState } from 'react';
import { cva } from 'class-variance-authority';
import Image from 'next/image';
import { FileText, DollarSign, Phone, Mail, Calendar, Car, AlertCircle, CheckCircle, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { ProposalCardProps } from './types';

const cardVariants = cva(
  'group relative overflow-hidden rounded-2xl transition-all duration-500 border backdrop-blur-sm',
  {
    variants: {
      variant: {
        pending: 'bg-gradient-to-br from-white to-amber-50/30 border-amber-300/40 hover:border-amber-400/60 shadow-[0_8px_32px_rgba(251,191,36,0.15)] hover:shadow-[0_16px_48px_rgba(251,191,36,0.3)]',
        approved: 'bg-gradient-to-br from-white to-green-50/30 border-green-300/40 hover:border-green-400/60 shadow-[0_8px_32px_rgba(34,197,94,0.15)] hover:shadow-[0_16px_48px_rgba(34,197,94,0.3)]',
        rejected: 'bg-gradient-to-br from-white to-red-50/30 border-red-300/40 hover:border-red-400/60 shadow-[0_8px_32px_rgba(239,68,68,0.15)] hover:shadow-[0_16px_48px_rgba(239,68,68,0.3)]',
        matched: 'bg-gradient-to-br from-white to-blue-50/30 border-blue-300/40 hover:border-blue-400/60 shadow-[0_8px_32px_rgba(59,130,246,0.15)] hover:shadow-[0_16px_48px_rgba(59,130,246,0.3)]',
      },
    },
    defaultVariants: {
      variant: 'pending',
    },
  }
);

const statusBadgeVariants = cva(
  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300',
  {
    variants: {
      status: {
        pending: 'bg-amber-100 text-amber-700 border border-amber-300',
        approved: 'bg-green-100 text-green-700 border border-green-300',
        rejected: 'bg-red-100 text-red-700 border border-red-300',
        matched: 'bg-blue-100 text-blue-700 border border-blue-300',
      },
    },
    defaultVariants: {
      status: 'pending',
    },
  }
);

const statusConfig = {
  pending: { icon: Clock, label: 'Pendente' },
  approved: { icon: CheckCircle, label: 'Aprovada' },
  rejected: { icon: AlertCircle, label: 'Rejeitada' },
  matched: { icon: CheckCircle, label: 'Aceita' },
};

export function ProposalCard({
  proposal,
  userRole,
  className = '',
}: ProposalCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(proposal.status);

  const status = currentStatus as 'pending' | 'approved' | 'rejected' | 'matched';
  const StatusIcon = statusConfig[status].icon;
  const statusLabel = statusConfig[status].label;

  // Lógica de exibição de botões baseada na role
  const canAcceptProposal = userRole === 'owner' && status === 'pending';
  const canApproveOrReject = userRole === 'manager' && status === 'matched';

  const handleAcceptProposal = async () => {
    // Alerta de confirmação
    const confirmed = window.confirm(
      'Tem certeza que deseja aceitar esta proposta? Esta ação irá alterar o status para "matched".'
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/proposals/updatestatus', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: proposal._id,
          status: 'matched',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao aceitar proposta');
      }

      // Atualizar o status local
      setCurrentStatus('matched');
      alert('Proposta aceita com sucesso!');

      // Recarregar a página para atualizar a lista
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao aceitar proposta:', error);
      alert(error.message || 'Erro ao aceitar proposta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveNegotiation = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja aprovar esta negociação?'
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/proposals/updatestatus', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: proposal._id,
          status: 'approved',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao aprovar negociação');
      }

      setCurrentStatus('approved');
      alert('Negociação aprovada com sucesso!');
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao aprovar negociação:', error);
      alert(error.message || 'Erro ao aprovar negociação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectNegotiation = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja recusar esta negociação?'
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/proposals/updatestatus', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: proposal._id,
          status: 'rejected',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao recusar negociação');
      }

      setCurrentStatus('rejected');
      alert('Negociação recusada.');
      window.location.reload();
    } catch (error: any) {
      console.error('Erro ao recusar negociação:', error);
      alert(error.message || 'Erro ao recusar negociação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cardVariants({ variant: status, className })}>
      {/* Car Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {proposal.carId?.img ? (
          <Image
            src={proposal.carId.img}
            alt={proposal.carId.name || 'Veículo'}
            fill
            className="object-contain transition-all duration-500 group-hover:scale-110 p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-20 h-20 text-gray-400" />
          </div>
        )}

        {/* Status Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <div className={statusBadgeVariants({ status })}>
            <StatusIcon className="w-4 h-4" />
            {statusLabel}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Car Info */}
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FFC107] transition-colors duration-300 flex items-center gap-2">
            <Car className="w-5 h-5" />
            {proposal.carId?.name || 'Veículo'}
          </h3>
          <p className="text-sm text-gray-500 font-mono">
            {proposal.carId?.model || 'Modelo não especificado'} - {proposal.carId?.year || 'N/A'}
          </p>
        </div>

        {/* Proposal Details */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          {/* Amount */}
          <div className="flex items-center gap-3 text-gray-700">
            <DollarSign className="w-5 h-5 text-[#FFC107]" />
            <div>
              <p className="text-xs text-gray-500">Valor da Proposta</p>
              <p className="text-lg font-bold text-green-600">
                R$ {proposal.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-[#FFC107]" />
              <span className="truncate">{proposal.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-[#FFC107]" />
              <span>{proposal.phone}</span>
            </div>
          </div>

          {/* Description */}
          {proposal.description && (
            <div className="pt-2">
              <div className="flex items-start gap-2 text-sm">
                <FileText className="w-4 h-4 text-[#FFC107] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700 mb-1">Descrição:</p>
                  <p className="text-gray-600 line-clamp-3">{proposal.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-[#FFC107]" />
            <span>
              Criada em: {new Date(proposal.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {canAcceptProposal && (
          <div className="px-6 pb-6">
            <button
              onClick={handleAcceptProposal}
              disabled={isLoading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <ThumbsUp className="w-5 h-5" />
                  Aceitar Proposta
                </>
              )}
            </button>
          </div>
        )}

        {canApproveOrReject && (
          <div className="px-6 pb-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleApproveNegotiation}
              disabled={isLoading}
              className="bg-[#22c55e] hover:bg-[#16a34a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Aprovar
                </>
              )}
            </button>
            <button
              onClick={handleRejectNegotiation}
              disabled={isLoading}
              className="bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Recusar
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] via-[#FFEB3B] to-[#FFC107]" />
      </div>
    </div>
  );
}
