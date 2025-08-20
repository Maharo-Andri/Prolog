"use client";
import { useState } from 'react';
import Head from 'next/head';
import './style.css';

// Fonctions d'analyse des réponses Prolog
function analyzeGuiltResponse(jsonResponse: any, suspect: string, crimeType: string): string {
  try {
    const outerResult = JSON.parse(jsonResponse.result);
    const isGuilty = outerResult.result === "true" || outerResult.result === true;
    const success = outerResult.success === "true" || outerResult.success === true;

    if (!success) {
      return `❌ Erreur lors de la vérification de la culpabilité de ${suspect} pour le crime de ${crimeType}.`;
    }

    if (isGuilty) {
      return `✅ ${suspect.charAt(0).toUpperCase() + suspect.slice(1)} est COUPABLE du crime de ${crimeType}.`;
    } else {
      return `❌ ${suspect.charAt(0).toUpperCase() + suspect.slice(1)} n'est PAS COUPABLE du crime de ${crimeType}.`;
    }
  } catch (error: any) {
    return `❌ Erreur lors de l'analyse de la réponse : ${error.message}`;
  }
}

function analyzeExplanationResponse(jsonResponse: any, suspect: string, crimeType: string): string {
  try {
    const outerResult = JSON.parse(jsonResponse.result);
    const success = outerResult.success === "true" || outerResult.success === true;

    if (!success) {
      return `❌ Aucune explication trouvée pour ${suspect} concernant le crime de ${crimeType}.`;
    }

    const evidence = outerResult.result?.evidence || [];
    
    if (!evidence || evidence.length === 0) {
      return `ℹ️ Aucune preuve trouvée contre ${suspect} pour le crime de ${crimeType}.`;
    }

    const evidenceTranslations: { [key: string]: string } = {
      'motive': 'mobile établi',
      'near_scene': 'présence sur la scène de crime',
      'fingerprint_wpn': 'empreintes digitales sur l\'arme',
      'bank_txn': 'transaction bancaire suspecte',
      'fake_identity': 'utilisation de fausse identité',
      'eyewitness': 'témoignage oculaire fiable',
      'no_innocence': 'absence d\'alibi valide',
      'no_false_positive': 'absence de faux positif'
    };

    const translatedEvidence = evidence.map((e: string) => evidenceTranslations[e] || e);
    const suspectCapitalized = suspect.charAt(0).toUpperCase() + suspect.slice(1);
    
    return `🔍 Preuves contre ${suspectCapitalized} pour le crime de ${crimeType} :\n• ${translatedEvidence.join('\n• ')}`;
    
  } catch (error: any) {
    return `❌ Erreur lors de l'analyse de l'explication : ${error.message}`;
  }
}

function analyzeAllGuiltyResponse(jsonResponse: any, crimeType: string): string {
  try {
    const outerResult = JSON.parse(jsonResponse.result);
    const success = outerResult.success === "true" || outerResult.success === true;

    if (!success) {
      return `❌ Erreur lors de la recherche des coupables pour le crime de ${crimeType}.`;
    }

    const suspects = outerResult.result?.suspects || [];
    
    if (!suspects || suspects.length === 0) {
      return `ℹ️ Aucun suspect n'est jugé coupable du crime de ${crimeType}.`;
    }

    const capitalizedSuspects = suspects.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1));
    
    if (suspects.length === 1) {
      return `👤 Un seul suspect est coupable du crime de ${crimeType} : ${capitalizedSuspects[0]}.`;
    } else {
      const lastSuspect = capitalizedSuspects.pop();
      return `👥 ${suspects.length} suspects sont coupables du crime de ${crimeType} : ${capitalizedSuspects.join(', ')} et ${lastSuspect}.`;
    }
    
  } catch (error: any) {
    return `❌ Erreur lors de l'analyse de la liste des coupables : ${error.message}`;
  }
}

