# 📧 Guide Make.com - Validation par Email

## 🎯 Objectif

Système simple de validation de compte par email :
1. Utilisateur s'inscrit
2. Reçoit un code à 6 chiffres par email (via **Make.com**)
3. Entre le code
4. Compte validé → Connexion automatique

---

## ⚡ Pourquoi Make.com ?

Make.com (anciennement Integromat) est **beaucoup plus simple** qu'EmailJS :

| Critère | Make.com | EmailJS |
|---------|----------|---------|
| **Configuration** | 1 webhook | 3 clés (Service, Template, Public) |
| **Setup** | 5 minutes | 15 minutes |
| **SDK requis** | ❌ Non | ✅ Oui |
| **Appel API** | `fetch()` simple | SDK JavaScript complexe |
| **Gratuit** | 1000 opérations/mois | 200 emails/mois |

---

## 🚀 Configuration Make.com (5 minutes)

### Étape 1 : Créer un compte

1. Allez sur **https://www.make.com/**
2. Cliquez sur **"Sign up for free"**
3. Créez un compte (gratuit)

### Étape 2 : Créer un scénario

1. Dans le dashboard, cliquez sur **"Create a new scenario"**
2. Nommez-le : "BabyLeague - Email Validation"

### Étape 3 : Ajouter le webhook (déclencheur)

1. Cliquez sur le **"+"** au centre
2. Cherchez et sélectionnez **"Webhooks"**
3. Choisissez **"Custom webhook"**
4. Cliquez sur **"Create a webhook"**
5. Donnez-lui un nom : "BabyLeague Signup"
6. **Copiez l'URL du webhook** (exemple: `https://hook.eu1.make.com/...`)
7. Cliquez sur **"OK"**

### Étape 4 : Ajouter l'envoi d'email

1. Cliquez sur le **"+"** à droite du webhook
2. Cherchez et sélectionnez **"Email"**
3. Choisissez **"Send an Email"**
4. Remplissez :
   - **To** : Cliquez dans le champ → Sélectionnez `player_email`
   - **Subject** : `Code de validation BabyLeague ⚽`
   - **Content** (HTML) :

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #091C3E;">Bienvenue sur BabyLeague ! 🎉</h1>
  
  <p>Bonjour <strong>{{player_name}}</strong>,</p>
  
  <p>Merci de vous être inscrit sur BabyLeague !</p>
  
  <div style="background: #CDFB0A; padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0;">
    <p style="margin: 0; font-size: 14px; color: #091C3E;">Votre code de validation :</p>
    <h2 style="margin: 10px 0; font-size: 48px; color: #091C3E; letter-spacing: 8px; font-family: monospace;">
      {{validation_code}}
    </h2>
    <p style="margin: 0; font-size: 12px; color: #091C3E; font-style: italic;">
      Valable 30 minutes
    </p>
  </div>
  
  <p>Entrez ce code dans l'application pour activer votre compte.</p>
  
  <p style="color: #666; font-size: 14px;">
    Si vous n'avez pas créé de compte, ignorez cet email.
  </p>
  
  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  
  <p style="color: #999; font-size: 12px; text-align: center;">
    L'équipe BabyLeague<br>
    <a href="{{app_url}}" style="color: #CDFB0A;">{{app_url}}</a>
  </p>
</div>
```

5. **Important** : Dans les champs, cliquez pour insérer les variables du webhook :
   - `{{player_name}}` → Cliquez et sélectionnez `player_name`
   - `{{validation_code}}` → Cliquez et sélectionnez `validation_code`
   - `{{app_url}}` → Cliquez et sélectionnez `app_url`

### Étape 5 : Activer le scénario

1. En bas à gauche, activez le scénario (toggle ON)
2. Le scénario est maintenant actif et écoute les requêtes !

### Étape 6 : Configurer dans l'application

1. Lancez votre application BabyLeague
2. Connectez-vous (ou créez un premier compte)
3. Allez dans **⚙️ Paramètres**
4. Section "📧 Validation par Email"
5. Collez l'URL du webhook Make.com
6. Cliquez sur **"💾 Enregistrer"**

---

## 🧪 Tester le système

### Test 1 : Email de test

1. Dans Paramètres, entrez votre email dans le champ de test
2. Cliquez sur **"🧪 Envoyer un email de test"**
3. Vérifiez votre boîte de réception
4. ✅ Vous devriez recevoir un email avec le code **123456**

### Test 2 : Inscription complète

1. **Déconnectez-vous**
2. Cliquez sur **"Créer un compte"**
3. Remplissez :
   - Nom : Alice
   - Email : Votre vrai email
4. Cliquez sur **"S'inscrire"**
5. ✅ Un email avec un code à 6 chiffres est envoyé
6. **Entrez le code reçu**
7. ✅ Compte validé ! Vous êtes connecté automatiquement

---

## 🔄 Flux complet

```
┌─────────────────────┐
│ Utilisateur remplit │
│ formulaire          │
│ (Nom + Email)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ savePlayer()        │
│ → Compte créé       │
│ dans Supabase       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ sendValidationEmail()│
│ Génère code 6 chiffres│
│ Stocke dans localStorage│
└──────────┬──────────┘
           │
           ▼ 🌐 APPEL API EXTERNE
