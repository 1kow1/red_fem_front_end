// Arquivo central de schemas - facilita imports
export * from './userSchema';
export * from './pacienteSchema';
export * from './consultaSchema';

// Re-exports para compatibilidade com código existente
export { userSchema } from './userSchema';
export { pacienteSchema } from './pacienteSchema';
export { consultaSchema } from './consultaSchema';