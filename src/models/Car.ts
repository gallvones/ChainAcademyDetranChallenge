import mongoose, { Schema, Document, Model } from 'mongoose';
import './User'; // Garantir que User está registrado

export interface ICar extends Document {
  name: string;
  chassi: string;
  info: {
    year?: number;
    color?: string;
    model?: string;
    plates?: string;
  };
  owner: mongoose.Types.ObjectId;
  manager: mongoose.Types.ObjectId;
  img: string;
  uf: string;
}

const CarSchema = new Schema<ICar>(
  {
    name: {
      type: String,
      required: true,
    },
    chassi: {
      type: String,
      required: true,
    },
    info: {
      type: Object,
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
    img: {
      type: String,
      required: true,
    },
    uf: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'cars',
  }
);

const Car: Model<ICar> = mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema);

export default Car;
