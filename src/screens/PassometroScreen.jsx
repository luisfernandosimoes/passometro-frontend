import { useEffect, useRef, useState } from "react";

const BACKEND_URL = "https://passometro-backend-1.onrender.com";

export default function PassometroScreen({ pacientes }) {
  const [dados, setDados] = useState(pacientes || []);
  const [editando, setEditando] = useState({});

// ===============================
// CARREGAR PASSÔMETRO DO BACKEND
// ===============================
useEffect(() => {
  fetch(`${BACKEND_URL}/api/passometro`)
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setDados(data);
      }
    })
    .catch(() => {
      console.warn("Backend indisponível, usando estado local");
    });
}, []);

// ===============================
// SALVAR PASSÔMETRO NO BACKEND
// ===============================
useEffect(() => {
  fetch(`${BACKEND_URL}/api/passometro`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pacientes: dados }),
  }).catch(() => {
    console.warn("Erro ao salvar passômetro no backend");
  });
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

        return (
          <div className="card" key={paciente.id}>
<div className="paciente-header">
  {(() => {
    const emEdicao =
      editando.id === paciente.id &&
      editando.campo === "identificacao";

    const ident = d.identificacao || {};

    if (emEdicao) {
      return (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="Leito"
            value={ident.leito || ""}
            onChange={(e) =>
              atualizarCampo(paciente.id, "identificacao", {
                ...ident,
                leito: e.target.value,
              })
            }
            style={{ width: "4ch" }}
          />

          <input
            placeholder="Nome"
            value={ident.nome || ""}
            onChange={(e) =>
              atualizarCampo(paciente.id, "identificacao", {
                ...ident,
                nome: e.target.value,
              })
            }
            style={{ minWidth: 200 }}
          />

          <input
            placeholder="Idade"
            type="number"
            value={ident.idade || ""}
            onChange={(e) =>
              atualizarCampo(paciente.id, "identificacao", {
                ...ident,
                idade: e.target.value,
              })
            }
            style={{ width: "6ch" }}
          />

          <select
            value={ident.sexo || ""}
            onChange={(e) =>
              atualizarCampo(paciente.id, "identificacao", {
                ...ident,
                sexo: e.target.value,
              })
            }
          >
            <option value="">Sexo</option>
            <option value="MASCULINO">MASCULINO</option>
            <option value="FEMININO">FEMININO</option>
          </select>

          <button
            onClick={() => {
              atualizarCampo(paciente.id, "identificacao", {
                leito: (ident.leito || "").trim().toUpperCase(),
                nome: (ident.nome || "").trim().toUpperCase(),
                idade: (ident.idade || "").toString().trim(),
                sexo: (ident.sexo || "").trim().toUpperCase(),
              });
              finalizarEdicao();
            }}
          >
            OK
          </button>
        </div>
      );
    }

    // 🔹 MODO NORMAL (NÃO EDITANDO)
    const leito =
      ident.leito || paciente.leito || "";

    const nome =
      ident.nome || "PACIENTE NÃO IDENTIFICADO";

    const idade = ident.idade
      ? `${ident.idade} ANOS`
      : null;

    const sexo = ident.sexo || null;

    return (
      <span>
        <strong>
          {leito
            ? `LEITO ${leito}: ${nome}`
            : nome}
        </strong>
    
        {(idade || sexo) && (
          <span>
            {" | "}
            {[idade, sexo].filter(Boolean).join(" | ")}
          </span>
        )}
    
        <button
          style={{
            marginLeft: 8,
            verticalAlign: "baseline",
          }}
          onClick={() =>
            iniciarEdicao(paciente.id, "identificacao")
          }
        >
          Editar
        </button>
      </span>
    );
  })()}
</div>

<Campo
  titulo="Problemas"
  valor={d.problemas}
  className="campo-problemas"
  emEdicao={
    editando.id === paciente.id &&
    editando.campo === "problemas"
  }
  onEditar={() =>
    iniciarEdicao(paciente.id, "problemas")
  }
  onSalvar={finalizarEdicao}
  onChange={(v) =>
    atualizarCampo(paciente.id, "problemas", v)
  }
/>  
<Campo
  titulo="HDA"
  valor={d.hda}
  className="campo-hda"
  emEdicao={
    editando.id === paciente.id &&
    editando.campo === "hda"
  }
  onEditar={() =>
    iniciarEdicao(paciente.id, "hda")
  }
  onSalvar={finalizarEdicao}
  onChange={(v) =>
    atualizarCampo(paciente.id, "hda", v)
  }
/>
<Campo
  titulo="Evolução / Intercorrências"
  valor={d.evolucao}
  className="campo-evolucao"
  emEdicao={
    editando.id === paciente.id &&
    editando.campo === "evolucao"
  }
  onEditar={() =>
    iniciarEdicao(paciente.id, "evolucao")
  }
  onSalvar={finalizarEdicao}
  onChange={(v) =>
    atualizarCampo(paciente.id, "evolucao", v)
  }
/>

            <Lista titulo="Controles" itens={d.controles} className="campo-controles" />

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

function Campo({  titulo,  valor,  className,  onEditar,  emEdicao,  onSalvar,  onChange,}) {
  const textareaRef = useRef(null);
      if (!valor) return null;


  // 🔹 Regra especial apenas para PROBLEMAS
  if (titulo === "Problemas" && typeof valor === "string") {

    if (emEdicao) {
      return (
        <div className={`campo ${className || ""}`}>
          <strong>{titulo}:</strong>
  
          <textarea
  ref={textareaRef}
  autoFocus
  value={
    valor
      .split(" | ")
      .map(bloco => {
        const partes = bloco.split("~").map(p => p.trim());
        return partes
          .map((p, i) => (i === 0 ? p : `> ${p}`))
          .join("\n");
      })
      .join("\n")
  }
  onChange={(e) => onChange(e.target.value)}
  onFocus={(e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }}
  onInput={(e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }}
  style={{
    fontFamily: "inherit",
    lineHeight: "1.4",
  }}
/>
  
<button
  onClick={() => {
    const linhas = valor
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    const blocos = [];
    let atual = null;

    linhas.forEach(l => {
      if (l.startsWith(">")) {
        if (atual) {
          atual.push(l.replace(/^>\s*/, ""));
        }
      } else {
        if (atual) blocos.push(atual.join(" ~ "));
        atual = [l];
      }
    });

    if (atual) blocos.push(atual.join(" ~ "));

    onChange(blocos.join(" | "));
    onSalvar();
  }}
>
  OK
</button>
        </div>
      );
    }
  
    const blocos = valor.split(" | ").map(b => b.trim()).filter(Boolean);

  return (
    <div className={`campo ${className || ""}`}>
      <strong>{titulo}:</strong>
      <div>
        {blocos.map((bloco, i) => {
          const partes = bloco.split("~").map(p => p.trim()).filter(Boolean);
          const principal = partes[0];
          const subitens = partes.slice(1);

          return (
            <span key={i}>
              <strong>{principal}</strong>
              {subitens.map((sub, j) => (
                <span
                  key={j}
                  style={{
                    marginLeft: 6,
                    color: "#6b7280",
                    fontSize: "0.95em",
                  }}
                >
                  {" "}
                  ▸ {sub}
                </span>
              ))}
              {i < blocos.length - 1 && " | "}
            </span>
          );
        })}
      </div>

      {onEditar && (
        <button onClick={onEditar}>Editar</button>
      )}
    </div>
  );
}

// 🔹 Regra especial para HDA (texto corrido)
if (titulo === "HDA" && typeof valor === "string") {
  // MODO EDIÇÃO
  if (emEdicao) {
    return (
      <div className={`campo ${className || ""}`}>
        <strong>{titulo}:</strong>

        <textarea
  autoFocus
  value={valor}
  onChange={(e) => onChange(e.target.value)}
  onFocus={(e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }}
  onInput={(e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }}
  style={{
    fontFamily: "inherit",
    textAlign: "justify",
    lineHeight: "1.5",
  }}
/>

        <button onClick={onSalvar}>OK</button>
      </div>
    );
  }

  // MODO NORMAL
  return (
    <div className={`campo ${className || ""}`}>
      <strong>{titulo}:</strong>

      <div
  style={{
    textAlign: "justify",
    whiteSpace: "pre-line",
  }}
>
  {valor}
</div>

      {onEditar && (
        <button onClick={onEditar}>Editar</button>
      )}
    </div>
  );
}

// 🔹 Regra especial para Evolução / Intercorrências (texto corrido)
if (
  titulo === "Evolução / Intercorrências" &&
  typeof valor === "string"
) {
  // MODO EDIÇÃO
  if (emEdicao) {
    return (
      <div className={`campo ${className || ""}`}>
        <strong>{titulo}:</strong>

        <textarea
          autoFocus
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => {
            e.target.style.height = "auto";
            e.target.style.height =
              e.target.scrollHeight + "px";
          }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height =
              e.target.scrollHeight + "px";
          }}
          style={{
            fontFamily: "inherit",
            textAlign: "justify",
            lineHeight: "1.5",
          }}
        />

        <button onClick={onSalvar}>OK</button>
      </div>
    );
  }

  // MODO NORMAL
  return (
    <div className={`campo ${className || ""}`}>
      <strong>{titulo}:</strong>

      <div style={{ textAlign: "justify" }}>
        {valor}
      </div>

      {onEditar && (
        <button onClick={onEditar}>Editar</button>
      )}
    </div>
  );
}

  // 🔹 Comportamento padrão (inalterado)
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