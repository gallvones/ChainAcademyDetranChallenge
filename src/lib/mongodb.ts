import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Por favor defina MONGO_URI no arquivo .env');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declaração global para TypeScript
declare global {
  var mongoose: MongooseCache | undefined;
}

// Cache de conexão para evitar múltiplas conexões no Next.js
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectToDatabase(): Promise<typeof mongoose> {
  // Se já existe uma conexão ativa, retorna ela
  if (cached.conn) {
    console.log('Usando conexão existente com o banco de dados');
    return cached.conn;
  }

  // Se não existe uma promise de conexão, cria uma nova
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Criando nova conexão com o banco de dados...');
    cached.promise = mongoose.connect(MONGO_URI!, opts).then((mongoose) => {
      console.log('Conexão com o banco bem sucedida!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('Erro ao conectar com o banco de dados:', error);
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
