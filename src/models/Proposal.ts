import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProposal extends Document {
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  manager: mongoose.Types.ObjectId;
  email: string;
  phone: number;
  amount: number;
  description: string;
  status: string;
}

const ProposalSchema = new Schema<IProposal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    carId: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    phone: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      minlength: 1,
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'approved', 'rejected', 'matched'],
    },
  },
  {
    timestamps: true,
    collection: 'proposals',
  }
);

const Proposal: Model<IProposal> = mongoose.models.Proposal || mongoose.model<IProposal>('Proposal', ProposalSchema);

export default Proposal;
