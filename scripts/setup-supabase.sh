#!/bin/bash
echo '🚀 Configuration des tables Supabase pour GreenOps AI...'

# Vérifier les variables d'environnement
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo '❌ Variables d'\''environnement Supabase manquantes'
  echo 'Assurez-vous que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies dans .env.local'
  exit 1
fi

echo '📄 Exécution du schéma FinOps...'
echo 'Vous pouvez copier-coller le contenu de database/gcp-finops-schema.sql dans l'\''éditeur SQL de Supabase'
echo 'Ou utiliser la CLI Supabase si elle est installée'

echo '✅ Instructions:'
echo '1. Ouvrez https://supabase.com/dashboard/project/[votre-projet]/sql'
echo '2. Copiez le contenu de database/gcp-finops-schema.sql'
echo '3. Collez et exécutez le script'
echo '4. Vérifiez que les tables sont créées dans l'\''onglet Table Editor'

echo '🎉 Une fois terminé, vous pourrez synchroniser vos données GCP !'

