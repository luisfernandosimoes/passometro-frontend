import { useEffect, useState } from "react";
import PassometroScreen from "./screens/PassometroScreen";

/* 🔧 BACKEND LOCAL */
const BACKEND_URL = "https://passometro-backend-1.onrender.com";

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const isPassometro = params.get("passometro") === "1";

  /* =====================================================
     TELA DO PASSÔMETRO — USO LOCAL
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
     TELA DE INSERÇÃO — ESTADO LOCAL
  ===================================================== */

  const [pacientes, setPacientes] = useState(() => {
    const salvo = localStorage.getItem("pacientes-insercao");
    return salvo ? JSON.parse(salvo) : [];
  });

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
        leito: "",
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

  function limparPaciente(id) {
    if (!window.confirm("Limpar todos os textos deste paciente?")) return;

    setPacientes((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              leito: "",
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
    if (!window.confirm("Excluir este paciente?")) return;
    setPacientes((prev) => prev.filter((p) => p.id !== id));
  }

  async function processarPaciente(paciente) {
    setPacientes((prev) =>
      prev.map((p) =>
        p.id === paciente.id
          ? { ...p, status: "processing" }
          : p
      )
    );

    const r = await fetch(`${BACKEND_URL}/api/gerar-passometro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leitoInsercao: paciente.leito,
        evolucaoAnterior: paciente.evolucaoAnterior,
        controles: paciente.controles,
        laboratorio: paciente.laboratorio,
        gasometria: paciente.gasometria,
      }),
    });

    const data = await r.json();

    // 🔹 AQUI NÃO MEXEMOS: backend continua soberano
    setPacientes((prev) =>
      prev.map((p) =>
        p.id === paciente.id
          ? { ...p, status: "done", dados: data }
          : p
      )
    );
  }

  function gerarPassometro() {
    const prontos = pacientes
      .filter((p) => p.status === "done")
      .map((p) => {
        // 🔴 CORREÇÃO CRÍTICA: persistir leito junto aos dados
        const dados = p.dados || {};
        const identificacao = dados.identificacao || {};

        return {
          id: p.id,
          leito: p.leito,
          dados: {
            ...dados,
            identificacao: {
              ...identificacao,
              leito: p.leito,
            },
          },
        };
      });

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
      <h1>Passômetro UTI — LOCAL</h1>

      <button onClick={adicionarPaciente}>
        ➕ Adicionar paciente
      </button>

      {pacientes.map((p) => (
        <div className="card" key={p.id}>
          {/* 🔹 LEITO — TAMANHO IGUAL AO ANTIGO “PACIENTE 1” */}
          <div
            style={{
              marginBottom: 12,
              fontSize: "1.25rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>Leito</span>
            <input
              value={p.leito}
              onChange={(e) =>
                atualizarCampo(p.id, "leito", e.target.value)
              }
              style={{
                width: "4ch",
                fontSize: "inherit",
                fontWeight: "inherit",
                lineHeight: "1.2",
                padding: "2px 4px",
              }}
            />
          </div>

          <textarea
            placeholder="Evolução anterior"
            value={p.evolucaoAnterior}
            onChange={(e) =>
              atualizarCampo(p.id, "evolucaoAnterior", e.target.value)
            }
          />

          <textarea
            placeholder="Últimos controles"
            value={p.controles}
            onChange={(e) =>
              atualizarCampo(p.id, "controles", e.target.value)
            }
          />

          <textarea
            placeholder="Último laboratório"
            value={p.laboratorio}
            onChange={(e) =>
              atualizarCampo(p.id, "laboratorio", e.target.value)
            }
          />

          <textarea
            placeholder="Última gasometria"
            value={p.gasometria}
            onChange={(e) =>
              atualizarCampo(p.id, "gasometria", e.target.value)
            }
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => processarPaciente(p)}>
              Inserir dados
            </button>

            <button onClick={() => limparPaciente(p.id)}>
              🧹 Limpar textos
            </button>

            <button onClick={() => excluirPaciente(p.id)}>
              🗑 Excluir paciente
            </button>
          </div>

          <span className="status">
            {p.status === "processing" && " ⏳ Processando"}
            {p.status === "done" && " ✅ Concluído"}
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