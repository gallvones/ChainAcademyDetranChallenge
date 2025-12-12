export interface ProposalCardProps {
  proposal: {
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
  };
  userRole: string;
  className?: string;
}