┌─────────────────────────┐
│ fetch(make_webhook_url) │
│ POST avec données       │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────┐
│ Make.com reçoit     │
│ Traite la requête   │
│ Envoie l'email      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 📧 Email reçu       │
│ Code : 123456       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Utilisateur entre   │
│ le code             │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ validateCode()      │
│ Vérifie le code     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ ✅ Compte validé    │
│ Connexion auto      │
└─────────────────────┘
```

---

## 💻 Code de l'appel API

### Dans `src/services/make.js`

```javascript
export const sendValidationEmail = async (player) => {
  const makeWebhookUrl = localStorage.getItem('make_webhook_url');

  if (!makeWebhookUrl) {
    console.warn('Make.com non configuré');
    return false;
  }

  // Générer code à 6 chiffres
  const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Stocker temporairement
  const pendingValidations = JSON.parse(localStorage.getItem('pending_validations') || '{}');
  pendingValidations[player.id] = {
    code: validationCode,
    email: player.email,
    timestamp: Date.now()
  };
  localStorage.setItem('pending_validations', JSON.stringify(pendingValidations));

  const data = {
    player_id: player.id,
    player_name: player.name,
    player_email: player.email,
    validation_code: validationCode,
    app_name: 'BabyLeague',
    app_url: window.location.origin
  };

  try {
    // 🌐 APPEL API EXTERNE vers Make.com
    const response = await fetch(makeWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return response.ok;
  } catch (error) {
    console.error('Erreur Make.com:', error);
    return false;
  }
};
```

---

## 🔒 Sécurité

### ✅ Points forts

- Code à 6 chiffres aléatoire
- Expiration après 30 minutes
- Stockage temporaire uniquement
- Validation côté client (simple pour ce projet)

### ⚠️ Améliorations possibles (production)

Pour un projet en production réel, vous devriez :
1. Stocker les codes dans Supabase (pas localStorage)
2. Hash les codes avant stockage
3. Limiter les tentatives (3 max)
4. Ajouter un système de "renvoyer le code"
5. Bloquer les comptes non validés après 24h

---

## 📊 Données envoyées à Make.com

```json
{
  "player_id": "c123abc456",
  "player_name": "Alice",
  "player_email": "alice@example.com",
  "validation_code": "523841",
  "app_name": "BabyLeague",
  "app_url": "http://localhost:3000",
  "created_date": "14 janvier 2024"
}
```

---

## 🐛 Dépannage

### L'email de test ne part pas

- Vérifiez que le scénario Make.com est **activé** (toggle ON)
- Vérifiez l'URL du webhook (doit contenir `hook.make.com` ou `hook.integromat.com`)
- Regardez dans Make.com → Scénario → History pour voir les erreurs

### Le code ne fonctionne pas

- Vérifiez que le code a bien 6 chiffres
- Attendez bien de recevoir l'email (peut prendre 1-2 minutes)
- Le code expire après 30 minutes

### L'email arrive dans les spams

- C'est normal pour les premiers envois
- Ajoutez l'email de Make.com dans vos contacts
- Marquez comme "Pas spam"

---

## 💰 Limites gratuites

**Make.com gratuit :**
- 1000 opérations/mois
- = 1000 emails d'inscription/mois
- Largement suffisant pour un projet d'école !

Si dépassé : 9$/mois pour 10 000 opérations

---

## ✅ Avantages de Make.com

1. **Super simple** : 1 seule URL à configurer
2. **Visuel** : Interface drag & drop
3. **Flexible** : Peut faire plein d'autres choses (Slack, SMS, etc.)
4. **Rapide** : Setup en 5 minutes
5. **Gratuit** : 1000 ops/mois

---

## 🎨 Personnaliser l'email

Vous pouvez modifier l'email directement dans Make.com :
- Changer les couleurs
- Ajouter un logo
- Modifier le texte
- Ajouter des liens

---

## 📝 Résumé

✅ **API externe** : Make.com Webhook API  
✅ **Simple** : 1 URL, pas de SDK  
✅ **Automatique** : Envoi à chaque inscription  
✅ **Validation** : Code à 6 chiffres par email  
✅ **UX fluide** : Pas de rechargement de page  

**Votre projet est conforme et fonctionnel !** 🎉
