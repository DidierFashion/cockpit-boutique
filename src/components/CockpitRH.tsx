import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle, TrendingUp, Zap, Plus, X, Trash2, User, LogIn, LogOut } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, setDoc, runTransaction } from 'firebase/firestore';
import ModuleGraphiques from './ModuleGraphiques';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

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

// Après
               const ModuleProduits = ({ produits, estAdmin }: any) => {
  const CATEGORIES = ['Vêtements', 'Chaussures', 'Accessoires', 'Alimentation', 'Électronique', 'Autre'];
 
  const [recherche, setRecherche] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    categorie: 'Vêtements',
    prix: 0,
    prixAchat: 0,
    quantite: 0,
  });

  const produitsArray = Array.isArray(produits) ? produits : [];

  const produitsFiltres = produitsArray.filter((p: any) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  const produitsEnRupture = produitsArray.filter((p: any) => Number(p.quantite) < 5).length;

  const valeurStock = produitsArray.reduce((acc: number, p: any) => acc + (Number(p.prix) * Number(p.quantite)), 0);
  const margePotentielle = produitsArray.reduce((acc: number, p: any) => acc + ((Number(p.prix) - Number(p.prixAchat)) * Number(p.quantite)), 0);

  const ajouterProduit = async () => {
    if (!formData.nom.trim()) {
      alert("Veuillez entrer un nom de produit.");
      return;
    }
   
    try {
      await addDoc(collection(db, "produits"), {
        nom: formData.nom,
        categorie: formData.categorie,
        prix: Number(formData.prix),
        prixAchat: Number(formData.prixAchat),
        quantite: Number(formData.quantite)
      });
      setFormData({ nom: '', categorie: 'Vêtements', prix: 0, prixAchat: 0, quantite: 0 });
      setShowForm(false);
      alert("Produit ajouté avec succès !");
    } catch (error) {
      console.error("ERREUR FIREBASE :", error);
      alert("Erreur lors de l'ajout. Regardez la console.");
    }
  };

  const supprimerProduit = async (id: string) => {
    try {
      await deleteDoc(doc(db, "produits", id));
    } catch (error) {
      console.error("Erreur lors de la suppression : ", error);
    }
  };

  const modifierQuantite = async (id: string, delta: number) => {
    try {
      const produit = produitsArray.find((p: any) => p.id === id);
      if (produit) {
        const nouveauStock = Math.max(0, Number(produit.quantite) + delta);
        await updateDoc(doc(db, "produits", id), { quantite: nouveauStock });
      }
    } catch (error) {
      console.error("Erreur lors de la modification : ", error);
    }
  };

 const reapprovisionnerStock = async (id: string, quantiteAjoutee: number) => {
  try {
    const produitRef = doc(db, "produits", id);
    
    // 🚀 TRANSACTION ATOMIQUE pour le stock ET la dépense
    await runTransaction(db, async (transaction) => {
      const produitDoc = await transaction.get(produitRef);
      if (!produitDoc.exists()) throw "Produit introuvable !";

      const produitData = produitDoc.data();
      const nouveauStock = Number(produitData.quantite) + quantiteAjoutee;
      
      // On calcule le coût de l'achat
      const coutAchat = quantiteAjoutee * Number(produitData.prixAchat || 0);

      // 1. Mettre à jour le stock
      transaction.update(produitRef, { quantite: nouveauStock });

      // 2. Créer la dépense automatiquement (si le prix d'achat est supérieur à 0)
      if (coutAchat > 0) {
        const maintenant = new Date();
        const depenseRef = doc(collection(db, "depenses"));
        transaction.set(depenseRef, {
          description: `Achat stock : ${produitData.nom} (x${quantiteAjoutee})`,
          categorie: 'Fournisseurs',
          montant: Number(coutAchat),
          date: maintenant.toLocaleDateString('fr-FR'),
          mois: maintenant.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          timestamp: maintenant.getTime(),
          type: 'Achat_Stock'
        });
      }
    });
    
    alert("✅ Stock mis à jour et dépense enregistrée !");
  } catch (error) {
    console.error("Erreur lors du réapprovisionnement : ", error);
    alert("❌ Erreur lors du réapprovisionnement.");
  }
};
 
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 uppercase mb-1">Total produits</p>
          <p className="text-2xl font-bold text-cyan-400">{produitsArray.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 uppercase mb-1">Valeur du stock</p>
          <p className="text-2xl font-bold text-green-400">
            {valeurStock.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 uppercase mb-1">Marge Potentielle</p>
          <p className="text-2xl font-bold text-green-400">
            {margePotentielle.toLocaleString('fr-FR')} FCFA
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-400 uppercase mb-1">En rupture (&lt; 5)</p>
          <p className={`text-2xl font-bold ${produitsEnRupture > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {produitsEnRupture}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-bold text-white mb-3">Ajouter un produit</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text" placeholder="Nom du produit" value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm" autoFocus
            />
            <select
              value={formData.categorie}
              onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number" placeholder="Prix (FCFA)" value={formData.prix || ''}
              onChange={(e) => setFormData({ ...formData, prix: Number(e.target.value) })}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            />
            <input
              type="number" placeholder="Prix d'achat (FCFA)" value={formData.prixAchat || ''}
              onChange={(e) => setFormData({ ...formData, prixAchat: Number(e.target.value) })}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            />
            <input
              type="number" placeholder="Quantité" value={formData.quantite || ''}
              onChange={(e) => setFormData({ ...formData, quantite: Number(e.target.value) })}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={ajouterProduit} disabled={!formData.nom.trim()}
              className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-2 rounded text-sm"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text" placeholder="🔍 Rechercher un produit..." value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
        />
      </div>

      {produitsFiltres.length === 0 ? (
        <p className="text-sm text-slate-500 italic text-center py-6">
          {produitsArray.length === 0
            ? 'Aucun produit enregistré. Cliquez sur "+ Nouveau produit" pour commencer.'
            : 'Aucun produit ne correspond à votre recherche.'}
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {produitsFiltres.map((p: any) => {
            const enRupture = Number(p.quantite) < 5;
            return (
              <div key={p.id}
                className={`flex flex-wrap items-center justify-between gap-3 bg-slate-800/50 border rounded-lg p-3 ${
                  enRupture ? 'border-red-500/40' : 'border-slate-700'
                }`}
              >
                <div className="flex-1 min-w-[150px]">
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
                    {Number(p.prix).toLocaleString('fr-FR')} FCFA l'unité
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => modifierQuantite(p.id, -1)}
                    className="w-7 h-7 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded font-bold">
                    −
                  </button>
                  <span className={`text-sm font-bold w-10 text-center ${enRupture ? 'text-red-400' : 'text-white'}`}>
                    {p.quantite}
                  </span>
                  <button onClick={() => modifierQuantite(p.id, 1)}
                    className="w-7 h-7 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded font-bold">
                    +
                  </button>
                  <button
                    onClick={() => {
                      if (estAdmin) {
                        const qte = prompt("Combien de produits ajouter au stock ?");
                        if (qte && !isNaN(Number(qte))) reapprovisionnerStock(p.id, Number(qte));
                      } else {
                        const mdp = prompt("Entrez le mot de passe Patron pour modifier le stock :");
                        if (mdp === "admin123") {
                          const qte = prompt("Combien de produits ajouter au stock ?");
                          if (qte && !isNaN(Number(qte))) reapprovisionnerStock(p.id, Number(qte));
                        } else {
                          alert("Action non autorisée !");
                        }
                      }
                    }}
                    className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-bold"
                    title="Réapprovisionner"
                  >
                    + Stock
                  </button>
                </div>  
                <div className="text-right min-w-[100px]">
                  <p className="text-xs text-slate-400">Valeur</p>
                  <p className="text-sm font-bold text-cyan-400">
                    {(Number(p.prix) * Number(p.quantite)).toLocaleString('fr-FR')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (estAdmin) {
                      supprimerProduit(p.id);
                    } else {
                      const mdp = prompt("Entrez le mot de passe Patron pour supprimer :");
                      if (mdp === "admin123") supprimerProduit(p.id);
                      else alert("Action non autorisée !");
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
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

const ModuleCalendrier = ({ employes }: any) => {
  const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const SHIFTS = [
    { nom: 'Matin', couleur: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { nom: 'Après-midi', couleur: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { nom: 'Nuit', couleur: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  ];
  const [planning, setPlanning] = useState<any[]>([]);
  const [jourChoisi, setJourChoisi] = useState('Lundi');
  const [shiftChoisi, setShiftChoisi] = useState('Matin');
  const [employeChoisi, setEmployeChoisi] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "planning"), (snapshot) => {
      setPlanning(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const ajouterAuPlanning = async () => {
    if (!employeChoisi) return;
    const emp = employes.find((e: any) => e.nom === employeChoisi);
    if (!emp) return;
    const existeDeja = planning.some((p: any) => p.jour === jourChoisi && p.shift === shiftChoisi && p.employe === emp.nom);
    if (existeDeja) return;
    try {
      await addDoc(collection(db, "planning"), { jour: jourChoisi, shift: shiftChoisi, employe: emp.nom, poste: emp.poste, timestamp: Date.now() });
      setEmployeChoisi('');
    } catch (error) { console.error(error); }
  };

  const supprimerCreneau = async (id: string) => {
    try { await deleteDoc(doc(db, "planning", id)); } catch (error) { console.error(error); }
  };

  const getShiftStyle = (nom: string) => SHIFTS.find(s => s.nom === nom)?.couleur || 'bg-slate-800 text-slate-300';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2"><span className="text-cyan-400">📅</span> Calendrier de planification</h2>
        <div className="text-xs text-slate-500">{planning.length} créneau(x) planifié(s)</div>
      </div>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <select value={jourChoisi} onChange={(e) => setJourChoisi(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-3 text-white">{JOURS.map(j => <option key={j} value={j}>{j}</option>)}</select>
        <select value={shiftChoisi} onChange={(e) => setShiftChoisi(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-3 text-white">{SHIFTS.map(s => <option key={s.nom} value={s.nom}>{s.nom}</option>)}</select>
        <select value={employeChoisi} onChange={(e) => setEmployeChoisi(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-3 text-white">
          <option value="">— Sélectionner un employé —</option>
          {employes.map((emp: any) => (<option key={emp.id} value={emp.nom}>{emp.nom} — {emp.poste}</option>))}
        </select>
        <button onClick={ajouterAuPlanning} disabled={!employeChoisi} className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold px-6 py-3 rounded">+ Ajouter</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {JOURS.map(jour => {
          const creneauxJour = planning.filter((p: any) => p.jour === jour);
          return (
            <div key={jour} className="bg-slate-800/30 border border-slate-800 rounded-lg p-3 min-h-[120px]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pb-2 border-b border-slate-700">{jour}</h3>
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
                      <button onClick={() => supprimerCreneau(c.id)} className="hover:text-white opacity-60 hover:opacity-100 text-xs font-bold">×</button>
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

const ModuleEquipe = ({ employes, ajouterEmploye, supprimerEmploye, modifierEmploye }: any) => {
  const [form, setForm] = useState({ nom: '', poste: 'Vendeur', salaireBase: 0, pin: '', telephone: '' });

  const handleAjouter = () => {
    if (!form.nom.trim()) return alert("Le nom est obligatoire.");
    if (!form.pin.trim()) return alert("Le code PIN est obligatoire pour le pointage.");
    ajouterEmploye(form);
    setForm({ nom: '', poste: 'Vendeur', salaireBase: 0, pin: '', telephone: '' });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-4">👥 Gestion de l'Équipe</h2>
      
      {/* Formulaire d'ajout */}
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 mb-6">
        <h3 className="text-xs uppercase text-slate-400 mb-3">Ajouter un nouvel employé</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input placeholder="Nom complet" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-2 text-white text-sm" />
          <select value={form.poste} onChange={e => setForm({...form, poste: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-2 text-white text-sm">
            <option>Gérant</option><option>Vendeur</option><option>Caissier</option><option>Magasinier</option><option>Superviseur</option>
          </select>
          <input type="number" placeholder="Salaire de base (FCFA)" value={form.salaireBase || ''} onChange={e => setForm({...form, salaireBase: Number(e.target.value)})} className="bg-slate-900 border border-slate-700 rounded px-2 py-2 text-white text-sm" />
          <input placeholder="Code PIN (4 chiffres)" value={form.pin} onChange={e => setForm({...form, pin: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-2 text-white text-sm" />
          <button onClick={handleAjouter} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded text-sm py-2">Ajouter l'employé</button>
        </div>
      </div>

      {/* Liste des employés */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-800 text-slate-400">
            <tr>
              <th className="px-3 py-3">Nom</th><th className="px-3 py-3">Poste</th><th className="px-3 py-3">Salaire Base</th><th className="px-3 py-3">Code PIN</th><th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employes.map((emp: any) => (
              <tr key={emp.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="px-3 py-2 font-bold text-white">{emp.nom}</td>
                <td className="px-3 py-2">{emp.poste}</td>
                <td className="px-3 py-2 text-green-400">{emp.salaireBase?.toLocaleString() || 0} FCFA</td>
                <td className="px-3 py-2 font-mono text-cyan-400">{emp.pin || 'Non défini'}</td>
                <td className="px-3 py-2">
                  <button onClick={() => supprimerEmploye(emp.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                <button 
  onClick={() => {
    const nouveauSalaire = prompt(`Nouveau salaire pour ${emp.nom} (actuel: ${emp.salaireBase || 0}) :`, emp.salaireBase || 0);
    const nouveauPin = prompt(`Nouveau code PIN pour ${emp.nom} (actuel: ${emp.pin || 'Non défini'}) :`, emp.pin || '');
    if (nouveauSalaire !== null && nouveauPin !== null) {
      modifierEmploye(emp.id, Number(nouveauSalaire), nouveauPin);
    }
  }} 
  className="text-cyan-400 hover:text-cyan-300 mr-3"
>
  <User size={16} />
</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ModulePointage = ({ employes, estAdmin }: any) => {
  const [heure, setHeure] = useState(new Date());
  const [pointages, setPointages] = useState<any[]>([]);
  const [employeChoisi, setEmployeChoisi] = useState('');
  const [pinSaisi, setPinSaisi] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setHeure(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pointages"), (snapshot) => {
      setPointages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const heureStr = heure.toLocaleTimeString('fr-FR');
  const dateStr = heure.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Fonction pour gérer l'arrivée OU le départ automatiquement
  const gererPointage = async (employeNom: string, pin: string, estAdminAction: boolean = false) => {
    const emp = employes.find((e: any) => e.nom === employeNom);
    if (!emp) return;
    if (!estAdminAction && pin !== emp.pin) {
      alert("❌ Code PIN incorrect !");
      return;
    }

    // On cherche si l'employé a déjà pointé aujourd'hui
    const pointageDuJour = pointages.find((p: any) => p.employe === emp.nom && p.date === dateStr);

    try {
      if (!pointageDuJour) {
        // C'est une ARRIVÉE
        const estEnRetard = heure.getHours() > 8 || (heure.getHours() === 8 && heure.getMinutes() > 0);
        await addDoc(collection(db, "pointages"), {
          employe: emp.nom, poste: emp.poste, date: dateStr,
          heureArrivee: heureStr, 
          statut: estEnRetard ? 'Retard' : 'Présent',
          timestampArrivee: Date.now(),
          confirmeParPC: estAdminAction 
        });
        alert(`✅ Arrivée enregistrée pour ${emp.nom} !`);
      } else {
        // C'est un DÉPART (on met à jour le document existant)
        await updateDoc(doc(db, "pointages", pointageDuJour.id), {
          heureDepart: heureStr,
          timestampDepart: Date.now(),
          confirmeParPC: estAdminAction
        });
        alert(`✅ Départ enregistré pour ${emp.nom} !`);
      }
      setEmployeChoisi('');
      setPinSaisi('');
    } catch (error) { console.error(error); }
  };

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

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <select value={employeChoisi} onChange={(e) => setEmployeChoisi(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-3 text-white">
          <option value="">— Sélectionner un employé —</option>
          {employes.map((emp: any) => (<option key={emp.id} value={emp.nom}>{emp.nom} — {emp.poste}</option>))}
        </select>
        <input type="password" placeholder="Code PIN" value={pinSaisi} onChange={(e) => setPinSaisi(e.target.value)} className="w-full md:w-32 bg-slate-800 border border-slate-700 rounded px-3 py-3 text-white text-center" />
        <button onClick={() => gererPointage(employeChoisi, pinSaisi)} disabled={!employeChoisi || !pinSaisi} className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold px-6 py-3 rounded">Pointer</button>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">Pointages du jour</h3>
        {pointages.length === 0 ? (
          <p className="text-sm text-slate-500 italic text-center py-4">Aucun pointage enregistré aujourd'hui</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pointages.map((p: any) => (
              <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between bg-slate-800/50 rounded-lg p-3 text-sm gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">{p.employe}</span>
                  <span className="text-slate-500 text-xs">{p.poste}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-green-400">Arrivée: {p.heureArrivee}</div>
                  <div className={p.heureDepart ? "text-orange-400" : "text-slate-500 italic"}>
                    Départ: {p.heureDepart || 'En cours...'}
                  </div>
                  {p.statut === 'Retard' && <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">Retard</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ModulePaie = ({ employes }: any) => {
  
  const [avances, setAvances] = useState<any[]>([]);
const [nouvelleAvance, setNouvelleAvance] = useState({ nom: '', montant: 0 });

useEffect(() => {
  const unsub = onSnapshot(collection(db, "avances"), (snap) => {
    setAvances(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
  return () => unsub();
}, []);

const demanderAvance = async () => {
  if (!nouvelleAvance.nom || nouvelleAvance.montant <= 0) return;
  await addDoc(collection(db, "avances"), {
    nom: nouvelleAvance.nom,
    montant: Number(nouvelleAvance.montant),
    date: new Date().toLocaleDateString('fr-FR'),
    statut: 'En attente'
  });
  setNouvelleAvance({ nom: '', montant: 0 });
};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-4">💵 Calcul de Paie et Primes</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-800 text-slate-400">
            <tr>
              <th className="px-4 py-3">Employé</th><th className="px-4 py-3">Base</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Prime</th><th className="px-4 py-3">Avances</th><th className="px-4 py-3">Retards</th><th className="px-4 py-3">Net</th><th className="px-4 py-3">Fiche</th>
            </tr>
          </thead>
          <tbody>
            {employes.map((emp: any) => {
                          
const criterePonctualite = emp.ponctualite >= 80 ? 20 : (emp.ponctualite >= 50 ? 10 : 0);
const criterePresence = emp.presence >= 80 ? 20 : (emp.presence >= 50 ? 10 : 0);
const critereRespect = 20; // À connecter plus tard
const critereMarchandises = 20; // À connecter plus tard
const critereEngagement = 20; // À connecter plus tard
const critereSixieme = 20; // À connecter plus tard

const scoreGlobal = criterePonctualite + criterePresence + critereRespect + critereMarchandises + critereEngagement + critereSixieme;

const base = emp.salaireBase || 900;
// Prime : 20% du salaire de base, modulée par le score global
const prime = (base * 0.20) * (Math.min(scoreGlobal, 100) / 100); 

const retardsDeduction = 0;
const avances = 0;
const net = base + prime - avances - retardsDeduction;
              return (
                <tr key={emp.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-bold text-white">{emp.nom}</td>
                  <td className="px-4 py-3">{base.toLocaleString('fr-FR')} FCFA</td>
                  <td className={`px-4 py-3 font-bold FCFA{scoreGlobal >= 80 ? 'text-green-400' : scoreGlobal >= 60 ? 'text-orange-400' : 'text-red-400'}`}>{scoreGlobal}</td>
                  <td className="px-4 py-3 text-green-400">{prime.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3 text-red-400">-FCFA{avances.toFixed(2)}</td>
                  <td className="px-4 py-3 text-red-400">-FCFA{retardsDeduction.toFixed(2)}</td>
                  <td className="px-4 py-3 font-bold text-cyan-400">{net.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3"><button className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded">Fiche</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Section Avances */}
<div className="mt-8 border-t border-slate-800 pt-6">
  <h3 className="text-sm uppercase text-slate-400 mb-4">💸 Demandes d'avance sur salaire</h3>
  <div className="flex gap-2 mb-4">
    <select value={nouvelleAvance.nom} onChange={(e) => setNouvelleAvance({...nouvelleAvance, nom: e.target.value})} className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white">
      <option value="">— Choisir un employé —</option>
      {employes.map((emp: any) => <option key={emp.id} value={emp.nom}>{emp.nom}</option>)}
    </select>
    <input type="number" placeholder="Montant" value={nouvelleAvance.montant || ''} onChange={(e) => setNouvelleAvance({...nouvelleAvance, montant: Number(e.target.value)})} className="w-32 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
    <button onClick={demanderAvance} className="bg-cyan-500 text-slate-900 font-bold px-4 py-2 rounded">Demander</button>
  </div>
  
  <div className="space-y-2">
    {avances.map((av: any) => (
      <div key={av.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700 text-sm">
        <div><span className="text-white font-bold">{av.nom}</span> - {av.date}</div>
        <div className="flex items-center gap-3">
          <span className="text-red-400 font-bold">{av.montant.toLocaleString()} FCFA</span>
          <span className={`text-xs px-2 py-1 rounded ${av.statut === 'Validé' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>{av.statut}</span>
        </div>
      </div>
    ))}
  </div>
</div>

      </div>
    </div>
  );
};

