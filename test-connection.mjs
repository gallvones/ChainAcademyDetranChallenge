import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

console.log('🔍 Testando conexão com MongoDB...\n');

if (!MONGO_URI) {
  console.error('❌ ERRO: MONGO_URI não encontrada no .env');
  process.exit(1);
}

try {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conexão com o banco de dados bem sucedida!');
  console.log('📊 Database:', mongoose.connection.db.databaseName);
  console.log('🔗 Host:', mongoose.connection.host);

  await mongoose.connection.close();
  console.log('\n👋 Conexão fechada com sucesso!');
  process.exit(0);
} catch (error) {
  console.error('❌ Erro ao conectar:', error.message);
  process.exit(1);
}
