import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, TrendingUp, Zap, Plus, X, Trash2, User, LogIn, LogOut } from 'lucide-react';

const EMPLOYES_INITIAUX = [
  { id: 1, nom: 'Marie K.', poste: 'Vendeuse', presence: 95, ponctualite: 90, productivite: 85 },
  { id: 2, nom: 'Jean P.', poste: 'Caissier', presence: 78, ponctualite: 70, productivite: 65 },
  { id: 3, nom: 'Sophie M.', poste: 'Gérante', presence: 100, ponctualite: 98, productivite: 95 },
  { id: 4, nom: 'Paul T.', poste: 'Magasinier', presence: 55, ponctualite: 45, productivite: 50 },
  { id: 5, nom: 'Aïcha B.', poste: 'Vendeuse', presence: 88, ponctualite: 82, productivite: 79 },
];

const useLocalStorage = (key: string, initialValue: any): [any, (value: any) => void] => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Erreur sauvegarde', e);
    }
  }, [key, value]);

  return [value, setValue];
};

const calculerMotivation = (e: any) => Math.round(e.presence * 0.30 + e.ponctualite * 0.25 + e.productivite * 0.45);

const getColor = (score: number) => {
  if (score >= 80) return { text: 'text-green-400', bg: 'bg-green-500', label: 'Motivé' };
  if (score >= 60) return { text: 'text-orange-400', bg: 'bg-orange-500', label: 'À surveiller' };
  return { text: 'text-red-400', bg: 'bg-red-500', label: 'Urgent' };
};

const KpiCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}><Icon size={24} /></div>
    <div>
      <p className="text-slate-400 text-xs uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-500 text-xs">{subtitle}</p>
    </div>
  </div>
);

const MotivationGauge = ({ score, size = 160 }: { score: number; size?: number }) => {
  const radius = size === 160 ? 60 : 40;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#00FF88' : score >= 60 ? '#FF6B00' : '#FF2D55';
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} stroke="#1E293B" strokeWidth="12" fill="none" />
        <circle cx={center} cy={center} r={radius} stroke={color} strokeWidth="12" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className={`font-bold ${size === 160 ? 'text-3xl' : 'text-xl'}`} style={{ color }}>{score}%</div>
        <div className="text-slate-400 text-xs">Motivation</div>
      </div>
    </div>
  );
};

