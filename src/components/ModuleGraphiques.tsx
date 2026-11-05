import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ModuleGraphiques({ ventes, depenses }: any) {
  // 1. Préparer les données pour le graphique des ventes (par jour)
  const ventesParJour = ventes.reduce((acc: any, v: any) => {
    const date = v.date; // ex: "05/11/2026"
    if (!acc[date]) acc[date] = { date, total: 0 };
    acc[date].total += Number(v.total);
    return acc;
  }, {});

  const dataVentes = Object.values(ventesParJour).slice(-7); // On garde les 7 derniers jours

  // 2. Préparer les données pour le graphique des dépenses (par catégorie)
  const depensesParCategorie = depenses.reduce((acc: any, d: any) => {
    const cat = d.categorie;
    if (!acc[cat]) acc[cat] = { categorie: cat, total: 0 };
    acc[cat].total += Number(d.montant);
    return acc;
  }, {});

  const dataDepenses = Object.values(depensesParCategorie);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
      <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
        📊 Tableau de bord visuel (Patron)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Graphique des Ventes */}
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <h3 className="text-cyan-400 mb-4 font-bold">Chiffre d'Affaires (7 derniers jours)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataVentes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                <Bar dataKey="total" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Ventes (FCFA)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique des Dépenses */}
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <h3 className="text-orange-400 mb-4 font-bold">Répartition des Dépenses</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataDepenses} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="categorie" type="category" stroke="#94a3b8" fontSize={12} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                <Bar dataKey="total" fill="#f97316" radius={[0, 4, 4, 0]} name="Dépenses (FCFA)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}