export interface ProposalCreateInput {
  car_name: string;
  car_chassi: string;
  purchase_offer: number;
}

export interface ProposalCreateResult {
  success: boolean;
  sys_id?: string;
  number?: string;
  error?: string;
}
