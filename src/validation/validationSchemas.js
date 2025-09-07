import * as Yup from "yup";

export const userSchema = Yup.object().shape({
  nome: Yup.string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  email: Yup.string()
    .email("E-mail inválido")
    .required("E-mail é obrigatório"),

  telefone: Yup.string()
    .matches(/^\d{11}$/, "Telefone deve ter exatamente 11 dígitos numéricos")
    .required("Telefone é obrigatório"),

  cargo: Yup.string()
    .required("Cargo é obrigatório"),

  especialidade: Yup.string()
    .nullable()
    .when("cargo", {
      is: (cargo) => ["Médico", "Residente"].includes(cargo),
      then: (schema) => schema.required("Especialidade é obrigatória"),
    }),

  crm: Yup.string()
    .nullable() 
    .when("cargo", {
      is: (cargo) => ["Médico", "Residente"].includes(cargo),
      then: (schema) =>
        schema
          .required("CRM é obrigatório")
          .matches(
            /^CRM\/[A-Z]{2}\s\d{6}$/,
            "CRM deve estar no formato: CRM/PR 123456"
          ),
    }),
});

export const pacienteSchema = Yup.object().shape({
  nome: Yup.string()
    .required("Nome é obrigatório")
    .min(3, "Nome deve ter pelo menos 3 caracteres"),

  email: Yup.string()
    .email("E-mail inválido")
    .required("E-mail é obrigatório"),

  telefone: Yup.string()
    .matches(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos numéricos")
    .required("Telefone é obrigatório"),

  cpf: Yup.string()
    .matches(/^\d{11}$/, "CPF deve ter 11 dígitos numéricos")
    .required("CPF é obrigatório"),

  dataDeNascimento: Yup.date()
    .required("Data de nascimento é obrigatória")
    .max(new Date(), "Data de nascimento não pode ser no futuro"),

  sexo: Yup.string()
    .oneOf(["M", "F", "O"], "Sexo deve ser M, F ou O")
    .required("Sexo é obrigatório"),

  estadoCivil: Yup.string()
    .oneOf(
      ["SOLTEIRO", "SOLTEIRA", "CASADO", "CASADA", "DIVORCIADO", "DIVORCIADA", "VIÚVO", "VIÚVA"],
      "Estado civil inválido"
    )
    .required("Estado civil é obrigatório"),

  profissao: Yup.string()
    .nullable()
    .max(100, "Profissão deve ter no máximo 100 caracteres"),

  cidade: Yup.string()
    .required("Cidade é obrigatória"),

  uf: Yup.string()
    .length(2, "UF deve ter 2 caracteres")
    .required("UF é obrigatória"),

  ativo: Yup.boolean().nullable(),
});
