import { useEffect, useRef, useState } from "react";

export default function PassometroScreen({ pacientes }) {
  const [dados, setDados] = useState(pacientes || []);
  const [editando, setEditando] = useState({});

  useEffect(() => {
    localStorage.setItem(
      "pacientes-passometro",
      JSON.stringify(dados)
    );
  }, [dados]);

  function iniciarEdicao(id, campo) {
    setEditando({ id, campo });
  }

  function finalizarEdicao() {
    setEditando({});
  }

  function atualizarCampo(id, campo, valor) {
    setDados((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, dados: { ...p.dados, [campo]: valor } }
          : p
      )
    );
  }

  if (!dados || dados.length === 0) {
    return (
      <>
        <h1>Passômetro UTI</h1>
        <div className="empty-state">Nenhum paciente encontrado.</div>
      </>
    );
  }

  return (
    <>
      <h1>Passômetro UTI</h1>

      {dados.map((paciente) => {
        const d = paciente.dados || {};
        const id = d.identificacao || {};

        return (
          <div className="card" key={paciente.id}>
            <div className="paciente-header">
              <strong>{id.nome || "PACIENTE NÃO IDENTIFICADO"}</strong>
              <span> | LEITO {id.leito || "--"}</span>
              <span> | {id.idade || "--"} ANOS</span>
              <span> | {id.sexo || "--"}</span>
            </div>

            <Campo titulo="Problemas" valor={d.problemas} className="campo-problemas" />
            <Campo titulo="HDA" valor={d.hda} className="campo-hda" />
            <Campo titulo="Evolução / Intercorrências" valor={d.evolucao} className="campo-evolucao" />

            <Lista titulo="Controles" itens={d.controles} className="campo-controles" />

            {/* 🔧 LABORATÓRIO EDITÁVEL — NOVO */}
            <ListaComEdicao
              titulo="Laboratório"
              itens={d.laboratorio}
              className="campo-laboratorio"
              emEdicao={
                editando.id === paciente.id &&
                editando.campo === "laboratorio"
              }
              onEditar={() =>
                iniciarEdicao(paciente.id, "laboratorio")
              }
              onSalvar={finalizarEdicao}
              onChange={(v) =>
                atualizarCampo(paciente.id, "laboratorio", v)
              }
            />

            <ListaComEdicao
              titulo="Gasometria"
              itens={d.gasometria}
              className="campo-gasometria"
              emEdicao={
                editando.id === paciente.id &&
                editando.campo === "gasometria"
              }
              onEditar={() =>
                iniciarEdicao(paciente.id, "gasometria")
              }
              onSalvar={finalizarEdicao}
              onChange={(v) =>
                atualizarCampo(paciente.id, "gasometria", v)
              }
            />

            <CampoComEdicao
              titulo="Medicações"
              valor={d.medicacoes}
              className="campo-medicacoes"
              emEdicao={
                editando.id === paciente.id &&
                editando.campo === "medicacoes"
              }
              onEditar={() =>
                iniciarEdicao(paciente.id, "medicacoes")
              }
              onSalvar={finalizarEdicao}
              onChange={(v) =>
                atualizarCampo(paciente.id, "medicacoes", v)
              }
              autosize
            />

            <CampoCondutas
              valor={d.condutas}
              className="campo-condutas"
              emEdicao={
                editando.id === paciente.id &&
                editando.campo === "condutas"
              }
              onEditar={() =>
                iniciarEdicao(paciente.id, "condutas")
              }
              onSalvar={finalizarEdicao}
              onChange={(v) =>
                atualizarCampo(paciente.id, "condutas", v)
              }
            />

            <Campo
              titulo="Intercorrências"
              valor={d.intercorrencias}
              className="campo-intercorrencias"
            />
          </div>
        );
      })}
    </>
  );
}

/* ================= COMPONENTES ================= */

function Campo({ titulo, valor, className }) {
  if (!valor) return null;
  return (
    <div className={`campo ${className || ""}`}>
      <strong>{titulo}:</strong>
      <div>{valor}</div>
    </div>
  );
}

