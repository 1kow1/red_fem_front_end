import React, { useState } from "react";
import TableSmart from "../components/table";
import Searchbar from "../components/Searchbar";
import { ButtonPrimary } from "../components/Button";
import { AddIcon } from "../components/Icons";
import FormPopUp from "../components/FormPopUp";

const camposFormularioUsuario = [
  {
    name: "nome",
    label: "Nome",
    type: "text",
    placeholder: "Insira o Nome",
  },
  {
    name: "email",
    label: "E-mail",
    type: "email",
    placeholder: "email@email.com",
  },
  {
    name: "telefone",
    label: "Telefone",
    type: "tel",
    placeholder: "(42) 9 9999-9999",
  },
  {
    name: "cargo",
    label: "Cargo",
    type: "select",
    placeholder: "Insira o cargo",
    options: [
      { value: "admin", label: "Administrador" },
      { value: "medico", label: "Médico" },
      { value: "secretaria", label: "Secretaria" },
    ],
  },
  {
    name: "senha",
    label: "Senha",
    type: "password",
    placeholder: "************",
  },
  {
    name: "confirmarSenha",
    label: "Confirmar Senha",
    type: "password",
    placeholder: "************",
  },
];

export default function Usuarios() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateUser = (data) => {
    console.log("Novo usuário a ser criado:", data);
  };

  return (
    <>
      <div>
        <h1 className="text-lg mb-4">Usuarios</h1>
        <div>
          <div className="flex flex-row gap-2">
            <Searchbar />
            <ButtonPrimary
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              <AddIcon />
              Novo Usuario
            </ButtonPrimary>
          </div>
          <TableSmart />
        </div>
      </div>

      <FormPopUp
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Formulário Usuário"
        fields={camposFormularioUsuario}
        onSubmit={handleCreateUser}
      />
    </>
  );
}
