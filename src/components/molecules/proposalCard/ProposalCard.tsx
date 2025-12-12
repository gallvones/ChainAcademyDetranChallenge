"use client";

import { cva } from 'class-variance-authority';
import Image from 'next/image';
import { FileText, DollarSign, Phone, Mail, Calendar, Car, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import type { ProposalCardProps } from './types';

const cardVariants = cva(
  'group relative overflow-hidden rounded-2xl transition-all duration-500 border backdrop-blur-sm',
  {
    variants: {
      variant: {
        pending: 'bg-gradient-to-br from-white to-amber-50/30 border-amber-300/40 hover:border-amber-400/60 shadow-[0_8px_32px_rgba(251,191,36,0.15)] hover:shadow-[0_16px_48px_rgba(251,191,36,0.3)]',
        approved: 'bg-gradient-to-br from-white to-green-50/30 border-green-300/40 hover:border-green-400/60 shadow-[0_8px_32px_rgba(34,197,94,0.15)] hover:shadow-[0_16px_48px_rgba(34,197,94,0.3)]',
        rejected: 'bg-gradient-to-br from-white to-red-50/30 border-red-300/40 hover:border-red-400/60 shadow-[0_8px_32px_rgba(239,68,68,0.15)] hover:shadow-[0_16px_48px_rgba(239,68,68,0.3)]',
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
};

export function ProposalCard({
  proposal,
  className = '',
}: ProposalCardProps) {
  const status = proposal.status as 'pending' | 'approved' | 'rejected';
  const StatusIcon = statusConfig[status].icon;
  const statusLabel = statusConfig[status].label;

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
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD700] via-[#FFEB3B] to-[#FFC107]" />
      </div>
    </div>
  );
}
