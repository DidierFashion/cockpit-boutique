# 🚗 Cockpit Boutique

> Application de gestion de boutique inspirée des tableaux de bord automobiles.

## 📋 Description

Cockpit Boutique est un système de gestion interne pour petites et moyennes boutiques. Cette application permet de **planifier**, **organiser**, **diriger** et **contrôler** toutes les activités de la boutique.

## ✨ Fonctionnalités (Module 3 — RH)

### 👥 Gestion des employés
- Ajout d'employés avec nom, poste et scores
- Fiche employé détaillée (au clic)
- Suppression d'employés

### 🎯 Système de motivation
- Calcul automatique du score de motivation en %
- Pondération : 30% présence + 25% ponctualité + 45% productivité
- Code couleur : 🟢 Vert (≥80%) / 🟠 Orange (60-79%) / 🔴 Rouge (<60%)

### 🕐 Module de pointage
- Check-in / Check-out en temps réel
- Détection automatique des retards
- Historique du jour

### 📅 Calendrier de planification
- Vue hebdomadaire (7 jours)
- 3 shifts : Matin / Après-midi / Nuit
- Assignation par jour et par shift

### 📊 Tableau de bord
- 3 cartes KPI (Présents / Retards / Absents)
- Jauge de motivation globale
- Classement automatique
- Recommandations automatiques

## 🛠️ Technologies

- **React** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** v4
- **Lucide React** (icônes)
- **Git** + **GitHub**

## 🚀 Installation

```bash
git clone https://github.com/DidierFashion/cockpit-boutique.git
cd cockpit-boutique
npm install
npm run dev