export default function EnquetePoliciere() {
  const [activeTab, setActiveTab] = useState('culpabilite');
  const [suspect, setSuspect] = useState('john');
  const [crimeType, setCrimeType] = useState('vol');
  const [result, setResult] = useState<any>(null);
  const [formattedResult, setFormattedResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkCulpabilite = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/prolog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `is_guilty(${suspect}, ${crimeType})`
        }),
      });
      const data = await response.json();
      setResult(data);
      
      // Analyser et formater la réponse
      const formatted = analyzeGuiltResponse(data, suspect, crimeType);
      setFormattedResult(formatted);
    } catch (error: any) {
      const errorMsg = "❌ Erreur de connexion avec le serveur Prolog";
      setResult({ error: errorMsg });
      setFormattedResult(errorMsg);
    }
    setLoading(false);
  };

  const explainCulpabilite = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/prolog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `explain_guilt(${suspect}, ${crimeType}, Evidence)`
        }),
      });
      const data = await response.json();
      setResult(data);
      
      // Analyser et formater la réponse
      const formatted = analyzeExplanationResponse(data, suspect, crimeType);
      setFormattedResult(formatted);
    } catch (error: any) {
      const errorMsg = "❌ Erreur de connexion avec le serveur Prolog";
      setResult({ error: errorMsg });
      setFormattedResult(errorMsg);
    }
    setLoading(false);
  };

  const findAllGuilty = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/prolog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `find_all_guilty(${crimeType}, Suspects)`
        }),
      });
      const data = await response.json();
      setResult(data);
      
      // Analyser et formater la réponse
      const formatted = analyzeAllGuiltyResponse(data, crimeType);
      setFormattedResult(formatted);
    } catch (error: any) {
      const errorMsg = "❌ Erreur de connexion avec le serveur Prolog";
      setResult({ error: errorMsg });
      setFormattedResult(errorMsg);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <Head>
        <title>Enquête Policière - Système Expert</title>
        <meta name="description" content="Interface d'enquête policière avec Prolog" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="header">
        <h1>🔍 Système Expert: Enquête Policière</h1>
        <p>Interface d'interrogation de la base de connaissances Prolog</p>
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'culpabilite' ? 'active' : ''} 
          onClick={() => setActiveTab('culpabilite')}
        >
          Vérifier la culpabilité
        </button>
        <button 
          className={activeTab === 'explication' ? 'active' : ''} 
          onClick={() => setActiveTab('explication')}
        >
          Obtenir une explication
        </button>
        <button 
          className={activeTab === 'liste' ? 'active' : ''} 
          onClick={() => setActiveTab('liste')}
        >
          Lister tous les coupables
        </button>
      </nav>

      <main className="main">
        {activeTab === 'culpabilite' && (
          <div className="tab-content">
            <h2>Vérifier la culpabilité d'un suspect</h2>
            <div className="form-group">
              <label htmlFor="suspect">Suspect:</label>
              <select 
                id="suspect" 
                value={suspect} 
                onChange={(e) => setSuspect(e.target.value)}
              >
                <option value="john">John</option>
                <option value="mary">Mary</option>
                <option value="alice">Alice</option>
                <option value="bruno">Bruno</option>
                <option value="sophie">Sophie</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="crimeType">Type de crime:</label>
              <select 
                id="crimeType" 
                value={crimeType} 
                onChange={(e) => setCrimeType(e.target.value)}
              >
                <option value="vol">Vol</option>
                <option value="assassinat">Assassinat</option>
                <option value="escroquerie">Escroquerie</option>
              </select>
            </div>
            <button style={{color: "white"}} onClick={checkCulpabilite} disabled={loading}>
              {loading ? 'Requête en cours...' : 'Vérifier la culpabilité'}
            </button>
          </div>
        )}

        {activeTab === 'explication' && (
          <div className="tab-content">
            <h2>Obtenir une explication détaillée</h2>
            <div className="form-group">
              <label htmlFor="suspect2">Suspect:</label>
              <select 
                id="suspect2" 
                value={suspect} 
                onChange={(e) => setSuspect(e.target.value)}
              >
                <option value="john">John</option>
                <option value="mary">Mary</option>
                <option value="alice">Alice</option>
                <option value="bruno">Bruno</option>
                <option value="sophie">Sophie</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="crimeType2">Type de crime:</label>
              <select 
                id="crimeType2" 
                value={crimeType} 
                onChange={(e) => setCrimeType(e.target.value)}
              >
                <option value="vol">Vol</option>
                <option value="assassinat">Assassinat</option>
                <option value="escroquerie">Escroquerie</option>
              </select>
            </div>
            <button onClick={explainCulpabilite} disabled={loading}>
              {loading ? 'Requête en cours...' : 'Obtenir une explication'}
            </button>
          </div>
        )}

        {activeTab === 'liste' && (
          <div className="tab-content">
            <h2>Lister tous les coupables pour un type de crime</h2>
            <div className="form-group">
              <label htmlFor="crimeType3">Type de crime:</label>
              <select 
                id="crimeType3" 
                value={crimeType} 
                onChange={(e) => setCrimeType(e.target.value)}
              >
                <option value="vol">Vol</option>
                <option value="assassinat">Assassinat</option>
                <option value="escroquerie">Escroquerie</option>
              </select>
            </div>
            <button onClick={findAllGuilty} disabled={loading}>
              {loading ? 'Requête en cours...' : 'Lister les coupables'}
            </button>
          </div>
        )}

        <div className="results">
          <h2>Résultats</h2>
          {loading ? (
            <p>Chargement...</p>
          ) : formattedResult ? (
            <div className="formatted-result">
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #e9ecef', 
                borderRadius: '8px', 
                padding: '15px', 
                marginBottom: '15px',
                whiteSpace: 'pre-line',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                {formattedResult}
              </div>
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>
                  Voir la réponse JSON brute
                </summary>
                <pre style={{ 
                  backgroundColor: '#f1f3f4', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <p>Exécutez une requête pour voir les résultats</p>
          )}
        </div>
      </main>
    </div>
  );
}