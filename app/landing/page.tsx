import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VitalTrack — Saúde & Finanças em um só lugar",
  description: "Controle sua saúde e finanças no celular. Gratuito, privado e sem cadastro.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0D0F14] text-[#F0F2F7] font-sans">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 bg-[#00E5A0]/10 border border-[#00E5A0]/30 rounded-full px-4 py-1.5 text-xs text-[#00E5A0] font-medium mb-6">
          ✨ Grátis · Sem cadastro · 100% privado
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
          Sua saúde e finanças<br />
          <span className="text-[#00E5A0]">em um só lugar</span>
        </h1>
        <p className="text-[#6B7280] text-base max-w-xs leading-relaxed mb-8">
          Chega de 4 apps diferentes. O VitalTrack reúne tudo que importa no seu dia a dia.
        </p>
        <a
          href="/"
          className="inline-block bg-[#00E5A0] text-[#0D0F14] font-bold text-base px-8 py-4 rounded-2xl hover:bg-[#00CCB1] transition-all active:scale-95 shadow-lg shadow-[#00E5A0]/20"
        >
          Abrir o app agora →
        </a>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 px-6 mb-12 max-w-md mx-auto">
        {[
          { value: "30s", label: "para registrar o dia" },
          { value: "4 em 1", label: "módulos integrados" },
          { value: "0", label: "dados no servidor" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-[#161A23] border border-[#252A36] p-4 text-center">
            <p className="text-2xl font-bold text-[#00E5A0]">{s.value}</p>
            <p className="text-[10px] text-[#6B7280] mt-1 leading-tight">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="px-6 max-w-md mx-auto mb-12">
        <h2 className="text-xl font-bold text-center mb-6">
          Tudo que você precisa
        </h2>
        <div className="space-y-3">
          {[
            { icon: "💰", title: "Controle Financeiro", desc: "Registre gastos, defina orçamentos e veja a previsão do mês antes de estourar.", color: "#7C6AF7" },
            { icon: "💪", title: "Saúde Completa", desc: "Peso, IMC, passos, água, sono e humor — tudo em um painel visual.", color: "#00E5A0" },
            { icon: "🎯", title: "Metas com Progresso", desc: "Crie metas de saúde e financeiras com sub-tarefas e acompanhe a evolução.", color: "#FFB347" },
            { icon: "🔥", title: "Streaks de Hábitos", desc: "Sequências diárias que te motivam a não quebrar a corrente — igual ao Duolingo.", color: "#FF6B6B" },
          ].map((f) => (
            <div key={f.title} className="flex gap-4 rounded-2xl bg-[#161A23] border border-[#252A36] p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${f.color}15` }}>
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F0F2F7] mb-0.5">{f.title}</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy highlight */}
      <section className="px-6 max-w-md mx-auto mb-12">
        <div className="rounded-2xl bg-gradient-to-br from-[#7C6AF7]/15 to-[#00E5A0]/10 border border-[#7C6AF7]/30 p-5 text-center">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="font-bold text-[#F0F2F7] mb-2">Seus dados são seus</h3>
          <p className="text-xs text-[#6B7280] leading-relaxed">
            Nenhum dado vai para servidores. Tudo fica no seu celular. Exporte um backup quando quiser e leve para qualquer dispositivo.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 max-w-md mx-auto pb-16 text-center">
        <h2 className="text-2xl font-bold mb-3">Pronto para começar?</h2>
        <p className="text-[#6B7280] text-sm mb-6">Sem cadastro. Sem senha. Abre e usa.</p>
        <a
          href="/"
          className="inline-block w-full bg-[#00E5A0] text-[#0D0F14] font-bold text-base px-8 py-4 rounded-2xl hover:bg-[#00CCB1] transition-all active:scale-95 shadow-lg shadow-[#00E5A0]/20"
        >
          Abrir o VitalTrack →
        </a>
        <p className="text-[10px] text-[#4B5563] mt-4">Gratuito · Funciona no celular · Sem instalação</p>
      </section>

    </main>
  );
}
