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

  senha: Yup.string()
    .required("Senha é obrigatória")
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .matches(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "A senha deve conter pelo menos um caractere especial"),

  confirmarSenha: Yup.string()
    .required("Confirmação de senha é obrigatória")
    .oneOf([Yup.ref("senha"), null], "As senhas devem coincidir"),
});
