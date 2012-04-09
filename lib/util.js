var status = {
  'new': 'N',
  'rejected': 'R',
  'accepted': 'A',
  'flagged': 'F'
};

function currentIso() {
  return new Date().toISOString();
}

function isoToLocale(date) {
  return new Date(Date.parse(date)).toLocaleDateString();
}

exports.status = status;
exports.date = {
  currentIso: currentIso,
  isoToLocale: isoToLocale
};