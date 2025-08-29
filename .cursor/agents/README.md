# GreenOps AI Agents

Collection d'agents IA spécialisés pour accélérer le développement et l'optimisation de la plateforme GreenOps AI Dashboard. Chaque agent est un expert dans son domaine, prêt à être utilisé pour des tâches spécifiques de FinOps et GreenOps.

## 🎯 Vue d'ensemble

Ces agents sont inspirés du repository [Contains Studio Agents](https://github.com/contains-studio/agents) et adaptés spécifiquement pour les besoins de GreenOps AI - une plateforme de gestion des coûts cloud et de suivi de l'empreinte carbone.

## 📁 Structure des Agents

```
.cursor/agents/
├── engineering/
│   ├── rapid-prototyper.md      # Développement rapide de fonctionnalités FinOps
│   └── backend-architect.md     # Architecture backend pour systèmes multi-cloud
├── analytics/
│   └── analytics-reporter.md    # Analyse des coûts cloud et empreinte carbone
├── finops/
│   └── finops-optimizer.md      # Optimisation des coûts et gouvernance financière
├── greenops/
│   └── carbon-tracker.md        # Suivi et optimisation de l'empreinte carbone
├── design/
│   └── ui-designer.md           # Design d'interfaces pour dashboards FinOps
└── README.md                    # Ce fichier
```

## 🚀 Agents Disponibles

### **Engineering** (`engineering/`)

#### **rapid-prototyper**
- **Utilisation** : Développement rapide de fonctionnalités FinOps/GreenOps
- **Spécialités** : Next.js 15, ShadCN/UI, intégration APIs cloud, visualisations Recharts
- **Exemples** : Widgets de monitoring des coûts, calculateurs d'empreinte carbone, systèmes d'alertes budgétaires

#### **backend-architect**
- **Utilisation** : Architecture backend pour gestion des coûts multi-cloud
- **Spécialités** : APIs RESTful, intégration multi-cloud, bases de données time-series, microservices
- **Exemples** : Agrégation de données AWS/GCP/Azure, moteurs de calcul carbone, systèmes d'alertes temps réel

### **Analytics** (`analytics/`)

#### **analytics-reporter**
- **Utilisation** : Analyse et reporting des données de coûts et d'empreinte carbone
- **Spécialités** : Analyse de tendances, détection d'anomalies, KPIs FinOps, reporting ESG
- **Exemples** : Rapports mensuels de coûts, analyses ROI, tableaux de bord exécutifs, recommandations d'optimisation

### **FinOps** (`finops/`)

#### **finops-optimizer**
- **Utilisation** : Optimisation des coûts cloud et gouvernance financière
- **Spécialités** : Rightsizing, Reserved Instances, allocation des coûts, budgets, chargeback
- **Exemples** : Analyses de rightsizing EC2, stratégies RI/Savings Plans, politiques de gouvernance

### **GreenOps** (`greenops/`)

#### **carbon-tracker**
- **Utilisation** : Suivi et optimisation de l'empreinte carbone cloud
- **Spécialités** : Calcul d'émissions carbone, optimisation énergétique, reporting ESG, offsets carbone
- **Exemples** : Calculs d'empreinte carbone par service, migration vers régions renouvelables, reporting durabilité

### **Design** (`design/`)

*Aucun agent design actuellement disponible*

## 🎨 Philosophie de Design

### **Couleurs des Agents**
- **Engineering** : `emerald`, `purple` - Développement et architecture
- **Analytics** : `blue` - Analyse et insights
- **FinOps** : `gold` - Optimisation financière
- **GreenOps** : `green` - Durabilité et environnement

### **Outils Disponibles**
- **Write** : Création et modification de fichiers
- **Read** : Lecture de fichiers existants
- **MultiEdit** : Éditions multiples en une opération
- **Bash** : Commandes terminal pour développement

## 🔧 Utilisation des Agents

### **Déclenchement Automatique**
Les agents se déclenchent automatiquement selon le contexte :
- **rapid-prototyper** : Lors de demandes de nouvelles fonctionnalités FinOps
- **analytics-reporter** : Pour l'analyse de données de coûts ou d'empreinte carbone
- **finops-optimizer** : Pour l'optimisation des coûts et la gouvernance
- **carbon-tracker** : Pour le suivi environnemental et la durabilité

### **Invocation Explicite**
Vous pouvez aussi mentionner un agent spécifiquement :
- "Utilise **rapid-prototyper** pour créer un widget de coûts AWS"
- "Demande à **carbon-tracker** d'analyser notre empreinte carbone GCP"
- "**finops-optimizer** peut-il analyser nos Reserved Instances ?"

## 💡 Exemples d'Usage

### **Développement de Fonctionnalités**
```
"Crée un composant de monitoring des coûts Azure en temps réel"
→ rapid-prototyper
```

### **Analyse de Données**
```
"Analyse nos coûts AWS du dernier trimestre et identifie les optimisations"
→ analytics-reporter + finops-optimizer
```

### **Suivi Environnemental**
```
"Calcule notre empreinte carbone et suggère des améliorations"
→ carbon-tracker
```

### **Architecture Backend**
```
"Crée une API pour agréger les coûts multi-cloud"
→ backend-architect
```

## 🎯 Contexte GreenOps AI

### **Stack Technique**
- **Framework** : Next.js 15 avec App Router
- **UI** : ShadCN/UI + Tailwind CSS
- **Charts** : Recharts pour visualisations
- **Base de données** : Supabase/PostgreSQL
- **Auth** : NextAuth.js + Supabase Auth
- **APIs Cloud** : AWS, GCP, Azure

### **Fonctionnalités Cibles**
- **FinOps** : Gestion coûts, budgets, alertes, optimisation
- **GreenOps** : Empreinte carbone, durabilité, ESG reporting
- **Multi-cloud** : Support AWS, GCP, Azure
- **Temps réel** : Monitoring live des coûts et usage
- **Mobile** : Interfaces responsives pour tous devices

## 🔄 Workflow de Développement

1. **Identification du besoin** → Sélection de l'agent approprié
2. **Analyse du contexte** → L'agent comprend les exigences spécifiques
3. **Développement** → Implémentation rapide avec patterns existants
4. **Intégration** → Respect de l'architecture GreenOps AI
5. **Test** → Validation avec données réelles et mock
6. **Documentation** → Mise à jour de la documentation technique

## 📊 Métriques de Performance

### **Objectifs des Agents**
- **Vitesse** : Réduction du temps de développement de 70%
- **Qualité** : Code conforme aux standards du projet
- **Consistance** : Respect des patterns UI/UX établis
- **Fonctionnalité** : Features immédiatement utilisables
- **Maintenance** : Code facilement maintenable et extensible

### **Mesures de Succès**
- Temps de développement des features FinOps
- Qualité du code (linting, tests, types)
- Satisfaction utilisateur sur les interfaces
- Performance des optimisations de coûts
- Précision des calculs d'empreinte carbone

## 🚦 Best Practices

### **Pour les Développeurs**
1. **Décrivez clairement** vos besoins pour un meilleur matching d'agent
2. **Spécifiez le contexte** (provider cloud, type de données, audience)
3. **Mentionnez les contraintes** (performance, sécurité, compliance)
4. **Testez immédiatement** les solutions proposées
5. **Documentez** les patterns réutilisables

### **Pour les Agents**
1. **Respecter** l'architecture existante du projet
2. **Utiliser** les composants ShadCN disponibles
3. **Maintenir** la cohérence visuelle GreenOps AI
4. **Optimiser** pour les performances et l'accessibilité
5. **Documenter** les choix techniques et patterns

---

**Note** : Ces agents sont spécifiquement adaptés pour GreenOps AI Dashboard et optimisés pour le développement FinOps/GreenOps avec Next.js 15 et ShadCN/UI.
