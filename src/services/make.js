// Intégration Make.com (automatisation) : export des matchs vers Google Sheets
//
// Principe:
// - Le frontend envoie un payload JSON à un Webhook Make
// - Make "Google Sheets > Add a row" ajoute une ligne dans un tableau
//
// Configuration:
// - REACT_APP_MAKE_MATCH_EXPORT_WEBHOOK_URL : URL du webhook Make (module "Custom webhook")

const WEBHOOK_URL = process.env.REACT_APP_MAKE_MATCH_EXPORT_WEBHOOK_URL;

const safeJoinNames = (players = []) => players.map((p) => p?.name).filter(Boolean).join(' / ');

export const buildMatchExportPayload = (match) => {
  if (!match) return null;

  const team1Names = safeJoinNames(match.team1?.players);
  const team2Names = safeJoinNames(match.team2?.players);

  const endDateIso = match.endDate || new Date().toISOString();
  const winner =
    (match.team1?.score ?? 0) > (match.team2?.score ?? 0)
      ? 'team1'
      : (match.team2?.score ?? 0) > (match.team1?.score ?? 0)
        ? 'team2'
        : 'draw';

  return {
    event: 'match_finished',
    matchId: match.id,
    type: match.type || 'officiel',
    status: match.status || 'terminé',
    endDate: endDateIso,
    team1Players: team1Names,
    team2Players: team2Names,
    team1Score: match.team1?.score ?? 0,
    team2Score: match.team2?.score ?? 0,
    referee: match.referee?.name || '',
    bet: match.bet || '',
    winner,
  };
};

export const exportMatchToMake = async (match) => {
  if (!WEBHOOK_URL) return { skipped: true, reason: 'WEBHOOK_URL_NOT_SET' };

  const payload = buildMatchExportPayload(match);
  if (!payload) return { skipped: true, reason: 'NO_MATCH' };

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Make webhook error (${res.status}): ${text || 'no body'}`);
  }

  return { ok: true };
};

export const hasMatchBeenExported = (matchId) => {
  try {
    return localStorage.getItem(`babyleague_make_exported_match_${matchId}`) === '1';
  } catch {
    return false;
  }
};

export const markMatchExported = (matchId) => {
  try {
    localStorage.setItem(`babyleague_make_exported_match_${matchId}`, '1');
  } catch {
    // ignore
  }
};

