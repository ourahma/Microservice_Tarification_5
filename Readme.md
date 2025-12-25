# Service de Tarification - UMI Transport de marchandises.

## 📋 Table des matières
- [Aperçu](#aperçu)
- [API Endpoints](#api-endpoints)
- [Statuts de Tarification](#statuts-de-tarification)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Exemples de requêtes](#exemples-de-requêtes)
- [Sécurité](#sécurité)

## 🚀 Aperçu

Le service de tarification est un microservice Spring Boot qui permet de calculer, gérer et suivre les tarifs pour les demandes de transport. Il intègre les informations de demande, d'itinéraire et applique des règles métier pour déterminer les prix pour les clients et prestataires.

### 🏗️ Architecture
- **Framework** : Spring Boot 3.2.x
- **Base de données** : MySQL
- **Documentation API** : OpenAPI 3.0 / Swagger
- **Communication** : WebClient pour appel d'autres microservices
- **Sécurité** : JWT Authentication

## 🌐 Accès au service

### Serveurs disponibles

| Environnement | URL | Description |
|--------------|-----|-------------|
| Local | `http://localhost:8081/api` | Développement local |
| Serveur | `http://172.30.80.11:31022/api` | Serveur de production (remplacez VOTRE_IP) |

### Documentation API
- **Swagger UI** : `http://172.30.80.11:31022/swagger`
- **OpenAPI JSON** : `http://172.30.80.11:31022/`

## 📊 API Endpoints

### 1. Gestion des Demandes avec Itinéraires

| Endpoint | Méthode | Description | Authentification requise |
|----------|---------|-------------|---------------------------|
| `/tarification/demandes/avec-itineraire` | GET | Récupère toutes les demandes avec leurs itinéraires | ✅ |
| `/tarification/demandes/calculer-tarif` | POST | Calcule et enregistre un tarif pour une demande | ✅ |
| `/tarification/demandes/{demandeId}/tarifications` | GET | Récupère les tarifications d'une demande spécifique | ✅ |
| `/tarification/demandes/tarification/{id}` | GET | Récupère une tarification par son ID | ✅ |

### 2. Gestion des Tarifications

| Endpoint | Méthode | Description | Authentification requise |
|----------|---------|-------------|---------------------------|
| `/tarification/calculer` | POST | Calcule une tarification | ✅ |
| `/tarification/{id}` | GET | Récupère une tarification par son ID | ✅ |
| `/tarification/{id}/valider` | PUT | Valide une tarification | ✅ |
| `/tarification/{id}/paiement` | POST | Effectue le paiement d'une tarification validée | ✅ |

## 🔄 Statuts de Tarification

### Diagramme des transitions d'état

```
EN_ATTENTE
    ↓ (validation client)
VALIDE
    ↓ (paiement)
PAYE
    ↓ (expiration 7 jours)
EXPIRE
    ↓ (rejet client)
REJETE
    ↓ (annulation)
ANNULEE
```

### Table des statuts

| Statut | Description | Actions possibles |
|--------|-------------|-------------------|
| **EN_ATTENTE** | Tarification créée, en attente de validation | → VALIDER, → REJETER, → ANNULER |
| **VALIDE** | Tarification validée par le client | → PAYER |
| **PAYE** | Tarification payée | Aucune |
| **EXPIRE** | Tarification expirée (7 jours) | → RECALCULER |
| **REJETE** | Tarification rejetée par le client | → RECALCULER |
| **ANNULEE** | Tarification annulée | → RECALCULER |

## ⚙️ Installation

### Prérequis
- Java 17 ou supérieur
- MySQL
- Maven 3.8+

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone  https://github.com/ourahma/Microservice_Tarification_5.git
cd Microservice_Tarification_5
```

2. **Configurer la base de données**
```sql
CREATE DATABASE tarification_db;
CREATE USER user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE tarification_db TO user;
```


3. **Compiler et exécuter**
```bash
mvn clean install
mvn spring-boot:run
```

## ⚙️ Configuration

### Fichier `application.properties`
```properties
# Server
server.port=8081
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/tarification_db
spring.datasource.username=tarification_user
spring.datasource.password=votre_mot_de_passe

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

# JWT Configuration
jwt.secret=votre_secret_jwt
jwt.expiration=86400000

# Logging
logging.level.net.umi.tarification_itn=DEBUG
```

### Variables d'environnement importantes

| Variable | Description            | Valeur par défaut           |
|----------|------------------------|-----------------------------|
| `DB_HOST` | Hôte MySQL             | `localhost`                 |
| `DB_PORT` | Port MySQL             | `3306`                      |
| `DB_NAME` | Nom de la base         | `tarification_db`           |
| `JWT_SECRET` | Secret pour JWT        | -                           |
| `DEMANDE_SERVICE_URL` | URL du service demande | `http://localhost:8082/api` |

## 🛠️ Utilisation

### 1. Calcul d'une tarification

**Requête :**
```bash
curl -X POST "http://172.30.80.11:31022/api/tarification/demandes/calculer-tarif" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "demandeId": 123,
    "itineraireId": "abc-123-def",
    "typeRoute": "ROUTE_NATIONALE",
    "inclureRetour": true
  }'
```

**Réponse réussie (201 Created) :**
```json
{
  "id": 1,
  "demandeId": 123,
  "itineraireId": "abc-123-def",
  "clientId": 456,
  "chauffeurId": "chauffeur-789",
  "volume": 10.5,
  "poids": 250.0,
  "distanceKm": 150.75,
  "natureMarchandise": "Électronique",
  "fragile": true,
  "temperatureRequise": "ambiante",
  "tarifClient": 1250.50,
  "tarifPrestataire": 950.25,
  "margeService": 300.25,
  "statut": "EN_ATTENTE",
  "typeRoute": "ROUTE_NATIONALE",
  "inclureRetour": true,
  "dateCreation": "2024-01-15T10:30:00",
  "dateExpiration": "2024-01-22T10:30:00",
  "dateValidation": null
}
```

### 2. Validation d'une tarification

**Requête :**
```bash
curl -X PUT "http://172.30.80.11:31022/api/tarification/tarif-123/valider" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### 3. Paiement d'une tarification

**Conditions préalables :**
- La tarification doit être au statut `VALIDE`
- Elle ne doit pas être expirée
- Elle ne doit pas être déjà payée

**Requête :**
```bash
curl -X POST "http://172.30.80.11:31022/api/tarification/tarif-123/paiement" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

**Erreurs possibles :**
- `400` : Tarification non validée ou expirée
- `409` : Tarification déjà payée
- `404` : Tarification non trouvée

## 📋 Exemples de requêtes

### Exemple 1 : Récupérer toutes les demandes avec itinéraires
```bash
curl -X GET "http://172.30.80.11:31022/api/tarification/demandes/avec-itineraire" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Exemple 2 : Récupérer les tarifications d'une demande
```bash
curl -X GET "http://172.30.80.11:31022/api/tarification/demandes/123/tarifications" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Exemple 3 : Valider une tarification
```bash
curl -X PUT "http://172.30.80.11:31022/api/tarification/tarif-123/valider" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

### Exemple 4 : Payer une tarification
```bash
curl -X POST "http://172.30.80.11:31022/api/tarification/tarif-123/paiement" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

## 🔒 Sécurité

### Authentification
Toutes les requêtes (sauf `/actuator/health`) nécessitent un token JWT dans le header :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

<!-- ### Rôles autorisés
| Endpoint | Rôles autorisés |
|----------|-----------------|
| Tous les endpoints | ADMIN, PRESTATAIRE, CLIENT |-->

### Sécurité des données
- Validation JWT pour toutes les requêtes
- Vérification des permissions par endpoint
- Logging d'audit pour toutes les opérations
- Expiration automatique des tarifications (7 jours)

### Logs
Les logs sont disponibles dans :
- Console d'exécution
- Fichier `logs/tarification-service.log` (si configuré)
- Endpoint Actuator : `http://172.30.80.11:31022/api/actuator/loggers`

## 📈 Monitoring

### Endpoints Actuator
| Endpoint | Description |
|----------|-------------|
| `/actuator/health` | Santé de l'application |
| `/actuator/info` | Informations sur l'application |
| `/actuator/metrics` | Métriques de l'application |
| `/actuator/loggers` | Gestion des logs |