const FormulaireEmploye = ({ onAjouter, onFermer }: any) => {
  const [nom, setNom] = useState('');
  const [poste, setPoste] = useState('Vendeur');
  const [presence, setPresence] = useState(80);
  const [ponctualite, setPonctualite] = useState(80);
  const [productivite, setProductivite] = useState(80);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    onAjouter({ nom, poste, presence, ponctualite, productivite });
    onFermer();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Nouvel employé</h2>
          <button onClick={onFermer} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 uppercase">Nom complet</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Jean Dupont" autoFocus
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase">Poste</label>
            <select value={poste} onChange={(e) => setPoste(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white">
              <option>Vendeur</option>
              <option>Caissier</option>
              <option>Gérant</option>
              <option>Magasinier</option>
              <option>Superviseur</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase">Prés. %</label>
              <input type="number" min="0" max="100" value={presence}
                onChange={(e) => setPresence(Number(e.target.value))}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase">Pont. %</label>
              <input type="number" min="0" max="100" value={ponctualite}
                onChange={(e) => setPonctualite(Number(e.target.value))}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase">Prod. %</label>
              <input type="number" min="0" max="100" value={productivite}
                onChange={(e) => setProductivite(Number(e.target.value))}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onFermer}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded">Annuler</button>
            <button type="submit"
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 rounded">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FicheEmploye = ({ employe, onFermer, onSupprimer }: any) => {
  const score = calculerMotivation(employe);
  const c = getColor(score);
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 text-cyan-400 p-3 rounded-lg"><User size={24} /></div>
            <div>
              <h2 className="text-xl font-bold text-white">{employe.nom}</h2>
              <p className="text-sm text-slate-400">{employe.poste}</p>
            </div>
          </div>
          <button onClick={onFermer} className="text-slate-400 hover:text-white"><X size={24} /></button>
        </div>
        <div className="flex flex-col items-center mb-6 py-4 border-y border-slate-800">
          <MotivationGauge score={score} />
          <div className={`mt-3 text-sm px-3 py-1 rounded ${c.bg}/20 ${c.text} font-bold`}>{c.label}</div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 uppercase mb-1">Présence</p>
            <p className="text-lg font-bold text-white">{employe.presence}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 uppercase mb-1">Ponctualité</p>
            <p className="text-lg font-bold text-white">{employe.ponctualite}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-slate-400 uppercase mb-1">Productivité</p>
            <p className="text-lg font-bold text-white">{employe.productivite}%</p>
          </div>
        </div>
        <div className={`rounded-lg p-3 mb-6 ${c.bg}/10 border border-slate-800`}>
          <p className={`text-xs font-bold ${c.text} uppercase mb-1`}>Recommandation</p>
          <p className="text-sm text-slate-300">
            {score >= 80 && 'Prime + reconnaissance publique. Continuer sur cette lancée !'}
            {score >= 60 && score < 80 && 'Entretien individuel + formation ciblée pour progresser.'}
            {score < 60 && 'URGENT : entretien disciplinaire + plan de redressement 30 jours.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onFermer} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded">Fermer</button>
          <button onClick={() => { onSupprimer(employe.id); onFermer(); }}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-2 rounded flex items-center justify-center gap-2">
            <Trash2 size={16} /> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};
const ModuleProduits = () => {
  const CATEGORIES = ['Vêtements', 'Chaussures', 'Accessoires', 'Alimentation', 'Électronique', 'Autre'];
  const [produits, setProduits] = useLocalStorage('cockpit-produits', [] as any[]);
  const [recherche, setRecherche] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    categorie: 'Vêtements',
    prix: 0,
    quantite: 0,
  });

  const produitsFiltres = produits.filter((p: any) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  const valeurTotale = produits.reduce((acc: number, p: any) => acc + (p.prix * p.quantite), 0);
  const produitsEnRupture = produits.filter((p: any) => p.quantite < 5).length;

  const ajouterProduit = () => {
    if (!formData.nom.trim()) return;
    setProduits([...produits, {
      id: Date.now(),
      ...formData,
    }]);
    setFormData({ nom: '', categorie: 'Vêtements', prix: 0, quantite: 0 });
    setShowForm(false);
  };

  const supprimerProduit = (id: number) => {
    setProduits(produits.filter((p: any) => p.id !== id));
  };

  const modifierQuantite = (id: number, delta: number) => {
    setProduits(produits.map((p: any) =>
      p.id === id ? { ...p, quantite: Math.max(0, p.quantite + delta) } : p
    ));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="text-cyan-400">📦</span> Module Produits
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 uppercase mb-1">Total produits</p>
          <p className="text-2xl font-bold text-cyan-400">{produits.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 uppercase mb-1">Valeur du stock</p>
          <p className="text-2xl font-bold text-green-400">{valeurTotale.toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 uppercase mb-1">En rupture (&lt; 5)</p>
          <p className={`text-2xl font-bold ${produitsEnRupture > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {produitsEnRupture}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-bold text-white mb-3">Ajouter un produit</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Nom du produit"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
              autoFocus
            />
            <select
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number"
              placeholder="Prix (FCFA)"
              value={formData.prix || ''}
              onChange={(e) => setFormData({ ...formData, prix: Number(e.target.value) })}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            />
            <input
              type="number"
              placeholder="Quantité"
              value={formData.quantite || ''}
              onChange={(e) => setFormData({ ...formData, quantite: Number(e.target.value) })}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-sm"
            >
              Annuler
            </button>
            <button
              onClick={ajouterProduit}
              disabled={!formData.nom.trim()}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-2 rounded text-sm"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Rechercher un produit..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
        />
      </div>

      {/* Liste des produits */}
      {produitsFiltres.length === 0 ? (
        <p className="text-sm text-slate-500 italic text-center py-6">
          {produits.length === 0
            ? 'Aucun produit enregistré. Cliquez sur "+ Nouveau produit" pour commencer.'
            : 'Aucun produit ne correspond à votre recherche.'}
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {produitsFiltres.map((p: any) => {
            const enRupture = p.quantite < 5;
            return (
              <div key={p.id}
                className={`flex items-center justify-between gap-3 bg-slate-800/50 border rounded-lg p-3 ${
                  enRupture ? 'border-red-500/40' : 'border-slate-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm">{p.nom}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      {p.categorie}
                    </span>
                    {enRupture && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                        ⚠️ Rupture
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {p.prix.toLocaleString('fr-FR')} FCFA l'unité
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => modifierQuantite(p.id, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded font-bold"
                  >
                    −
                  </button>
                  <span className={`text-sm font-bold w-10 text-center ${
                    enRupture ? 'text-red-400' : 'text-white'
                  }`}>
                    {p.quantite}
                  </span>
                  <button
                    onClick={() => modifierQuantite(p.id, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="text-right min-w-[100px]">
                  <p className="text-xs text-slate-400">Valeur</p>
                  <p className="text-sm font-bold text-cyan-400">
                    {(p.prix * p.quantite).toLocaleString('fr-FR')}
                  </p>
                </div>

                <button
                  onClick={() => supprimerProduit(p.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

<ModuleProduits />
const ModulePointage = ({ employes }: any) => {
  const [heure, setHeure] = useState(new Date());
  const [pointages, setPointages] = useLocalStorage('cockpit-pointages', [] as any[]);
  const [employeChoisi, setEmployeChoisi] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setHeure(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const heureStr = heure.toLocaleTimeString('fr-FR');
  const dateStr = heure.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const pointer = (type: 'in' | 'out') => {
    if (!employeChoisi) return;
    const emp = employes.find((e: any) => e.nom === employeChoisi);
    if (!emp) return;
    const estEnRetard = heure.getHours() > 8 || (heure.getHours() === 8 && heure.getMinutes() > 10);
    const nouveauPointage = {
      id: Date.now(),
      employe: emp.nom,
      poste: emp.poste,
      heure: heureStr,
      type,
      statut: type === 'in' ? (estEnRetard ? 'Retard' : 'Présent') : 'Parti',
    };
    setPointages([nouveauPointage, ...pointages]);
    setEmployeChoisi('');
  };

  const pointagesIn = pointages.filter((p: any) => p.type === 'in');
  const pointagesOut = pointages.filter((p: any) => p.type === 'out');
  const retards = pointagesIn.filter((p: any) => p.statut === 'Retard').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Clock size={16} className="text-cyan-400" /> Module de pointage
        </h2>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-cyan-400">{heureStr}</div>
          <div className="text-xs text-slate-500 capitalize">{dateStr}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 uppercase mb-1">Arrivées</p>
          <p className="text-2xl font-bold text-green-400">{pointagesIn.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 uppercase mb-1">Départs</p>
          <p className="text-2xl font-bold text-blue-400">{pointagesOut.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 uppercase mb-1">Retards</p>
          <p className="text-2xl font-bold text-red-400">{retards}</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <select value={employeChoisi} onChange={(e) => setEmployeChoisi(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-3 text-white">
          <option value="">— Sélectionner un employé —</option>
          {employes.map((emp: any) => (
            <option key={emp.id} value={emp.nom}>{emp.nom} — {emp.poste}</option>
          ))}
        </select>
        <button onClick={() => pointer('in')} disabled={!employeChoisi}
          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold px-6 py-3 rounded">
          <LogIn size={20} /> CHECK-IN
        </button>
        <button onClick={() => pointer('out')} disabled={!employeChoisi}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold px-6 py-3 rounded">
          <LogOut size={20} /> CHECK-OUT
        </button>
      </div>
      <div>
        <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">Historique du jour</h3>
        {pointages.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center py-4">Aucun pointage enregistré aujourd'hui</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pointages.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-3">
                  {p.type === 'in' ? <LogIn size={16} className="text-green-400" /> : <LogOut size={16} className="text-orange-400" />}
                  <span className="text-white">{p.employe}</span>
                  <span className="text-slate-500 text-xs">{p.poste}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-mono">{p.heure}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    p.statut === 'Présent' ? 'bg-green-500/20 text-green-400' :
                    p.statut === 'Retard' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>{p.statut}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ModuleCalendrier = ({ employes }: any) => {
  const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const SHIFTS = [
    { nom: 'Matin', couleur: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { nom: 'Après-midi', couleur: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { nom: 'Nuit', couleur: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  ];

  const [planning, setPlanning] = useLocalStorage('cockpit-planning', [] as any[]);
  const [jourChoisi, setJourChoisi] = useState('Lundi');
  const [shiftChoisi, setShiftChoisi] = useState('Matin');
  const [employeChoisi, setEmployeChoisi] = useState('');

  const ajouterAuPlanning = () => {
    if (!employeChoisi) return;
    const emp = employes.find((e: any) => e.nom === employeChoisi);
    if (!emp) return;
    const existeDeja = planning.some((p: any) => p.jour === jourChoisi && p.shift === shiftChoisi && p.employe === emp.nom);
    if (existeDeja) return;
    setPlanning([...planning, {
      id: Date.now(),
      jour: jourChoisi,
      shift: shiftChoisi,
      employe: emp.nom,
      poste: emp.poste,
    }]);
    setEmployeChoisi('');
  };

  const supprimerCreneau = (id: number) => {
    setPlanning(planning.filter((p: any) => p.id !== id));
  };

  const getShiftStyle = (nom: string) => SHIFTS.find(s => s.nom === nom)?.couleur || 'bg-slate-800 text-slate-300';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="text-cyan-400">📅</span> Calendrier de planification
        </h2>
        <div className="text-xs text-slate-500">{planning.length} créneau(x) planifié(s)</div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <select value={jourChoisi} onChange={(e) => setJourChoisi(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-3 text-white">
          {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
        </select>

        <select value={shiftChoisi} onChange={(e) => setShiftChoisi(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-3 text-white">
          {SHIFTS.map(s => <option key={s.nom} value={s.nom}>{s.nom}</option>)}
        </select>

        <select value={employeChoisi} onChange={(e) => setEmployeChoisi(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-3 text-white">
          <option value="">— Sélectionner un employé —</option>
          {employes.map((emp: any) => (
            <option key={emp.id} value={emp.nom}>{emp.nom} — {emp.poste}</option>
          ))}
        </select>

        <button onClick={ajouterAuPlanning} disabled={!employeChoisi}
          className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold px-6 py-3 rounded">
          + Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {JOURS.map(jour => {
          const creneauxJour = planning.filter((p: any) => p.jour === jour);
          return (
            <div key={jour} className="bg-slate-800/30 border border-slate-800 rounded-lg p-3 min-h-[120px]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pb-2 border-b border-slate-700">
                {jour}
              </h3>
              <div className="space-y-1">
                {creneauxJour.length === 0 ? (
                  <p className="text-[10px] text-slate-600 italic">Libre</p>
                ) : (
                  creneauxJour.map((c: any) => (
                    <div key={c.id} className={`text-[10px] px-2 py-1 rounded border flex items-center justify-between gap-1 ${getShiftStyle(c.shift)}`}>
                      <div className="flex-1 truncate">
                        <div className="font-bold truncate">{c.employe}</div>
                        <div className="opacity-70">{c.shift}</div>
                      </div>
                      <button onClick={() => supprimerCreneau(c.id)}
                        className="hover:text-white opacity-60 hover:opacity-100 text-xs font-bold">×</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function CockpitRH() {
  const [employes, setEmployes] = useLocalStorage('cockpit-employes', EMPLOYES_INITIAUX);
  const [showForm, setShowForm] = useState(false);
  const [employeSelectionne, setEmployeSelectionne] = useState<any>(null);

  const moyenneMotivation = employes.length > 0
    ? Math.round(employes.reduce((acc: number, e: any) => acc + calculerMotivation(e), 0) / employes.length)
    : 0;
  const presents = employes.filter((e: any) => e.presence >= 80).length;
  const retards = employes.filter((e: any) => e.ponctualite < 80 && e.ponctualite >= 60).length;
  const absents = employes.filter((e: any) => e.presence < 60).length;

  const ajouterEmploye = (data: any) => setEmployes([...employes, { id: Date.now(), ...data }]);
  const supprimerEmploye = (id: number) => setEmployes(employes.filter((e: any) => e.id !== id));

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100 p-6">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">BOUTIQUE COCKPIT</h1>
          <p className="text-xs text-slate-400">Module 3 — Organisation & RH</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500">Tableau de bord en direct</div>
            <div className="text-sm font-mono text-cyan-400">● EN LIGNE</div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-4 py-2 rounded-lg">
            <Plus size={18} /> Nouvel employé
          </button>
        </div>
      </div>

      <ModulePointage employes={employes} />

      <ModuleProduits />
      <ModuleCalendrier employes={employes} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard icon={Users} title="Présents" value={`${presents}/${employes.length}`} subtitle="Employés actifs" color="bg-green-500/20 text-green-400" />
        <KpiCard icon={Clock} title="Retards" value={retards} subtitle="À surveiller" color="bg-orange-500/20 text-orange-400" />
        <KpiCard icon={AlertTriangle} title="Absents" value={absents} subtitle="Action urgente" color="bg-red-500/20 text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center">
          <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-4">Motivation globale</h2>
          <MotivationGauge score={moyenneMotivation} />
          <p className="text-xs text-slate-500 mt-4 text-center">Score moyen de l'équipe</p>
        </div>
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> Classement des employés
          </h2>
          <div className="space-y-3">
            {employes.slice().sort((a: any, b: any) => calculerMotivation(b) - calculerMotivation(a)).map((emp: any, idx: number) => {
              const score = calculerMotivation(emp);
              const c = getColor(score);
              return (
                <div key={emp.id} onClick={() => setEmployeSelectionne(emp)}
                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 p-2 rounded transition">
                  <div className="w-6 text-slate-500 text-xs font-bold">#{idx + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-white">{emp.nom} <span className="text-slate-500 text-xs">— {emp.poste}</span></span>
                      <span className={`text-sm font-bold ${c.text}`}>{score}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className={`h-2 rounded-full ${c.bg}`} style={{ width: `${score}%`, transition: 'width 1s' }} />
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${c.bg}/20 ${c.text}`}>{c.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" /> Recommandations automatiques
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {employes.filter((e: any) => calculerMotivation(e) < 60).map((emp: any) => (
            <div key={emp.id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} className="text-red-400" />
                <span className="text-red-400 text-sm font-bold">URGENT — {emp.nom}</span>
              </div>
              <p className="text-xs text-slate-400">Score {calculerMotivation(emp)}%. Action : entretien individuel + plan de motivation 30 jours.</p>
            </div>
          ))}
          {employes.filter((e: any) => calculerMotivation(e) >= 60 && calculerMotivation(e) < 80).map((emp: any) => (
            <div key={emp.id} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-orange-400" />
                <span className="text-orange-400 text-sm font-bold">À surveiller — {emp.nom}</span>
              </div>
              <p className="text-xs text-slate-400">Score {calculerMotivation(emp)}%. Action : entretien + formation ciblée.</p>
            </div>
          ))}
          {employes.filter((e: any) => calculerMotivation(e) >= 80).map((emp: any) => (
            <div key={emp.id} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-green-400" />
                <span className="text-green-400 text-sm font-bold">Excellent — {emp.nom}</span>
              </div>
              <p className="text-xs text-slate-400">Score {calculerMotivation(emp)}%. Action : prime + reconnaissance publique.</p>
            </div>
          ))}
        </div>
      </div>

      {showForm && <FormulaireEmploye onAjouter={ajouterEmploye} onFermer={() => setShowForm(false)} />}
      {employeSelectionne && (
        <FicheEmploye employe={employeSelectionne} onFermer={() => setEmployeSelectionne(null)} onSupprimer={supprimerEmploye} />
      )}
    </div>
  );
}