function Lista({ titulo, itens, className }) {
  if (!Array.isArray(itens) || itens.length === 0) return null;

  return (
    <div className={`campo ${className || ""}`}>
      <strong>{titulo}:</strong>
      <ul>
        {itens.map((item, i) => {
          if (!item || typeof item !== "object") return null;

          const partes = item.texto.split("|").map(p => p.trim());

          return (
            <li key={i}>
              {partes.map((parte, idx) => {
                let prefixo = "";
                let conteudo = parte;
                let classe = null;

                if (parte.includes(":")) {
                  const split = parte.split(":");
                  prefixo = split[0] + ": ";
                  conteudo = split.slice(1).join(":").trim();
                }

                if (/Febre|Subfebril/i.test(conteudo)) {
                  classe = item.destaques?.TERMICO;
                } else {
                  const label = conteudo.split(" ")[0];
                  classe = item.destaques?.[label];
                }

                return (
                  <span key={idx}>
                    {prefixo}
                    <span className={classe || ""}>{conteudo}</span>
                    {idx < partes.length - 1 ? " | " : ""}
                  </span>
                );
              })}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ListaComEdicao({
  titulo,
  itens,
  className,
  emEdicao,
  onEditar,
  onSalvar,
  onChange,
}) {
  const ref = useRef(null);

  const textoEditavel = Array.isArray(itens)
    ? itens.map(i => i.texto).join("\n")
    : "";

  useEffect(() => {
    if (emEdicao && ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [textoEditavel, emEdicao]);

  return (
    <div className={`campo campo-editavel ${className || ""}`}>
      <strong>{titulo}:</strong>

      {!emEdicao && (
        <>
          <ul>
            {(itens || []).map((item, i) => {
              if (!item?.texto) return null;

              const partes = item.texto.split("|").map(p => p.trim());

              return (
                <li key={i}>
                  {partes.map((parte, idx) => {
                    let prefixo = "";
                    let conteudo = parte;
                    let classe = null;

                    if (parte.includes(":")) {
                      const split = parte.split(":");
                      prefixo = split[0] + ": ";
                      conteudo = split.slice(1).join(":").trim();
                    }

                    const label = conteudo.split(" ")[0];
                    classe = item.destaques?.[label];

                    return (
                      <span key={idx}>
                        {prefixo}
                        <span className={classe || ""}>{conteudo}</span>
                        {idx < partes.length - 1 ? " | " : ""}
                      </span>
                    );
                  })}
                </li>
              );
            })}
          </ul>
          <button onClick={onEditar}>Editar</button>
        </>
      )}

      {emEdicao && (
        <>
          <textarea
            ref={ref}
            value={textoEditavel}
            onChange={(e) =>
              onChange(
                e.target.value
                  .split("\n")
                  .map(l => ({ texto: l, destaques: {} }))
              )
            }
          />
          <button onClick={onSalvar}>OK</button>
        </>
      )}
    </div>
  );
}

function CampoComEdicao({
  titulo,
  valor,
  className,
  emEdicao,
  onEditar,
  onSalvar,
  onChange,
  autosize,
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (autosize && ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [valor, autosize, emEdicao]);

  return (
    <div className={`campo campo-editavel ${className || ""}`}>
      <strong>{titulo}:</strong>

      {!emEdicao && (
        <>
          <div>
            {(valor || "").split("\n").map((linha, i) => (
              <div key={i} className="linha-marcada">
                {linha}
              </div>
            ))}
          </div>
          <button onClick={onEditar}>Editar</button>
        </>
      )}

      {emEdicao && (
        <>
          <textarea
            ref={ref}
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <button onClick={onSalvar}>OK</button>
        </>
      )}
    </div>
  );
}

function CampoCondutas({
  valor,
  className,
  emEdicao,
  onEditar,
  onSalvar,
  onChange,
}) {
  const linhas = (valor || "")
    .split(/\n|\|/)
    .map(l => l.trim())
    .filter(Boolean);

  const colunas = [[], [], []];
  linhas.forEach((linha, i) => {
    const idx = Math.floor(i / 4);
    if (idx < 3) colunas[idx].push(linha);
  });

  return (
    <div className={`campo campo-editavel ${className || ""}`}>
      <strong>Condutas / Pendências:</strong>

      {!emEdicao && (
        <>
          <div style={{ display: "flex", gap: "16px" }}>
            {colunas.map(
              (coluna, idx) =>
                coluna.length > 0 && (
                  <div key={idx} style={{ flex: 1 }}>
                    {coluna.map((linha, i) => (
                      <div key={i} className="linha-marcada">
                        {linha}
                      </div>
                    ))}
                  </div>
                )
            )}
          </div>
          <button onClick={onEditar}>Editar</button>
        </>
      )}

      {emEdicao && (
        <>
          <textarea
            value={valor || ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <button onClick={onSalvar}>OK</button>
        </>
      )}
    </div>
  );
}