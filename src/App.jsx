import { useEffect, useState } from "react";
import PassometroScreen from "./screens/PassometroScreen";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const isPassometro = params.get("passometro") === "1";

  /* =====================================================
     TELA DO PASSÔMETRO (INALTERADA)
  ===================================================== */

  if (isPassometro) {
    const pacientes = JSON.parse(
      localStorage.getItem("pacientes-passometro") || "[]"
    );

    return (
      <div className="container">
        <PassometroScreen pacientes={pacientes} />
      </div>
    );
  }

  /* =====================================================
     TELA DE INSERÇÃO — ESTADO PERSISTENTE
  ===================================================== */

  const [pacientes, setPacientes] = useState(() => {
    const salvo = localStorage.getItem("pacientes-insercao");
    return salvo ? JSON.parse(salvo) : [];
  });

  /* 🔒 SALVAMENTO AUTOMÁTICO */
  useEffect(() => {
    localStorage.setItem(
      "pacientes-insercao",
      JSON.stringify(pacientes)
    );
  }, [pacientes]);

  /* =====================================================
     FUNÇÕES
  ===================================================== */

  function adicionarPaciente() {
    setPacientes((prev) => [
      ...prev,
      {
        id: Date.now(),
        evolucaoAnterior: "",
        controles: "",
        laboratorio: "",
        gasometria: "",
        status: "idle",
        dados: null,
      },
    ]);
  }

  function atualizarCampo(id, campo, valor) {
    setPacientes((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [campo]: valor } : p
      )
    );
  }

  function limparTextoPaciente(id) {
    setPacientes((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              evolucaoAnterior: "",
              controles: "",
              laboratorio: "",
              gasometria: "",
              status: "idle",
              dados: null,
            }
          : p
      )
    );
  }

  function excluirPaciente(id) {
    setPacientes((prev) =>
      prev.filter((p) => p.id !== id)
    );
  }

  async function processarPaciente(paciente) {
    try {
      setPacientes((prev) =>
        prev.map((p) =>
          p.id === paciente.id
            ? { ...p, status: "processing" }
            : p
        )
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/gerar-passometro`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            evolucaoAnterior: paciente.evolucaoAnterior,
            controles: paciente.controles,
            laboratorio: paciente.laboratorio,
            gasometria: paciente.gasometria,
          }),
        }
      );

      const data = await response.json();

      setPacientes((prev) =>
        prev.map((p) =>
          p.id === paciente.id
            ? { ...p, status: "done", dados: data }
            : p
        )
      );
    } catch (e) {
      setPacientes((prev) =>
        prev.map((p) =>
          p.id === paciente.id
            ? { ...p, status: "error" }
            : p
        )
      );
    }
  }

  function gerarPassometro() {
    const prontos = pacientes.filter((p) => p.status === "done");
    localStorage.setItem(
      "pacientes-passometro",
      JSON.stringify(prontos)
    );
    window.open("?passometro=1", "_blank");
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="container">
      <h1>Passômetro UTI</h1>

      <button onClick={adicionarPaciente}>
        ➕ Adicionar paciente
      </button>

      {pacientes.map((p, i) => (
        <div className="card" key={p.id}>
          <h3>Paciente {i + 1}</h3>

          <textarea
            placeholder="Evolução anterior"
            value={p.evolucaoAnterior}
            onChange={(e) =>
              atualizarCampo(
                p.id,
                "evolucaoAnterior",
                e.target.value
              )
            }
          />

          <textarea
            placeholder="Últimos controles"
            value={p.controles}
            onChange={(e) =>
              atualizarCampo(
                p.id,
                "controles",
                e.target.value
              )
            }
          />

          <textarea
            placeholder="Último laboratório"
            value={p.laboratorio}
            onChange={(e) =>
              atualizarCampo(
                p.id,
                "laboratorio",
                e.target.value
              )
            }
          />

          <textarea
            placeholder="Última gasometria"
            value={p.gasometria}
            onChange={(e) =>
              atualizarCampo(
                p.id,
                "gasometria",
                e.target.value
              )
            }
          />

          <div style={{ display: "flex", gap: "8px", marginTop: 8 }}>
            <button onClick={() => processarPaciente(p)}>
              Inserir dados
            </button>

            <button onClick={() => limparTextoPaciente(p.id)}>
              🧹 Limpar texto
            </button>

            <button onClick={() => excluirPaciente(p.id)}>
              ❌ Excluir
            </button>
          </div>

          <span className="status">
            {p.status === "processing" && " ⏳ Processando"}
            {p.status === "done" && " ✅ Concluído"}
            {p.status === "error" && " ❌ Erro"}
          </span>
        </div>
      ))}

      {pacientes.some((p) => p.status === "done") && (
        <button
          style={{ marginTop: 24 }}
          onClick={gerarPassometro}
        >
          Gerar passômetro
        </button>
      )}
    </div>
  );
}