const ModuleVentes = ({ produits, ventes }: any) => {
  const [produitChoisi, setProduitChoisi] = useState('');
  const [rechercheProduit, setRechercheProduit] = useState('');
  const [quantiteVente, setQuantiteVente] = useState(1);
  const [message, setMessage] = useState('');

  const produitsFiltresVente = (produits || []).filter((p: any) => p.nom.toLowerCase().includes(rechercheProduit.toLowerCase()));
  const venteDuJour = () => { const auj = new Date().toLocaleDateString('fr-FR'); return ventes.filter((v: any) => v.date === auj); };
  const venteDuMois = () => { const m = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }); return ventes.filter((v: any) => v.mois === m); };

  const caDuJour = venteDuJour().reduce((acc: number, v: any) => acc + v.total, 0);
  const caDuMois = venteDuMois().reduce((acc: number, v: any) => acc + v.total, 0);
  const nbVentesJour = venteDuJour().length;
  const panierMoyen = nbVentesJour > 0 ? Math.round(caDuJour / nbVentesJour) : 0;

 const enregistrerVente = async () => {
  if (!produitChoisi) return;
  const produit = produits.find((p: any) => p.nom === produitChoisi);
  if (!produit) return;

  try {
    const maintenant = new Date();
    const dateStr = maintenant.toLocaleDateString('fr-FR');
    const moisStr = maintenant.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const heureStr = maintenant.toLocaleTimeString('fr-FR').substring(0, 5);
    const total = produit.prix * quantiteVente;

    // 🚀 TRANSACTION ATOMIQUE : Met à jour le stock ET crée la vente en même temps
    await runTransaction(db, async (transaction) => {
      const produitRef = doc(db, "produits", produit.id);
      const produitDoc = await transaction.get(produitRef);
      
      if (!produitDoc.exists()) throw "Produit introuvable !";
      
      const stockActuel = produitDoc.data().quantite;
      if (stockActuel < quantiteVente) throw "Stock insuffisant !";

      // 1. Mettre à jour le stock
      transaction.update(produitRef, { quantite: stockActuel - quantiteVente });
      
      // 2. Créer la vente
      const venteRef = doc(collection(db, "ventes"));
      transaction.set(venteRef, { 
        produitNom: produit.nom, quantite: Number(quantiteVente), 
        prixUnitaire: Number(produit.prix), total: Number(total), 
        date: dateStr, mois: moisStr, heure: heureStr, timestamp: maintenant.getTime(),
        statut: 'valide'
      });
    });

    setMessage(`✅ Vente enregistrée avec succès !`); 
    setQuantiteVente(1); setProduitChoisi(''); setRechercheProduit(''); 
    setTimeout(() => setMessage(''), 3000);
  } catch (error) {
    console.error(error); 
    setMessage(`❌ Erreur : ${error}`); 
    setTimeout(() => setMessage(''), 3000);
  }
};
const annulerVente = async (id: string, produitNom: string, quantite: number) => {
  try {
    const produit = produits.find((p: any) => p.nom === produitNom);
    if (!produit) {
      alert("Produit introuvable pour l'annulation.");
      return;
    }

    // 🚀 TRANSACTION : Remet le stock et annule la vente
    await runTransaction(db, async (transaction) => {
      const produitRef = doc(db, "produits", produit.id);
      const produitDoc = await transaction.get(produitRef);
      
      if (!produitDoc.exists()) throw "Produit introuvable !";
      
      const stockActuel = produitDoc.data().quantite;
      
      // 1. Remettre le stock
      transaction.update(produitRef, { quantite: stockActuel + quantite });
      
      // 2. Supprimer (annuler) la vente
      transaction.delete(doc(db, "ventes", id));
    });

    alert("✅ Vente annulée et stock restauré !");
  } catch (error) {
    console.error(error);
    alert("❌ Erreur lors de l'annulation.");
  }
};

  const topProduits = () => {
    const compteur: any = {};
    ventes.forEach((v: any) => { if (!compteur[v.produitNom]) compteur[v.produitNom] = { qte: 0, ca: 0 }; compteur[v.produitNom].qte += v.quantite; compteur[v.produitNom].ca += v.total; });
    return Object.entries(compteur).map(([nom, data]: any) => ({ nom, ...data })).sort((a: any, b: any) => b.qte - a.qte).slice(0, 5);
  };
  const produitSelectionne = (produits || []).find((p: any) => p.nom === produitChoisi);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2"><span className="text-cyan-400">💰</span> Module Ventes</h2>
        <div className="text-xs text-slate-500">{ventes.length} vente(s) enregistrée(s)</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center"><p className="text-xs text-slate-400 uppercase mb-1">CA du jour</p><p className="text-lg font-bold text-green-400">{caDuJour.toLocaleString('fr-FR')}</p><p className="text-[10px] text-slate-500">FCFA</p></div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center"><p className="text-xs text-slate-400 uppercase mb-1">CA du mois</p><p className="text-lg font-bold text-cyan-400">{caDuMois.toLocaleString('fr-FR')}</p><p className="text-[10px] text-slate-500">FCFA</p></div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center"><p className="text-xs text-slate-400 uppercase mb-1">Ventes du jour</p><p className="text-lg font-bold text-white">{nbVentesJour}</p><p className="text-[10px] text-slate-500">transactions</p></div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center"><p className="text-xs text-slate-400 uppercase mb-1">Panier moyen</p><p className="text-lg font-bold text-orange-400">{panierMoyen.toLocaleString('fr-FR')}</p><p className="text-[10px] text-slate-500">FCFA</p></div>
      </div>
      <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 mb-6">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3">🛒 Nouvelle vente</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input type="text" placeholder="Tapez le nom du produit..." value={rechercheProduit} onChange={(e) => { setRechercheProduit(e.target.value); setProduitChoisi(''); }} className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white" />
            {rechercheProduit && !produitChoisi && (
              <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded shadow-lg max-h-48 overflow-y-auto">
                {produitsFiltresVente.length === 0 ? (<div className="p-3 text-slate-400 text-sm">Aucun produit trouvé.</div>) : (
                  produitsFiltresVente.map((p: any) => (<div key={p.id} onClick={() => { setProduitChoisi(p.nom); setRechercheProduit(p.nom); }} className="p-3 hover:bg-slate-700 cursor-pointer text-sm border-b border-slate-700 last:border-0"><span className="font-bold text-white">{p.nom}</span><span className="text-slate-400 ml-2">({p.quantite} en stock)</span></div>))
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mt-3">
          <input type="number" min="1" value={quantiteVente || ''} onChange={(e) => setQuantiteVente(Math.max(1, Number(e.target.value)))} className="w-full md:w-24 bg-slate-800 border border-slate-700 rounded px-3 py-3 text-white text-center" />
          <button onClick={enregistrerVente} disabled={!produitChoisi} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold px-6 py-3 rounded">💵 Vendre</button>
        </div>
        {produitSelectionne && quantiteVente > 0 && (<div className="mt-3 text-sm text-slate-400">Total : <span className="text-green-400 font-bold">{(produitSelectionne.prix * quantiteVente).toLocaleString('fr-FR')} FCFA</span></div>)}
        {message && (<div className="mt-3 text-sm text-center py-2 px-3 rounded bg-slate-700/50 text-white">{message}</div>)}
      </div>
      {ventes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">📋 Dernières ventes</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ventes.slice(0, 10).map((v: any) => (
                <div key={v.id} className="flex items-center justify-between gap-2 bg-slate-800/50 rounded-lg p-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0"><span className="text-slate-500 font-mono">{v.heure}</span><span className="text-white truncate">{v.produitNom}</span><span className="text-slate-500">×{v.quantite}</span></div>
                  <div className="flex items-center gap-2"><span className="text-green-400 font-bold">{v.total.toLocaleString('fr-FR')}</span><button onClick={() => annulerVente(v.id, v.produitNom, v.quantite)} className="text-red-400 hover:text-red-300"><Trash2 size={12} /></button></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">🏆 Top 5 produits</h3>
            <div className="space-y-2">
              {topProduits().map((p: any, idx: number) => (
                <div key={p.nom} className="flex items-center justify-between gap-2 bg-slate-800/50 rounded-lg p-2 text-xs">
                  <div className="flex items-center gap-2"><span className="text-slate-500 font-bold">#{idx + 1}</span><span className="text-white truncate">{p.nom}</span></div>
                  <div className="text-right"><div className="text-cyan-400 font-bold">×{p.qte}</div><div className="text-slate-500">{p.ca.toLocaleString('fr-FR')} F</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ModuleTachesFinance = () => {
  const [taches, setTaches] = useState<any[]>([]);
  const [nouvelleTache, setNouvelleTache] = useState('');
  const [type, setType] = useState('Consigne');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "taches_consignes"), (snap) => {
      setTaches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const ajouterTache = async () => {
    if (!nouvelleTache.trim()) return;
    await addDoc(collection(db, "taches_consignes"), {
      description: nouvelleTache,
      type: type,
      dateCreation: new Date().toISOString(),
      statut: 'En attente',
      validationPatron: false,
      auditHebdo: null
    });
    setNouvelleTache('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
      <h2 className="text-sm uppercase text-slate-400 mb-4">📋 Consignes & Missions</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <input type="text" value={nouvelleTache} onChange={(e) => setNouvelleTache(e.target.value)} placeholder="Nouvelle consigne précise..." className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white min-w-[200px]" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white">
          <option>Consigne</option>
          <option>Mission attendue</option>
        </select>
        <button onClick={ajouterTache} className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-4 py-2 rounded">Ajouter</button>
      </div>
      <div className="space-y-2">
        {taches.map(t => (
          <div key={t.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700">
            <div>
              <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 mr-2">{t.type}</span>
              <span className="text-white">{t.description}</span>
            </div>
            <span className={`text-xs font-bold ${t.validationPatron ? 'text-green-400' : 'text-orange-400'}`}>
              {t.validationPatron ? '✅ Validé' : '⏳ En attente'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ModuleFinance = ({ ventes, depenses }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ description: '', categorie: 'Loyer', montant: 0 });
  const CATEGORIES_DEPENSES = ['Loyer', 'Électricité', 'Eau', 'Salaires', 'Transport', 'Fournisseurs', 'Autre'];

  const aujourdHui = new Date().toLocaleDateString('fr-FR');
  const moisActuel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const caJour = ventes.filter((v: any) => v.date === aujourdHui).reduce((acc: number, v: any) => acc + v.total, 0);
  const caMois = ventes.filter((v: any) => v.mois === moisActuel).reduce((acc: number, v: any) => acc + v.total, 0);
  const depensesJour = depenses.filter((d: any) => d && d.date === aujourdHui).reduce((acc: number, d: any) => acc + Number(d.montant), 0);
  const depensesMois = depenses.filter((d: any) => d && d.mois === moisActuel).reduce((acc: number, d: any) => acc + Number(d.montant), 0);

  const beneficeJour = caJour - depensesJour;
  const beneficeMois = caMois - depensesMois;

  const ajouterDepense = async () => {
    if (!formData.description.trim() || formData.montant <= 0) return;
    const maintenant = new Date();
    try {
      await addDoc(collection(db, "depenses"), { description: formData.description, categorie: formData.categorie, montant: Number(formData.montant), date: maintenant.toLocaleDateString('fr-FR'), mois: maintenant.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }), timestamp: maintenant.getTime() });
      setFormData({ description: '', categorie: 'Loyer', montant: 0 });
      setShowForm(false);
    } catch (error) { console.error(error); }
  };

  const supprimerDepense = async (id: string) => { try { await deleteDoc(doc(db, "depenses", id)); } catch (error) { console.error(error); } };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2"><span className="text-cyan-400">💰</span> Module Finance</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm"><Plus size={16} /> Nouvelle dépense</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`rounded-xl p-4 border ${beneficeJour >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <p className="text-xs uppercase text-slate-400 mb-1">Bénéfice Net (Aujourd'hui)</p>
          <p className={`text-2xl font-bold ${beneficeJour >= 0 ? 'text-green-400' : 'text-red-400'}`}>{beneficeJour.toLocaleString('fr-FR')} FCFA</p>
          <div className="text-[10px] text-slate-500 mt-1 flex gap-2"><span>CA: {caJour.toLocaleString()}</span><span>- Dépenses: {depensesJour.toLocaleString()}</span></div>
        </div>
        <div className={`rounded-xl p-4 border ${beneficeMois >= 0 ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <p className="text-xs uppercase text-slate-400 mb-1">Bénéfice Net (Ce mois)</p>
          <p className={`text-2xl font-bold ${beneficeMois >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>{beneficeMois.toLocaleString('fr-FR')} FCFA</p>
          <div className="text-[10px] text-slate-500 mt-1 flex gap-2"><span>CA: {caMois.toLocaleString()}</span><span>- Dépenses: {depensesMois.toLocaleString()}</span></div>
        </div>
      </div>
      {showForm && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-bold text-white mb-3">Ajouter une dépense</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="text" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm" />
            <select value={formData.categorie} onChange={(e) => setFormData({ ...formData, categorie: e.target.value })} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm">{CATEGORIES_DEPENSES.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <input type="number" placeholder="Montant" value={formData.montant || ''} onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })} className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowForm(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded text-sm">Annuler</button>
            <button onClick={ajouterDepense} disabled={!formData.description || formData.montant <= 0} className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-2 rounded text-sm">Enregistrer</button>
          </div>
        </div>
      )}
      <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">📋 Historique des dépenses</h3>
      {depenses.length === 0 ? (<p className="text-sm text-slate-500 italic text-center py-4">Aucune dépense enregistrée.</p>) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {depenses.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between gap-3 bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm">
              <div><p className="text-white font-bold">{d.description}</p><p className="text-xs text-slate-500">{d.categorie} — {d.date}</p></div>
              <div className="flex items-center gap-3"><span className="text-red-400 font-bold">- {d.montant.toLocaleString('fr-FR')} FCFA</span><button onClick={() => supprimerDepense(d.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={14} /></button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function CockpitRH() {
  const [ongletActif, setOngletActif] = useState<'pointage' | 'produits' | 'ventes' | 'finance' | 'equipe' | 'paie'>('pointage');
  const [employes, setEmployes] = useLocalStorage('cockpit-employes', EMPLOYES_INITIAUX);
  const [showForm, setShowForm] = useState(false);
  const [employeSelectionne, setEmployeSelectionne] = useState<any>(null);
  const [estAdmin, setEstAdmin] = useState(false);
  const [roleUtilisateur, setRoleUtilisateur] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [authCharge, setAuthCharge] = useState(true);

useEffect(() => {
  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // On va chercher le rôle dans la base de données
      const docRef = doc(db, "utilisateurs", user.uid);
      // Note: si tu n'as pas encore la collection "utilisateurs", on fera une sécurité temporaire
      setEstAdmin(true); // On garde ça pour l'instant pour ne pas te bloquer
    } else {
      setEstAdmin(false);
    }
    setAuthCharge(false);
  });
  return () => unsubscribe();
}, []);

  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [produits, setProduits] = useState<any[]>([]);
  const [ventes, setVentes] = useState<any[]>([]);
  const [depenses, setDepenses] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "employees"), (snapshot) => {
      setEmployes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "produits"), (snapshot) => {
      setProduits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

    useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "ventes"), (snapshot) => {
      setVentes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "depenses"), (snapshot) => {
      setDepenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, emailLogin, passwordLogin);
      setEstAdmin(true); setShowLogin(false); setEmailLogin(''); setPasswordLogin('');
    } catch (error) { setLoginError("Email ou mot de passe incorrect."); }
  };

  const changerMotDePasse = async () => {
    const nouveau = prompt("Nouveau mot de passe Patron (min 4 caractères) :");
    if (!nouveau || nouveau.trim().length < 4) { alert("Mot de passe trop court (min 4 caractères)."); return; }
    const confirmation = prompt("Confirme le nouveau mot de passe :");
    if (nouveau.trim() !== confirmation) { alert("Les deux mots de passe ne correspondent pas."); return; }
    try {
      await setDoc(doc(db, "parametres", "admin"), { motDePasse: nouveau.trim() });
      alert("Mot de passe mis à jour avec succès !");
    } catch (error) { console.error(error); alert("Erreur lors de la mise à jour."); }
  };

  const presents = employes.filter((e: any) => e.presence >= 80).length;
  const retards = employes.filter((e: any) => e.ponctualite < 80 && e.ponctualite >= 60).length;
  const absents = employes.filter((e: any) => e.presence < 60).length;

  const ajouterEmploye = async (data: any) => {
    try {
      await addDoc(collection(db, "employees"), { ...data, presence: Number(data.presence || 80), ponctualite: Number(data.ponctualite || 80), productivite: Number(data.productivite || 80) });
    } catch (error) { console.error(error); }
  };
  const modifierEmploye = async (id: string, salaire: number, pin: string) => {
  try {
    await updateDoc(doc(db, "employees", id), { salaireBase: salaire, pin: pin });
    alert("✅ Informations mises à jour !");
  } catch (error) { console.error(error); }
};

  const supprimerEmploye = async (id: string) => {
    try { await deleteDoc(doc(db, "employees", id)); } catch (error) { console.error(error); }
  };

  const deconnexion = async () => {
  await signOut(getAuth());
};
if (authCharge) {
  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
      <p className="text-cyan-400 font-mono">Chargement…</p>
    </div>
  );
}

  if (showLogin) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">🔒 Accès Patron</h2>
            <p className="text-slate-400 text-sm">Entrez vos identifiants pour déverrouiller la Finance.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Adresse Email</label>
              <input type="email" value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500" placeholder="didier@exemple.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mot de passe</label>
              <input type="password" value={passwordLogin} onChange={(e) => setPasswordLogin(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500" placeholder="••••••••" required />
            </div>
            {loginError && (<p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded">{loginError}</p>)}
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors mt-4">Se connecter</button>
            <button type="button" onClick={() => setShowLogin(false)} className="w-full text-slate-400 hover:text-white text-sm mt-2">Annuler</button>
          </form>
        </div>
      </div>
    );
  }

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
          {!estAdmin && (<button onClick={() => setShowLogin(true)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-sm font-medium border border-slate-700">🔒 Mode Patron</button>)}
        
        </div>
      </div>

      {/* --- BARRE DE NAVIGATION --- */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-4">
        <button onClick={() => setOngletActif('pointage')} className={`px-4 py-2 rounded-lg font-bold text-sm ${ongletActif === 'pointage' ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>⏱️ Pointage & RH</button>
        <button onClick={() => setOngletActif('produits')} className={`px-4 py-2 rounded-lg font-bold text-sm ${ongletActif === 'produits' ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>📦 Produits</button>
        <button onClick={() => setOngletActif('ventes')} className={`px-4 py-2 rounded-lg font-bold text-sm ${ongletActif === 'ventes' ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>💰 Ventes</button>
        <button onClick={() => setOngletActif('finance')} className={`px-4 py-2 rounded-lg font-bold text-sm ${ongletActif === 'finance' ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>📊 Finance</button>
        <button onClick={() => setOngletActif('equipe')} className={`px-4 py-2 rounded-lg font-bold text-sm ${ongletActif === 'equipe' ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>👥 Équipe</button>
        <button onClick={() => setOngletActif('paie')} className={`px-4 py-2 rounded-lg font-bold text-sm ${ongletActif === 'paie' ? 'bg-cyan-500 text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>💵 Paie & Primes</button>
      </div>

      {/* --- ONGLETS --- */}
      {ongletActif === 'pointage' && (
        <div>
          <ModulePointage employes={employes} />
          <ModuleCalendrier employes={employes} />
         
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KpiCard icon={Users} title="Présents" value={`${presents}/${employes.length}`} subtitle="Employés actifs" color="bg-green-500/20 text-green-400" />
            <KpiCard icon={Clock} title="Retards" value={retards} subtitle="À surveiller" color="bg-orange-500/20 text-orange-400" />
            <KpiCard icon={AlertTriangle} title="Absents" value={absents} subtitle="Action urgente" color="bg-red-500/20 text-red-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">🏦 Trésorerie & Santé Financière</h2>
              <div className="space-y-3">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase mb-1">Trésorerie Banque</p>
                  <p className="text-xl font-bold text-green-400">{(ventes.reduce((acc, v) => acc + v.total, 0) - depenses.reduce((acc, d) => acc + Number(d.montant), 0)).toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase mb-1">Dettes Court Terme</p>
                  <p className="text-xl font-bold text-orange-400">0 FCFA</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 uppercase mb-1">Dettes Long Terme</p>
                  <p className="text-xl font-bold text-red-400">0 FCFA</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2"><TrendingUp size={16} /> Classement des employés</h2>
              <div className="space-y-3">
                {employes.slice().sort((a: any, b: any) => calculerMotivation(b) - calculerMotivation(a)).map((emp: any, idx: number) => {
                  const score = calculerMotivation(emp);
                  const c = getColor(score);
                  return (
                    <div key={emp.id} onClick={() => setEmployeSelectionne(emp)} className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 p-2 rounded transition">
                      <div className="w-6 text-slate-500 text-xs font-bold">#{idx + 1}</div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1"><span className="text-sm text-white">{emp.nom} <span className="text-slate-500 text-xs">— {emp.poste}</span></span><span className={`text-sm font-bold ${c.text}`}>{score}%</span></div>
                        <div className="w-full bg-slate-800 rounded-full h-2"><div className={`h-2 rounded-full ${c.bg}`} style={{ width: `${score}%`, transition: 'width 1s' }} /></div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${c.bg}/20 ${c.text}`}>{c.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2"><Zap size={16} className="text-yellow-400" /> Recommandations automatiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {employes.filter((e: any) => calculerMotivation(e) < 60).map((emp: any) => (
                <div key={emp.id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1"><AlertTriangle size={14} className="text-red-400" /><span className="text-red-400 text-sm font-bold">URGENT — {emp.nom}</span></div>
                  <p className="text-xs text-slate-400">Score {calculerMotivation(emp)}%. Action : entretien individuel + plan de motivation 30 jours.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {ongletActif === 'finance' && estAdmin && (
        <div>
          <ModuleTachesFinance />
          <ModuleGraphiques ventes={ventes} depenses={depenses} />
          <ModuleFinance ventes={ventes} depenses={depenses} />
        </div>
      )}

      {ongletActif === 'ventes' && (
        <ModuleVentes produits={produits} ventes={ventes} />
      )}

      {ongletActif === 'produits' && (
        <ModuleProduits produits={produits} estAdmin={estAdmin} />
      )}

      {ongletActif === 'equipe' && (
        <ModuleEquipe employes={employes} ajouterEmploye={ajouterEmploye} supprimerEmploye={supprimerEmploye} modifierEmploye={modifierEmploye} />
      )}

      {ongletActif === 'paie' && (
        <ModulePaie employes={employes} />
      )}

      {showForm && <FormulaireEmploye onAjouter={ajouterEmploye} onFermer={() => setShowForm(false)} />}
      {employeSelectionne && (
        <FicheEmploye employe={employeSelectionne} onFermer={() => setEmployeSelectionne(null)} onSupprimer={supprimerEmploye} />
      )}
    </div>
  );
}
